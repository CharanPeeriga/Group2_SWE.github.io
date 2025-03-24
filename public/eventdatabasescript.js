import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {firebaseConfig} from "./firebase-config.js"


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized");
document.addEventListener('DOMContentLoaded', async () => {
    const eventsList = document.getElementById('events');

    try {
        console.log("Fetching events...");

        // Use modular syntax to fetch events
        const querySnapshot = await getDocs(collection(db, "events"));

        if (querySnapshot.empty) {
            eventsList.innerHTML = `<li>No events found.</li>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const event = doc.data();

            // Create a list item for each event
            const li = document.createElement('li');
            li.classList.add('event-item');

            // Format date/time properly
            const startTime = event.start_time.toDate().toLocaleString();
            const endTime = event.end_time.toDate().toLocaleString();

            // Display event details
            li.innerHTML = `
                <h3>${event.event_name}</h3>
                <p><strong>Category:</strong> ${event.event_category}</p>
                <p><strong>Description:</strong> ${event.event_description}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Price:</strong> $${event.price.toFixed(2)}</p>
                <p><strong>Start:</strong> ${startTime}</p>
                <p><strong>End:</strong> ${endTime}</p>
                <p><strong>Attendees:</strong> ${event.current_attendees_count} / ${event.max_capacity}</p>
                <p><strong>Privacy:</strong> ${event.privacy_type}</p>
                <p><strong>Cancellation Policy:</strong> ${event.cancellation_policy}</p>
            `;

            eventsList.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching events:", error);
        eventsList.innerHTML = `<li>Error loading events. Please try again later.</li>`;
    }
});