// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// remove later
console.log("Firebase initialized");

document.addEventListener("DOMContentLoaded", function() {

// Handle form submission
    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const DOB = document.getElementById("DOB").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const phoneNumber = document.getElementById("phoneNumber").value;
        const passwordMatchMessage = document.getElementById("passwordMatchMessage");

        // password validation
        const passwordRequirements = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!password.match(passwordRequirements)) {
            alert("Password must be at least 8 characters, include an uppercase letter, and a number.");
            return;
        }

        if (password !== confirmPassword) {
            passwordMatchMessage.textContent = "Passwords do not match!";
            passwordMatchMessage.style.color = "red";
            return;
        } else {
            passwordMatchMessage.textContent = ""; // Clear message if passwords match
        }

        try {
            console.log("Submitting form...");
            
            // Create authentication user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password); 
            const user = userCredential.user;

            // Ensure the user is authenticated before writing to Firestore
            if (user) {
                console.log("User created successfully:", user.uid);

                console.log("Writing to Firestore at path: /users/" + user.uid);  // Log the path
                // Store additional user info in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    DOB: DOB,
                    email: email,
                    phoneNumber: phoneNumber,
                    uid: user.uid,
                    createdAt: new Date()
                });

                alert("User registered successfully!");
                registrationForm.reset();
                window.location.href = "loginregister.html";  // Redirect to login page
            } else {
                throw new Error("User authentication failed.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert(error.message);
        }
    });
});