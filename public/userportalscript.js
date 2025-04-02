import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import { firebaseConfig } from "./firebase-config.js";
import { query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Logout functionality
const logoutButton = document.getElementById("logoutButton");

// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);
        // Show the logout button
        if (logoutButton) {
            logoutButton.style.display = "block";
        }

        // Fetch the user's first name from Firestore
        getUserFirstName(user.uid);
        
    } else {
        // User is not signed in
        console.log("No user is logged in.");
        // Hide the logout button
        if (logoutButton) {
            logoutButton.style.display = "none";
        }
    }
});

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

//Gets user's first name to be used for greeting in user portal
async function getUserFirstName(userId) 
{
    try 
    {
        const userDoc = await getDoc(doc(db, 'users', userId));
        //access the users collection in firebase
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const firstName = userData.firstName;

            //first name is in welcome message
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.innerHTML = `Welcome, to your user portal ${firstName}!`;
            }
        } else {
            console.log("No user document found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

//gets booked events that are present in the user's specific bookings collection
const loadBookedEvents = async () => {
    const user = auth.currentUser; //get the user who is currently logged in
    const eventListContainer = document.getElementById('eventList');

    if (user)//if this is an authenicated user
        {
        try {
            //Get user document reference
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                //Access bookings array from user data
                const bookings = userData.bookings || [];

                if (bookings.length > 0) {
                    //display booked events
                    eventListContainer.innerHTML = "<h3>Your Booked Events:</h3>";

                    //Loop through each booking and create event cards
                    bookings.forEach(event => {
                        const eventCard = createEventCard(event);
                        eventListContainer.appendChild(eventCard);
                    });
                } else {//if there are no bookings, stay on loading
                    eventListContainer.innerHTML = `
                    <g>Start booking some events!</g>
                        <div class="loading-indicator">
                            <i class="fas fa-spinner fa-spin fa-2x"></i>
                            <a>You have no booked events.</a>
                        </div>
                    `;
                }
            } else {
                eventListContainer.innerHTML = "<p>Unable to load your bookings.</p>";
            }
        } catch (error) {
            console.error("Error loading user bookings:", error);
            eventListContainer.innerHTML = "<p>There was an error loading your events. Please try again.</p>";
        }
    } else {
        eventListContainer.innerHTML = "<p>You need to be logged in to view your booked events.</p>";
    }
};

//how event cards are displayes
const createEventCard = (event) => {
    const card = document.createElement('div');
    card.classList.add('event-cardPORTAL');

    card.innerHTML = `
        <h1 class="event-title">${event.event_name}</h1>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Start Time:</strong> ${new Date(event.start_time.seconds * 1000).toLocaleString()}</p>
        <p><strong>End Time:</strong> ${new Date(event.end_time.seconds * 1000).toLocaleString()}</p>
        <p><strong>Cancellation Policy:</strong> ${event.cancellation_policy}</p>
    `;

    //modal when event cards are clicked to offer user two options
    card.onclick = () => openEventModal(event);

    return card;
};

//ensures that the user is logged in before loading the booked events
onAuthStateChanged(auth, (user) => {
    const eventListContainer = document.getElementById('eventList');
    
    if (user) {
        //If user is logged in, load the events
        loadBookedEvents();
    } else {
        //If user is not logged in, show a message
        eventListContainer.innerHTML = "<p>You need to be logged in to view your booked events.</p>";
    }
});

//how the modal is formatted
const openEventModal = (event) => {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('eventModalTitle');
    const modalDescription = document.getElementById('eventModalDescription');
    const viewDirectionsBtn = document.getElementById('viewDirectionsBtn');
    const cancelEventBtn = document.getElementById('cancelEventBtn');

    //specific content for modal
    modalTitle.textContent = event.event_name;
    modalDescription.innerHTML = `
        <strong>Category:</strong> ${event.event_category}<br>
        <strong>Location:</strong> ${event.location}<br>
        <strong>Start Time:</strong> ${new Date(event.start_time.seconds * 1000).toLocaleString()}<br>
        <strong>End Time:</strong> ${new Date(event.end_time.seconds * 1000).toLocaleString()}<br>
        <strong>Description:</strong> ${event.event_description}
        <strong>Attendees:</strong> ${event.current_attendees_count} / ${event.max_capacity}
    `;

    //display modal
    modal.style.display = "block";

    //if user chooses to view directions, taken to google maps
    viewDirectionsBtn.onclick = () => {
        window.open(`https://www.google.com/maps?q=${encodeURIComponent(event.location)}`, "_blank");

    };

    //if user chooses to cancel the event, remove it from the bookings
    cancelEventBtn.onclick = async () => {
        const user = auth.currentUser;
        if (user) {
            const confirmCancel = confirm("Are you sure you want to remove this event?");
            
            if (confirmCancel) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userRef);
    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        const currentBookings = Array.isArray(userData.bookings) ? userData.bookings : [];
    
                        // Remove the event from bookings
                        const updatedBookings = currentBookings.filter(booking => booking.event_name !== event.event_name);
                        
                        // Update the user's bookings
                        await updateDoc(userRef, { bookings: updatedBookings });
    
                        // Fetch the correct event ID
                        const eventsRef = collection(db, "events");
                        const q = query(eventsRef, where("event_name", "==", event.event_name));  // Fix typo
                        const querySnapshot = await getDocs(q);
                        
                        if (!querySnapshot.empty) {
                            const eventID = querySnapshot.docs[0].id;  // Correctly get the document ID
                            const eventRef = doc(db, 'events', eventID);
                            
                            // Ensure the event document exists before decrementing
                            const eventSnap = await getDoc(eventRef);
                            if (eventSnap.exists()) {
                                await updateDoc(eventRef, {
                                    current_attendees_count: increment(-1)
                                });
                                console.log("Event attendees decremented");
                            } else {
                                console.error("Event document does not exist in Firestore.");
                            }
                        } else {
                            console.error("Event not found in Firestore.");
                        }
    
                        // Hide modal and refresh the event list
                        modal.style.display = "none";
                        loadBookedEvents(); // Reload events
    
                        alert("The event has been successfully cancelled/removed.");
                    }
                } catch (error) {
                    console.error("Error canceling event:", error);
                    alert("There was an error canceling the event.");
                }
            } else {
                console.log("Event cancellation was canceled by the user.");
            }
        }
    };        
};

//close modal when the close button is clicked
document.getElementById('closeModal').onclick = () => {
    document.getElementById('eventModal').style.display = "none";
};

//close modal if user clicks outside of the modal content
window.onclick = (event) => {
    if (event.target === document.getElementById('eventModal')) {
        document.getElementById('eventModal').style.display = "none";
    }
};

//load events when the page is ready
window.onload = () => {
    loadBookedEvents();
};

// Function to fetch event by name
async function fetchEventByName(eventName) {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("event_name", "==", eventName));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].uuid;  // Assuming event names are unique
        
    } else {
        console.error("Event not found!");
        return null;
    }
}

