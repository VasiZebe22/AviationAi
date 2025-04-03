# Debug Firebase Authentication Errors and Improve User Feedback

This document outlines the plan to investigate and fix errors occurring during login attempts by users with unverified emails, and to implement proper user feedback.

## Task Description

Users attempting to log in without verifying their email encounter console errors (`400 Bad Request` for `sendOobCode`, `auth/too-many-requests`, and a custom "Please verify" error). The user interface does not provide any notification about the login failure reason.

## Current Status

- [ ] Investigate code in `firebase.js`, `AuthContext.js`, and `Login.js`.
- [ ] Clarify desired user experience for unverified login attempts.
- [ ] Develop detailed implementation plan.
- [ ] Review and approve plan.
- [ ] Implement changes in Code mode.
- [ ] Verify the fix.

## Plan

1.  [x] **Modify `frontend/src/services/firebase.js` (`signIn` function):**
    *   [x] Remove the `sendEmailVerification(userCredential.user)` call within the `if (!userCredential.user.emailVerified)` block to prevent unnecessary resends and rate-limiting errors.
2.  [x] **Modify `frontend/src/contexts/AuthContext.js`:**
    *   [x] Adjust `onAuthChange` listener to prevent setting `currentUser` to `null` prematurely for unverified users, avoiding intermediate state changes.
    *   [x] Adjust `login` function's `catch` block to *not* clear `currentUser`/`sessionId` state when the specific verification error is thrown, preventing unnecessary re-renders triggered by the context.
3.  [x] **Modify `frontend/src/pages/Login/Login.js`:**
    *   [x] Modify `handleSubmit`'s `catch` block to correctly identify the verification error.
    *   [x] Import `toast` directly from `react-toastify`.
    *   [x] Remove usage of custom `useToast` hook.
    *   [x] Call `toast.warning(...)` or `toast.error(...)` directly within the `catch` block to bypass custom context interference and ensure the toast displays despite component re-renders.
4.  [x] **Modify `frontend/src/App.js`:**
    *   [x] Remove duplicate `<ToastContainer />` instance.
5.  [x] **Update Documentation:** Mark implemented steps as complete.

## Verification Steps

1.  [ ] Sign up with a new email address.
2.  [ ] Attempt to log in with the new, unverified email address *before* clicking the verification link in the email.
3.  [x] Verify that the login fails.
4.  [x] Verify that a toast message appears (using standard react-toastify styling) specifically stating "Please verify your email address. Check your inbox."
5.  [x] Verify that no `400 Bad Request` or `auth/too-many-requests` errors appear in the console related to `sendOobCode`.
6.  [x] Verify that the `AuthContext login failed: Error: Please verify your email address...` message still appears in the console.
7.  [x] Click the verification link in the email.
8.  [x] Attempt to log in again with the now verified email address.
9.  [x] Verify that the login succeeds and the user is redirected to the dashboard.
10. [x] Test login with an incorrect password to ensure other error messages (e.g., "Incorrect password.") still work correctly using the standard toast.