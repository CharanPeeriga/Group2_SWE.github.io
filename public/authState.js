import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {firebaseConfig} from "./firebase-config.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);

        // Show user info on the navbar or profile
        const userDisplay = document.getElementById("userDisplay");
        if (userDisplay) {
            userDisplay.textContent = `Welcome, ${user.email}`;
        }
    } else {
        console.log("User is not logged in.");
    }
});


// Logout functionality
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            console.log("User logged out.");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    });
}

