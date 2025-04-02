# Plan: Debug and Fix Concurrent Session Enforcement

**Goal:** Ensure that only one active session per user account is allowed. When a user logs in on a new device/browser, any existing sessions for that user should be automatically logged out. This is critical for preventing account sharing for the paid service.

**Problem:** Testing revealed that logging in on a second device does not currently log out the session on the first device, indicating a bug in the implementation.

**Intended Mechanism (Recap):**
1.  Login generates a unique `sessionId`.
2.  `sessionId` is stored in Realtime Database at `sessions/<userId>`, overwriting any previous value.
3.  Active clients monitor this database path using `monitorSession` (`onValue` listener).
4.  If the database `sessionId` changes and doesn't match the client's `sessionId`, the `handleSessionInvalid` callback is triggered.
5.  `handleSessionInvalid` clears local state and redirects the client to `/login`.

---

## Debugging Steps

1.  [X] **Verify Database Writes:** (Passed)
    *   Add `console.log` in `frontend/src/services/firebase.js` within `createSession` *after* the `set` call to confirm the `userId`, generated `sessionId`, and the database path (`sessions/${userId}`) being written to.
    *   Manually inspect the Firebase Realtime Database console while logging in on two devices to see if the `sessionId` value for the specific `userId` is actually being updated/overwritten by the second login.

2.  [X] **Verify Database Reads (Listener):** (Passed, but revealed config/permission issues)
    *   Add `console.log` statements inside the `onValue` callback within `monitorSession` in `frontend/src/services/firebase.js`:
        *   Log when the listener fires.
        *   Log the `snapshot.val()` (the data received from the database).
        *   Log the `currentSessionId` that the function received as an argument.
        *   Log whether the condition `!sessionData || sessionData.sessionId !== currentSessionId` evaluates to true or false.

3.  [X] **Verify Callback Trigger:** (Passed after fixing prerequisites)
    *   Add `console.log` at the beginning of `handleSessionInvalid` in `frontend/src/contexts/AuthContext.js` to see if it's ever being invoked during the concurrent login test.

4.  [X] **Trace State:** (Revealed `sessionId` was null on load)
    *   Add `console.log` in the `useEffect` hook (lines 64-80) in `frontend/src/contexts/AuthContext.js` to log the `currentUser?.user?.uid` and `sessionId` *just before* `monitorSession` is called. This helps ensure the listener is set up with the correct initial state.
    *   Add `console.log` in the `login` function of `AuthContext.js` *after* `setSessionId` is called to confirm the state update timing.

---

## Potential Fix Areas (Based on Debugging Results)

*   Incorrect database path being written to or listened on.
*   Timing issue with `sessionId` state update vs. `monitorSession` listener attachment in `AuthContext`.
*   Problem with the `onValue` listener itself (less likely, but possible).
*   Incorrect comparison logic within `monitorSession`.

---

## Verification

*   [X] After applying a fix, repeat the concurrent login test:
    *   Log in on Device/Browser 1.
    *   Log in on Device/Browser 2 with the same account.
    *   Confirm that Device/Browser 1 is automatically logged out and redirected to `/login` within a reasonable time (e.g., 5-15 seconds).

---

## Progress Tracking

*   [X] Debugging Step 1 Completed
*   [X] Debugging Step 2 Completed
*   [X] Debugging Step 3 Completed
*   [X] Debugging Step 4 Completed
*   [X] Root Cause Identified: `sessionId` state was not set on page load/refresh in `AuthContext`, preventing `monitorSession` attachment. Also required fixing `databaseURL` config and Realtime Database security rules.
*   [X] Fix Implemented: Multiple fixes were required:
    1.  **Firebase Config:** Added `databaseURL` to `firebaseConfig` in `frontend/src/services/firebase.js`, reading from `REACT_APP_FIREBASE_DATABASE_URL` environment variable. This is essential for Realtime Database operations.
    2.  **Database Rules:** Updated Realtime Database security rules to allow authenticated users read/write access *only* to their own session data (`sessions/$uid`). Replaced insecure default/previous rules.
    3.  **Refactored Login Flow:**
        *   Modified `signIn` function (`firebase.js`) to *only* handle Firebase authentication and return the `userCredential`. Removed `createSession` call from `signIn`.
        *   Modified `login` function (`AuthContext.js`) to orchestrate the sequence: call `signIn`, then call `createSession`, then set the `sessionId` state.
        *   Modified `onAuthChange` listener (`AuthContext.js`) to *only* set the `currentUser` state, removing the previous logic that attempted (and failed due to timing) to fetch the session ID here.
    4.  **Listener Cleanup:** Ensured the `useEffect` hook responsible for `monitorSession` correctly cleans up (unsubscribes) the listener when component unmounts or dependencies change. Passed the specific `unsubscribe` function to `handleSessionInvalid` to ensure immediate detachment upon invalidation, preventing race conditions.
*   [X] Verification Completed: Confirmed older session logs out upon new login, and single-device login remains stable.

---

## Session Check Mechanism (How it Works Now)

The check for concurrent sessions happens in **real-time** thanks to the Firebase Realtime Database listener (`onValue`):

1.  **Listener Attachment:** When a user successfully logs in, the `AuthContext.login` function creates a session ID and stores it in the component's state. A `useEffect` hook in `AuthContext` detects the presence of both `currentUser` and `sessionId` state and calls the `monitorSession` function (`firebase.js`). `monitorSession` attaches an `onValue` listener to the specific database path `sessions/<userId>`, remembering the `sessionId` it expects for the current browser session.
2.  **Real-time Updates:** The `onValue` listener maintains an active connection. It fires immediately with the current data and then again *any time* the data at `sessions/<userId>` changes in the database.
3.  **Invalidation Check:** Every time the listener fires, it compares the `sessionId` currently stored in the database with the `sessionId` that this specific browser session expects (the one it was attached with).
4.  **Logout Trigger:** If the database `sessionId` does *not* match the expected `sessionId` (meaning another device has logged in and overwritten it), the listener calls the `handleSessionInvalid` callback in `AuthContext`. This callback immediately unsubscribes the listener and then clears the local user state, redirecting the user to the login page.