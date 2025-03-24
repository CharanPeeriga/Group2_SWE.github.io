import {firebaseConfig} from "./firebase-config.js"


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("loginModal");
    const loginButton = document.getElementById("loginBtn");
    const closeButton = document.getElementById("closeModal");

    // Handle login modal open/close
    loginButton.addEventListener("click", function(event) {
        event.preventDefault();
        modal.style.display = "block";
    });

    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Login checks
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent page reload

        //inputs
        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();


        //replace with user database fire thing
        let users = [
            { username: "user1", password: "password123" },
            { username: "admin1", password: "admin123" }
        ];

        let user = users.find(u => u.username === username && u.password === password);

        if (user) {
            alert("Login successful! Redirecting...");
            window.location.href = "event-portal.html"; // Redirect after login
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
});
