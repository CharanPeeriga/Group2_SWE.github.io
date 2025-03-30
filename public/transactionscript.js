import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isLoggedIn = false;



// URL parameters and event details
const urlParams = new URLSearchParams(window.location.search);
const eventDetails = JSON.parse(decodeURIComponent(urlParams.get('event')));

// Event details display
const eventDetailsDiv = document.getElementById('eventDetails');
eventDetailsDiv.innerHTML = `
    <p><strong>Event Name:</strong> ${eventDetails.event_name}</p>
    <p><strong>Category:</strong> ${eventDetails.event_category}</p>
    <p><strong>Location:</strong> ${eventDetails.location}</p>
    <p><strong>Start Time:</strong> ${new Date(eventDetails.start_time.seconds * 1000).toLocaleString()}</p>
    <p><strong>End Time:</strong> ${new Date(eventDetails.end_time.seconds * 1000).toLocaleString()}</p>
    <p><strong>Description:</strong> ${eventDetails.event_description}</p>
    <p><strong>Price:</strong> $${eventDetails.price || 0}</p>
    <p><strong>Attendees:</strong> ${eventDetails.current_attendees_count} / ${eventDetails.max_capacity}</p>
    <p><strong>Privacy Type:</strong> ${eventDetails.privacy_type}</p>
    <p><strong>Cancellation Policy:</strong> ${eventDetails.cancellation_policy}</p>
`;

// Confirmation message and button
const bookNowBtn = document.getElementById('bookNowBtn');
const confirmationMessage = document.getElementById('confirmationMessage');

// Check if the user is logged in or not
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);

        user = auth.currentUser;

        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        const currentBookings = Array.isArray(userData.bookings) ? userData.bookings : [];

        if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
            bookNowBtn.style.display = "none";
            confirmationMessage.textContent = "You have already booked this event!";
        }

        confirmationMessage.classList.remove('hidden');
        bookNowBtn.onclick = async () => {
            try {
            
            if (userSnapshot.exists()) {
                

                //makes sure the event has not already been booked
                if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
                    confirmationMessage.innerHTML = `<p>You have already booked this event: ${eventDetails.event_name}.</p>`;
                } else {
                    //creates an object in the array that contains all of the event information
                    const eventBooking = {
                        event_name: eventDetails.event_name,
                        event_category: eventDetails.event_category,
                        location: eventDetails.location,
                        start_time: eventDetails.start_time,
                        end_time: eventDetails.end_time,
                        event_description: eventDetails.event_description,
                        price: eventDetails.price || 0,
                        current_attendees_count: eventDetails.current_attendees_count,
                        max_capacity: eventDetails.max_capacity,
                        privacy_type: eventDetails.privacy_type,
                        cancellation_policy: eventDetails.cancellation_policy
                    };

                    //pushes the event to the bookings array
                    currentBookings.push(eventBooking);

                    // Update the bookings array with the newly added event included
                    await updateDoc(userRef, {
                        bookings: currentBookings //stores event bookings as objects
                    });
                    bookNowBtn.style.display = "none";

                    confirmationMessage.innerHTML = `<p>Congratulations! You have successfully booked the event: ${eventDetails.event_name}.</p>`;
                }
            }

        } catch (error) {
            console.error("Error adding event to bookings:", error);
            confirmationMessage.innerHTML = `<p>Error booking the event. Please try again.</p>`;
            }
        }
        
        
    } else {
        // User is not signed in
        console.log("No user is logged in.");

        bookNowBtn.textContent = "Login to book";
        bookNowBtn.onclick = async () => {
            window.location.href = "loginregister.html";
        }
    }
});

//Book events and add them to firebase under the registration information when book now is clicked
bookNowBtn.onclick = async () => {
    const user = auth.currentUser;
    if (isLoggedIn)//if an authorized user is logged in
        {
        confirmationMessage.classList.remove('hidden');

        try 
        {
            //gets specific user information for currently logged in user from database
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            //gets the last updated information for user data
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                //makes sure that the 'bookings' collection is formatted as an array
                const currentBookings = Array.isArray(userData.bookings) ? userData.bookings : [];

                //makes sure the event has not already been booked
                if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
                    confirmationMessage.innerHTML = `<p>You have already booked this event: ${eventDetails.event_name}.</p>`;
                } else {
                    //creates an object in the array that contains all of the event information
                    const eventBooking = {
                        event_name: eventDetails.event_name,
                        event_category: eventDetails.event_category,
                        location: eventDetails.location,
                        start_time: eventDetails.start_time,
                        end_time: eventDetails.end_time,
                        event_description: eventDetails.event_description,
                        price: eventDetails.price || 0,
                        current_attendees_count: eventDetails.current_attendees_count,
                        max_capacity: eventDetails.max_capacity,
                        privacy_type: eventDetails.privacy_type,
                        cancellation_policy: eventDetails.cancellation_policy
                    };

                    //pushes the event to the bookings array
                    currentBookings.push(eventBooking);

                    // Update the bookings array with the newly added event included
                    await updateDoc(userRef, {
                        bookings: currentBookings //stores event bookings as objects
                    });

                    confirmationMessage.innerHTML = `<p>Congratulations! You have successfully booked the event: ${eventDetails.event_name}.</p>`;
                }
            }

        } catch (error) {
            console.error("Error adding event to bookings:", error);
            confirmationMessage.innerHTML = `<p>Error booking the event. Please try again.</p>`;
        }
    } else {
        confirmationMessage.innerHTML = `<p>You need to be logged in to book an event.</p>`;
    }
};



