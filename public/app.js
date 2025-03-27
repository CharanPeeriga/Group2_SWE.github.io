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
// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);
        // Hide the login/register list item if the user is logged in
        if (loginRegisterItem) {
            loginRegisterItem.style.display = "none";
        }
    } else {
        // User is not signed in
        console.log("No user is logged in.");
        // Show the login/register list item if the user is not logged in
        if (loginRegisterItem) {
            loginRegisterItem.style.display = "block";
        }
    }
});

document.addEventListener('DOMContentLoaded', function() 
{
    const eventQuery = new URLSearchParams(window.location.search).get('event');

    if (eventQuery) 
        {
        const eventID = document.getElementById('eventID');
        const event_description = document.getElementById('event_description');
        const event_date = document.getElementById('event_date');
        const event_time = document.getElementById('event_time');
        const event_location = document.getElementById('event_location');
        
        switch (eventQuery) 
        {
            case '1':
                eventID.textContent = "Mindfulness Conference";
                event_description.textContent = "Take a break from the strenuous day-to-day and join us for an exploration in rest and relaxation!";
                event_date.textContent = "On: March 31, 2025";
                event_time.textContent = "From: 10:00am - 12:00pm"
                event_location.textContent = "At: Cobb Galleria Centre";
                break;
            case '2':
                eventID.textContent = "Music Festival";
                event_description.textContent = "Come see your favorite artists for ONE NIGHT ONLY!";
                event_date.textContent = "On: April 19, 2025";
                event_time.textContent = "From: 2:00pm - 5:00pm"
                event_location.textContent = "At: Piedmont Park";
                break;
            case '3':
                eventID.textContent = "Museum Tour";
                event_description.textContent = "Experience our newest exhibit on prehistoric culture";
                event_date.textContent = "On: May 23, 2025";
                event_time.textContent = "From: 11:00am - 2:00pm"
                event_location.textContent = "At: High Museum";
                break;
            default:
                eventID.textContent = "Event Not Found";
                event_description.textContent = "Sorry, this event does not exist.";
                break;
        }

        const bookEventBtn = document.getElementById('bookEventBtn');
        bookEventBtn.addEventListener('click', function() 
        {
            alert("Congrats on your booking!");
        });
    }

});
