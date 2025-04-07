import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const createEventBtn = document.getElementById("createEventBtn");

// Check if the user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);
        // Button and panel references
        
        const closePanel = document.getElementById("closePanel");
        const overlay = document.getElementById("eventOverlay");
        const createEventForm = document.getElementById("createEventForm");

        // Show panel
        createEventBtn.addEventListener("click", () => {
        overlay.style.display = "flex";
        document.body.classList.add("no-scroll");
        });

        // Close panel
        closePanel.addEventListener("click", () => {
        overlay.style.display = "none";
        document.body.classList.remove("no-scroll");
        });

        // Handle form submission
        createEventForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newEvent = {
                event_name: document.getElementById("eventName").value,
                event_description: document.getElementById("eventDescription").value,
                event_category: document.getElementById("eventCategory").value,
                location: document.getElementById("location").value,
                start_time: new Date(document.getElementById("startTime").value),
                end_time: new Date(document.getElementById("endTime").value),
                price: parseFloat(document.getElementById("price").value),
                max_capacity: parseInt(document.getElementById("maxCapacity").value),
                privacy_type: document.getElementById("privacyType").value,
                cancellation_policy: document.getElementById("cancellationPolicy").value,
                current_attendees_count: 0,
                created_at: new Date()  // Timestamp when event is created
            };

            // Make this more strict in the future
            if (!newEvent.event_name || !newEvent.event_category || !newEvent.location || !newEvent.start_time || !newEvent.end_time) {
                alert("Please fill in all required fields.");
                return;
            }

            console.log("New Event:", newEvent);           

            try {
                // Add to Firestore
                const docRef = await addDoc(collection(db, "events"), newEvent);
                console.log("Event added with ID:", docRef.id);
        
                alert("Event added successfully!");
                overlay.style.display = "none";  // Close modal
                createEventForm.reset();  // Clear the form
        
            } catch (error) {
                console.error("Error adding event:", error);
                console.log(error);
                alert("Failed to add event. Please try again.");
                return;
            }
            
            // Close the panel
            overlay.style.display = "none";
            document.body.classList.remove("no-scroll");

            // Clear the form
            createEventForm.reset();

            // Refresh for new event to show
            location.reload(true);
        });
        
    } else {
        // User is not signed in
        console.log("No user is logged in.");
        createEventBtn.style.display = "none";
        
    }
});

