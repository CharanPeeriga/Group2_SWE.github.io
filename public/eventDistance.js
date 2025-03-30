import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import {firebaseConfig} from "./firebase-config.js"

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// HTML elements
const getLocationBtn = document.getElementById('getLocationBtn');
const locationDisplay = document.getElementById('locationDisplay');

let userLatitude = null;
let userLongitude = null;

// Add event listener to the location button
getLocationBtn.addEventListener('click', async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;

                //locationDisplay.textContent = `Location: Latitude ${userLatitude}, Longitude ${userLongitude}`;
                
                /*
                console.log(`User location: ${userLatitude}, ${userLongitude}`);
                */
               
                // After getting location, sort events by distance
                await sortEventsByDistance(userLatitude, userLongitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                locationDisplay.textContent = "Error: Unable to retrieve location.";
            }
        );
    } else {
        locationDisplay.textContent = "Geolocation is not supported by this browser.";
    }
});

//math to calculate distance from user
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}


// Sort and display events by distance
async function sortEventsByDistance(lat, lon) {
    if (!lat || !lon) return;

    const eventsList = document.getElementById('events');
    eventsList.innerHTML = `<p>Sorting events by distance...</p>`;

    try {
        const querySnapshot = await getDocs(collection(db, "events"));

        let events = [];

        for (const doc of querySnapshot.docs) {
            const event = doc.data();

            // Geocode the address to get coordinates
            const coords = await getCoordinates(event.location);

            if (coords) {
                event.latitude = coords.latitude;
                event.longitude = coords.longitude;

                // Calculate distance
                const distance = getDistance(lat, lon, event.latitude, event.longitude);
                event.distance = distance;

                events.push(event);
            } else {
                console.warn(`Could not geocode event: ${event.event_name}`);
            }
        }

        // Sort by distance (closest first)
        events.sort((a, b) => a.distance - b.distance);

        // Clear and display the sorted events
        eventsList.innerHTML = '';

        events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });

    } catch (error) {
        console.error("Error sorting events:", error);
        eventsList.innerHTML = `<p>Error sorting events by distance. Please try again later.</p>`;
    }
}


// Function to fetch latitude and longitude from address using Google Geocoding API
async function getCoordinates(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${firebaseConfig.geoCodingAPIKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        } else {
            console.warn(`Geocoding failed for: ${address}`, data.status);
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card');

    let startTime;
    try {
        startTime = event.start_time.toDate().toLocaleString();
    } catch (error) {
        startTime = event.start_time;
    }

    // Display distance if available
    const distanceText = event.distance !== undefined
        ? `<p><strong>Distance:</strong> ${event.distance.toFixed(2)} mi</p>`
        : '';

    eventCard.innerHTML = `
        <h3>${event.event_name}</h3>
        <p><strong>Category:</strong> ${event.event_category}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Start:</strong> ${startTime}</p>
        ${distanceText}
    `;

    eventCard.onclick = () => {
        const eventDetails = encodeURIComponent(JSON.stringify(event));
        window.location.href = `transactionpage.html?event=${eventDetails}`;
    };

    return eventCard;
}
