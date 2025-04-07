import { getFirestore, doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; 
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isLoggedIn = false;

// Get event details from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const eventDetails = JSON.parse(decodeURIComponent(urlParams.get('event')));

// Display event details
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

// Get UI elements
const bookNowBtn = document.getElementById('bookNowBtn');
const paymentSection = document.getElementById("paymentSection");
const priceAmountSpan = document.getElementById("priceAmount");

// Check if the user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user);
        isLoggedIn = true;

        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.exists() ? userSnapshot.data() : {};
        const currentBookings = Array.isArray(userData.bookings) ? userData.bookings : [];

        // Prevent duplicate bookings
        if (currentBookings.some(booking => booking.event_name === eventDetails.event_name)) {
            bookNowBtn.style.display = "none";
            Swal.fire({
              title: "Already Booked",
              text: "You have already booked this event!",
              icon: "info",
              confirmButtonText: "OK"
            });
            return;
        }

        // Attach event listener to the Book Now button
        bookNowBtn.onclick = async () => {
            try {
                // Ensure event_id exists
                if (!eventDetails.event_id) {
                    console.error("Error: event_id is undefined");
                    Swal.fire("Error", "Unable to book event.", "error");
                    return;
                }

                // Check event capacity
                if (eventDetails.current_attendees_count >= eventDetails.max_capacity) {
                    Swal.fire("Fully Booked", "Sorry, this event is fully booked.", "error");
                    return;
                }

                // For events that require payment (price > 0)
                if (eventDetails.price && eventDetails.price > 0) {
                    // Set the payment amount in the form
                    priceAmountSpan.textContent = eventDetails.price;
                    // Hide the Book Now button and show the payment section
                    bookNowBtn.style.display = "none";
                    paymentSection.classList.remove("hidden");
                    Swal.fire({
                        title: "Payment Required",
                        text: `This event requires a payment of $${eventDetails.price}. Please enter your payment information below.`,
                        icon: "info",
                        confirmButtonText: "OK"
                    });
                } else {
                    // For free events, process booking immediately
                    const eventBooking = {
                        event_name: eventDetails.event_name,
                        event_category: eventDetails.event_category,
                        location: eventDetails.location,
                        start_time: eventDetails.start_time,
                        end_time: eventDetails.end_time,
                        event_description: eventDetails.event_description,
                        price: eventDetails.price || 0,
                        current_attendees_count: eventDetails.current_attendees_count + 1, // New count
                        max_capacity: eventDetails.max_capacity,
                        privacy_type: eventDetails.privacy_type,
                        cancellation_policy: eventDetails.cancellation_policy
                    };

                    // Update user's bookings in Firestore
                    await updateDoc(userRef, {
                        bookings: [...currentBookings, eventBooking]
                    });

                    // Increase attendee count using increment()
                    const eventRef = doc(db, 'events', eventDetails.event_id);
                    await updateDoc(eventRef, {
                        current_attendees_count: increment(1)
                    });

                    // Update UI attendee count
                    document.getElementById("attendeeCount").textContent = eventDetails.current_attendees_count + 1;
                    bookNowBtn.style.display = "none";

                    Swal.fire({
                        title: "Event Booked",
                        text: `Congratulations! You have successfully booked the event: ${eventDetails.event_name}.`,
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                }
            } catch (error) {
                console.error("Error booking event:", error);
                Swal.fire("Error", "There was an error booking the event. Please try again.", "error");
            }
        };

        // Payment form submission handler
        const paymentForm = document.getElementById("paymentForm");
        paymentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            // Simulate payment processing
            Swal.fire({
                title: "Processing Payment",
                text: "Please wait...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                // Simulate a delay for payment processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Create the event booking object
                const eventBooking = {
                    event_name: eventDetails.event_name,
                    event_category: eventDetails.event_category,
                    location: eventDetails.location,
                    start_time: eventDetails.start_time,
                    end_time: eventDetails.end_time,
                    event_description: eventDetails.event_description,
                    price: eventDetails.price || 0,
                    current_attendees_count: eventDetails.current_attendees_count + 1,
                    max_capacity: eventDetails.max_capacity,
                    privacy_type: eventDetails.privacy_type,
                    cancellation_policy: eventDetails.cancellation_policy
                };

                // Update user's bookings
                await updateDoc(userRef, {
                    bookings: [...currentBookings, eventBooking]
                });

                // Increase attendee count in Firestore
                const eventRef = doc(db, 'events', eventDetails.event_id);
                await updateDoc(eventRef, {
                    current_attendees_count: increment(1)
                });

                // Update UI attendee count
                document.getElementById("attendeeCount").textContent = eventDetails.current_attendees_count + 1;

                Swal.fire({
                    title: "Payment Successful",
                    text: "Your payment was successful and the event is booked.",
                    icon: "success",
                    confirmButtonText: "OK"
                });

                // Hide the payment section after successful booking
                paymentSection.classList.add("hidden");

            } catch (error) {
                console.error("Payment error:", error);
                Swal.fire("Payment Failed", "There was an error processing your payment.", "error");
            }
        });
    } else {
        console.log("No user is logged in.");
        bookNowBtn.textContent = "Login to book";
        bookNowBtn.onclick = () => {
            window.location.href = "loginregister.html";
        };
    }
});

// If event_id is missing, try fetching it by event name
async function fetchEventByName(eventName) {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("event_name", "==", eventName));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const eventDoc = querySnapshot.docs[0];
        return { event_id: eventDoc.id, ...eventDoc.data() };
    } else {
        console.error("Event not found!");
        return null;
    }
}

if (!eventDetails.event_id) {
    fetchEventByName(eventDetails.event_name).then(fetchedEvent => {
        if (fetchedEvent) {
            eventDetails.event_id = fetchedEvent.event_id;
            console.log("Fetched Event ID:", eventDetails.event_id);
        }
    });
}
