import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Use the same version here
import { firebaseConfig } from "./firebase-config.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const loginRegisterItem = document.getElementById("loginRegisterItem");
const userPortalItem = document.getElementById("userPortalItem");
const getStartedButton = document.getElementById("getStartedButton");
// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);
        // Hide the login/register list item if the user is logged in
        if (loginRegisterItem) {
            loginRegisterItem.style.display = "none";
        }
        
        getStartedButton.style.display = "none";


    } else {
        // User is not signed in
        console.log("No user is logged in.");
        // Show the login/register list item if the user is not logged in
        if (loginRegisterItem) {
            loginRegisterItem.style.display = "block";
        }
        if (userPortalItem) {
            userPortalItem.style.display = "none";
        }
    }
});
