import { firebaseConfig } from "./firebase-config.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("loginModal");
    const loginButton = document.getElementById("loginBtn");
    const closeButton = document.getElementById("closeModal");
    const messageBox = document.getElementById("loginMessage");

    // Handle login modal open/close
    loginButton.addEventListener("click", function (event) {
        event.preventDefault();
        modal.style.display = "block";
    });

    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Login checks
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        // Inputs
        let email = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();
        /*
        ADD BACK WHEN FEATURE READY
        let confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value.trim() : null;

        if (confirmPassword) {
            if (password !== confirmPassword) {
                messageBox.textContent = "Passwords do not match. Please try again.";
                messageBox.style.color = "red";
                messageBox.style.display = "block";
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    messageBox.textContent = "Registration successful! Redirecting...";
                    messageBox.style.color = "green";
                    messageBox.style.display = "block"; // Ensure it's visible
                    setTimeout(() => {
                        window.location.href = "event-portal.html"; // Redirect after registration
                    }, 2000);
                })
                .catch((error) => {
                    messageBox.textContent = "Error during registration. Please try again.";
                    messageBox.style.color = "red";
                    messageBox.style.display = "block";
                });
        } else { */
        // Firebase Authentication
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                messageBox.textContent = "Login successful! Redirecting...";
                messageBox.style.color = "green";
                setTimeout(() => {
                    window.location.href = "event-portal.html"; // Redirect after login
                }, 2000);
            })
            .catch((error) => {
                messageBox.textContent = "Invalid username or password. Please try again.";
                messageBox.style.color = "red";
                messageBox.style.display = "block"; // Ensure it's visible
            });
    });
});