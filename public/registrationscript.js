// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMWv6HtYj9UfkTZIf5ry9xfXnTPL20WMA",
    authDomain: "event-pulse-8d1a8.firebaseapp.com",
    databaseURL: "https://event-pulse-8d1a8-default-rtdb.firebaseio.com",
    projectId: "event-pulse-8d1a8",
    storageBucket: "event-pulse-8d1a8.firebasestorage.app",
    messagingSenderId: "956330318068",
    appId: "1:956330318068:web:17a10f1584bd229e48a6a1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// remove later
console.log("Firebase initialized");

// Handle form submission
const registrationForm = document.getElementById("registrationForm");

registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const DOB = document.getElementById("DOB").value;
    const email = document.getElementById("userEmail").value;
    const password = document.getElementById("userPassword").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
  
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

