/*
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import {firebaseConfig} from "./firebase-config.js"


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
console.log("Firebase initialized");

// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);

        
    } else {
        // User is not signed in
        console.log("No user is logged in.");
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const eventsList = document.getElementById('events');
    const categorySelect = document.getElementById('categorySelect');
    const eventSearch = document.getElementById('eventSearch');
    let events = [];

    // Fetch events from Firebase
    try {
        console.log("Fetching events...");

        const querySnapshot = await getDocs(collection(db, "events"));

        if (querySnapshot.empty) {
            eventsList.innerHTML = `<p>No events found.</p>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const event = doc.data();
            events.push(event);

            //create event card for each event
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });

    } catch (error) {
        console.error("Error fetching events:", error);
        eventsList.innerHTML = `<p>Error loading events. Please try again later.</p>`;
    }

    //listener to filter through events based on category
    categorySelect.addEventListener('change', () => {
        filterEvents(categorySelect.value, eventSearch.value, events);
    });

    //listener to filter through events based on characters in search bar
    eventSearch.addEventListener('input', () => {
        filterEvents(categorySelect.value, eventSearch.value, events);
    });

    //start by showing all events
    function filterEvents(category, searchTerm, events) {
        eventsList.innerHTML = '';  //clears the currently event cards currently showing

        //filter events based on category and characters in search bar  
        const filteredEvents = events.filter(event => {
            const matchesCategory = category ? event.event_category === category : true;
            const matchesSearchTerm = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearchTerm;
        });

        //now only show event cards that match the filters
        if (filteredEvents.length === 0) {
            eventsList.innerHTML = `<p>No events found matching your filters.</p>`;
        }

        filteredEvents.forEach(event => {
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });
    }
 

    // //event card elements
    function createEventCard(event) {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');

        //how start time is displayed on event card
        let startTime;
        try {
            startTime = event.start_time.toDate().toLocaleString();
        } catch (error) {
            startTime = event.start_time;
        }

        //information on event card
        eventCard.innerHTML = `
            <h3>${event.event_name}</h3>
            <p><strong>Category:</strong> ${event.event_category}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Start:</strong> ${startTime}</p>
        `;

        //move to transaction page when event card is clicked
        eventCard.onclick = () => {
            const eventDetails = encodeURIComponent(JSON.stringify(event));
            window.location.href = `transactionpage.html?event=${eventDetails}`;
        };

        return eventCard;
    }
});
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import {firebaseConfig} from "./firebase-config.js"


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
console.log("Firebase initialized");

// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);

        
    } else {
        // User is not signed in
        console.log("No user is logged in.");
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const eventsList = document.getElementById('events');
    const categorySelect = document.getElementById('categorySelect');
    const eventSearch = document.getElementById('eventSearch');
    let events = [];

    // Fetch events from Firebase
    try {
        console.log("Fetching events...");

        const querySnapshot = await getDocs(collection(db, "events"));

        if (querySnapshot.empty) {
            eventsList.innerHTML = `<p>No events found.</p>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const event = doc.data();
            events.push(event);

            //create event card for each event
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });

    } catch (error) {
        console.error("Error fetching events:", error);
        eventsList.innerHTML = `<p>Error loading events. Please try again later.</p>`;
    }

    //listener to filter through events based on category
    categorySelect.addEventListener('change', () => {
        filterEvents(categorySelect.value, eventSearch.value, events);
    });

    //listener to filter through events based on characters in search bar
    eventSearch.addEventListener('input', () => {
        filterEvents(categorySelect.value, eventSearch.value, events);
    });

    //start by showing all events
    function filterEvents(category, searchTerm, events) {
        eventsList.innerHTML = '';  //clears the currently event cards currently showing

        //filter events based on category and characters in search bar  
        const filteredEvents = events.filter(event => {
            const matchesCategory = category ? event.event_category === category : true;
            const matchesSearchTerm = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearchTerm;
        });

        //now only show event cards that match the filters
        if (filteredEvents.length === 0) {
            eventsList.innerHTML = `<p>No events found matching your filters.</p>`;
        }

        filteredEvents.forEach(event => {
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });
    }
 

    // //event card elements
    function createEventCard(event) {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');

        //how start time is displayed on event card
        let startTime;
        try {
            startTime = event.start_time.toDate().toLocaleString();
        } catch (error) {
            startTime = event.start_time;
        }

        //information on event card
        eventCard.innerHTML = `
            <h3>${event.event_name}</h3>
            <p><strong>Category:</strong> ${event.event_category}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Start:</strong> ${startTime}</p>
        `;

        //move to transaction page when event card is clicked
        eventCard.onclick = () => {
            const eventDetails = encodeURIComponent(JSON.stringify(event));
            window.location.href = `transactionpage.html?event=${eventDetails}`;
        };

        return eventCard;
    }
});