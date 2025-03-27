import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the elements
const loginItem = document.getElementById("loginItem");
const logoutItem = document.getElementById("logoutItem");
const logoutButton = document.getElementById("logoutButton");

// Check if user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log("User is logged in:", user);

        // Show the logout button and hide the login button
        if (loginItem) {
            loginItem.style.display = "none";
        }
        if (logoutItem) {
            logoutItem.style.display = "block";
        }
    } else {
        // User is logged out
        console.log("No user is logged in.");

        // Show the login button and hide the logout button
        if (loginItem) {
            loginItem.style.display = "block";
        }
        if (logoutItem) {
            logoutItem.style.display = "none";
        }
    }
});

// Logout functionality
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            console.log("User logged out.");
            window.location.href = "index.html"; // Redirect to the homepage after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    });
}
