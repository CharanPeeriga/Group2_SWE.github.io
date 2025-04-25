// Transactionscript.js
import {
    getFirestore, doc, getDoc, updateDoc, increment,
    collection, query, where, getDocs
  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
  
  // UI elements
  const bookNowBtn      = document.getElementById('bookNowBtn');
  const paymentSection  = document.getElementById("paymentSection");
  const priceAmountSpan = document.getElementById("priceAmount");
  const paymentForm     = document.getElementById("paymentForm");
  
  // Helper: validate MM/YY expiry, not in the past
  function isValidExpiry(expiryStr) {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryStr)) return false;
    const [mm, yy] = expiryStr.split("/").map(n => parseInt(n, 10));
    const now        = new Date();
    const curYear    = now.getFullYear() % 100;
    const curMonth   = now.getMonth() + 1;
    if (yy < curYear) return false;
    if (yy === curYear && mm < curMonth) return false;
    return true;
  }
  
  // Handle auth state
  onAuthStateChanged(auth, async user => {
    if (user) {
      isLoggedIn = true;
      const userRef      = doc(db, 'users', user.uid);
      const userSnap     = await getDoc(userRef);
      const userData     = userSnap.exists() ? userSnap.data() : {};
      const currentBooks = Array.isArray(userData.bookings) ? userData.bookings : [];
  
      // Prevent duplicate booking
      if (currentBooks.some(b => b.event_name === eventDetails.event_name)) {
        bookNowBtn.style.display = "none";
        return Swal.fire("Already Booked","You have already booked this event!","info");
      }
  
      bookNowBtn.onclick = async () => {
        try {
          if (!eventDetails.event_id) {
            Swal.fire("Error","Unable to book event.","error");
            return;
          }
          if (eventDetails.current_attendees_count >= eventDetails.max_capacity) {
            return Swal.fire("Fully Booked","Sorry, this event is fully booked.","error");
          }
  
          if (eventDetails.price > 0) {
            // Show payment form
            priceAmountSpan.textContent = eventDetails.price;
            bookNowBtn.style.display    = "none";
            paymentSection.classList.remove("hidden");
            return Swal.fire(
              "Payment Required",
              `This event requires a payment of $${eventDetails.price}. Please enter your payment information below.`,
              "info"
            );
          }
  
          // Free event booking
          const booking = {
            ...eventDetails,
            current_attendees_count: eventDetails.current_attendees_count + 1
          };
          await updateDoc(userRef, {
            bookings: [...currentBooks, booking]
          });
          const eventRef = doc(db, 'events', eventDetails.event_id);
          await updateDoc(eventRef, {
            current_attendees_count: increment(1)
          });
          document.getElementById("attendeeCount").textContent = eventDetails.current_attendees_count + 1;
          bookNowBtn.style.display = "none";
          Swal.fire("Event Booked",`You've successfully booked ${eventDetails.event_name}.`,"success");
  
        } catch (err) {
          console.error(err);
          Swal.fire("Error","There was an error booking the event.","error");
        }
      };
  
      // Payment form submission with validation
      paymentForm.addEventListener("submit", async e => {
        e.preventDefault();
        const rawCard = document.getElementById("cardNumber").value.trim();
        const cardNum = rawCard.replace(/\s+/g, "");
        const expiry  = document.getElementById("expiry").value.trim();
        const cvv     = document.getElementById("cvv").value.trim();
  
        if (!/^\d{16}$/.test(cardNum)) {
          return Swal.fire("Invalid Card Number",
            "Card number must be exactly 16 digits (spaces allowed).","error");
        }
        if (!isValidExpiry(expiry)) {
          return Swal.fire("Invalid Expiry Date",
            "Enter MM/YY format and ensure it's not expired.","error");
        }
        if (!/^\d{3}$/.test(cvv)) {
          return Swal.fire("Invalid CVV","CVV must be exactly 3 digits.","error");
        }
  
        // All good → simulate payment
        Swal.fire({
          title: "Processing Payment",
          text: "Please wait...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
  
        try {
          await new Promise(res => setTimeout(res, 2000));
  
          // Complete booking
          const booking = {
            ...eventDetails,
            current_attendees_count: eventDetails.current_attendees_count + 1
          };
          await updateDoc(doc(db, 'users', user.uid), {
            bookings: [...currentBooks, booking]
          });
          await updateDoc(doc(db, 'events', eventDetails.event_id), {
            current_attendees_count: increment(1)
          });
          document.getElementById("attendeeCount").textContent = eventDetails.current_attendees_count + 1;
  
          Swal.fire("Payment Successful",
            "Your payment was successful and the event is booked.","success");
          paymentSection.classList.add("hidden");
  
        } catch (err) {
          console.error(err);
          Swal.fire("Payment Failed","Error processing payment.","error");
        }
      });
  
    } else {
      // Not logged in
      bookNowBtn.textContent = "Login to book";
      bookNowBtn.onclick     = () => window.location.href = "loginregister.html";
    }
  });
  
  // If event_id missing, fetch it
  async function fetchEventByName(name) {
    const qSnap = await getDocs(
      query(collection(db, "events"), where("event_name", "==", name))
    );
    if (!qSnap.empty) {
      const d = qSnap.docs[0];
      return { event_id: d.id, ...d.data() };
    }
    return null;
  }
  
  if (!eventDetails.event_id) {
    fetchEventByName(eventDetails.event_name).then(f => {
      if (f) eventDetails.event_id = f.event_id;
    });
  }
  