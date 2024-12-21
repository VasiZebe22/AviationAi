const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
    apiKey: "AIzaSyAXW3OEd_aa1brTr8O0ihqoWloyep4uXyI",
    authDomain: "aviationai-c5a89.firebaseapp.com",
    projectId: "aviationai-c5a89",
    storageBucket: "aviationai-c5a89.appspot.com",
    messagingSenderId: "387996596688",
    appId: "1:387996596688:web:YOUR_APP_ID" // You'll need to get this from Firebase Console
};

const clientApp = initializeApp(firebaseConfig);
const auth = getAuth(clientApp);

module.exports = { auth };
