import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Use the same version here
import { firebaseConfig } from "./firebase-config.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// Logout functionality
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            console.log("User logged out.");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    });
}

// Remove loading indicator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Fetch user's booked events from Firestore
    db.collection('bookings').get()
        .then((querySnapshot) => {
            const eventsList = document.getElementById('eventsList');
            // Clear loading indicator
            eventsList.innerHTML = '';
            
            if (querySnapshot.empty) {
                eventsList.innerHTML = '<div class="no-events"><i class="fas fa-calendar-times fa-3x"></i><h3>No events booked yet</h3><p>Explore our event database to find exciting events to attend!</p></div>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const event = doc.data();
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');
                eventElement.innerHTML = `
                    <h3>${event.eventName}</h3>
                    <p><i class="fas fa-align-left"></i> ${event.eventDescription}</p>
                    <p><i class="fas fa-calendar-day"></i> ${event.eventDate}</p>
                    <p><i class="fas fa-clock"></i> ${event.eventTime}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.eventLocation}</p>
                    <button class="button cancel-button" data-id="${doc.id}"><i class="fas fa-times-circle"></i> Cancel Booking</button>
                `;
                eventsList.appendChild(eventElement);
            });
            
            // Add event listener for cancel buttons
            document.querySelectorAll('.cancel-button').forEach(button => {
                button.addEventListener('click', function() {
                    const bookingId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to cancel this booking?')) {
                        db.collection('bookings').doc(bookingId).delete()
                            .then(() => {
                                alert('Booking canceled successfully!');
                                location.reload();
                            })
                            .catch(error => {
                                console.error("Error removing booking: ", error);
                                alert('Error canceling booking. Please try again.');
                            });
                    }
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching events: ", error);
            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle fa-2x"></i><p>Error loading events. Please try again later.</p></div>';
        });
});