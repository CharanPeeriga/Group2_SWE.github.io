
import { firebaseConfig } from "./firebase-config.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence before handling login
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Auth persistence set to local.");
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

// Login checks
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload

    console.log("TRYING TO LOGIN");
    // Inputs
    let email = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        Swal.fire({
            title: 'Welcome back!',
            text: `Welcome back, ${user.email}!`,
            confirmButtonColor: "#a72e2e",
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 10000,
            timerProgressBar: true
          }).then((result) => {
            window.location.href = "userportal.html";
          });

        // redirect to eventdatabase.html
        // window.location.href = "userportal.html";
    } catch (error) {
        console.log("Error signing in:", error);

        alert(`Error: ${error.message}`);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("loginModal");
    const loginButton = document.getElementById("loginBtn");
    // const closeButton = document.getElementById("closeModal");
    const messageBox = document.getElementById("loginMessage");

    // Handle login modal open/close
    // loginButton.addEventListener("click", function (event) {
    //     event.preventDefault();
    //     modal.style.display = "block";
    // });

    // closeButton.addEventListener("click", function () {
    //     modal.style.display = "none";
    // });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});


