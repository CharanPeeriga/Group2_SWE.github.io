import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


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
    <p><strong>Attendees:</strong> <span id="attendeeCount">${eventDetails.current_attendees_count}</span> / ${eventDetails.max_capacity}</p>
    <p><strong>Privacy Type:</strong> ${eventDetails.privacy_type}</p>
    <p><strong>Cancellation Policy:</strong> ${eventDetails.cancellation_policy}</p>
`;

// Confirmation message and button
const bookNowBtn = document.getElementById('bookNowBtn');
const confirmationMessage = document.getElementById('confirmationMessage');

// Check if the user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user);
        isLoggedIn = true;

        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.exists() ? userSnapshot.data() : {};
        const currentBookings = Array.isArray(userData.bookings) ? userData.bookings : [];

        if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
            bookNowBtn.style.display = "none";
            confirmationMessage.textContent = "You have already booked this event!";
            return;
        }

        // Attach event listener to button
        bookNowBtn.onclick = async () => {
            try {
                if (!userSnapshot.exists()) return;

                console.log(eventDetails.eventname, eventDetails.event_name)
                const eventId = fetchEventByName(eventDetails.event_name)

                if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
                    confirmationMessage.innerHTML = `<p>You have already booked this event: ${eventDetails.event_name}.</p>`;
                    return;
                }



                // Check if event ID exists
                if (!eventDetails.event_id) {
                    console.error("Error: event_id is undefined");
                    confirmationMessage.innerHTML = `<p>Error: Unable to book event.</p>`;
                    return;
                }

                // Ensure event is not over capacity
                if (eventDetails.current_attendees_count >= eventDetails.max_capacity) {
                    confirmationMessage.innerHTML = `<p>Sorry, this event is fully booked.</p>`;
                    return;
                }

                // Create event booking object
                const eventBooking = {
                    event_name: eventDetails.event_name,
                    event_category: eventDetails.event_category,
                    location: eventDetails.location,
                    start_time: eventDetails.start_time,
                    end_time: eventDetails.end_time,
                    event_description: eventDetails.event_description,
                    price: eventDetails.price || 0,
                    current_attendees_count: eventDetails.current_attendees_count + 1, // Increase count
                    max_capacity: eventDetails.max_capacity,
                    privacy_type: eventDetails.privacy_type,
                    cancellation_policy: eventDetails.cancellation_policy
                };

                // Update user's booking list
                await updateDoc(userRef, {
                    bookings: [...currentBookings, eventBooking]
                });

                // Increase attendee count in Firestore using increment()
                const eventRef = doc(db, 'events', eventDetails.event_id);
                await updateDoc(eventRef, {
                    current_attendees_count: increment(1)
                });

                // Update UI attendee count
                document.getElementById("attendeeCount").textContent = eventDetails.current_attendees_count + 1;

                bookNowBtn.style.display = "none";
                confirmationMessage.innerHTML = `<p>Congratulations! You have successfully booked the event: ${eventDetails.event_name}.</p>`;

            } catch (error) {
                console.error("Error adding event to bookings:", error);
                confirmationMessage.innerHTML = `<p>Error booking the event. Please try again.</p>`;
            }
        };

    } else {
        console.log("No user is logged in.");
        bookNowBtn.textContent = "Login to book";
        bookNowBtn.onclick = () => {
            window.location.href = "loginregister.html";
        };
    }
});

// Function to fetch event by name
async function fetchEventByName(eventName) {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("event_name", "==", eventName));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const eventDoc = querySnapshot.docs[0];  // Assuming event names are unique
        return { event_id: eventDoc.id, ...eventDoc.data() };
    } else {
        console.error("Event not found!");
        return null;
    }
}

// Fetch event if event_id is missing
if (!eventDetails.event_id) {
    fetchEventByName(eventDetails.event_name).then(fetchedEvent => {
        if (fetchedEvent) {
            eventDetails.event_id = fetchedEvent.event_id;
            console.log("Fetched Event ID:", eventDetails.event_id);
        }
    });
}
