// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {firebaseConfig} from "./firebase-config.js"

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
        /*
        ADD BACK WHEN CONFIRM PASSWORD FIELD IS ADDED
        const confirmPassword = document.getElementById("confirmPassword").value;
        */
        const phoneNumber = document.getElementById("phoneNumber").value;

        /*
        ADD BACK WHEN PASSWORD MATCH MESSAGE IS CREATED
        const passwordMatchMessage = document.getElementById("passwordMatchMessage");
        */

        /*
        ADD BACK WHEN PASSWORD MATCH FIELD IS CREATED
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
        */

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
                    createdAt: new Date(),
                    bookings:[]
                });

                Swal.fire({
                    title: 'Registered Successfully!',
                    text: `Registered Sucessfully!, ${user.email}!`,
                    confirmButtonColor: "#a72e2e",
                    icon: 'success',
                    confirmButtonText: 'OK',
                    timer: 10000,
                    timerProgressBar: true
                  }).then((result) => {
                    registrationForm.reset();
                    window.location.href = "loginregister.html";  // Redirect to login page
                  });
                
            } else {
                throw new Error("User authentication failed.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert(error.message);
        }
})});
