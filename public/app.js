const firebaseConfig = 
{
    apiKey: "AIzaSyCMWv6HtYj9UfkTZIf5ry9xfXnTPL20WMA",
    authDomain: "event-pulse-8d1a8.firebaseapp.com",
    databaseURL: "https://event-pulse-8d1a8-default-rtdb.firebaseio.com",
    projectId: "event-pulse-8d1a8",
    storageBucket: "event-pulse-8d1a8.firebasestorage.app",
    messagingSenderId: "956330318068",
    appId: "1:956330318068:web:17a10f1584bd229e48a6a1"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore instance

//Add an event to Firestore
function addEvent(title, description, date, location) 
{
    db.collection("events").add({
        title: title,
        description: description,
        date: date,
        location: location
    })
    .then((docRef) => {
        console.log("Event added with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding event: ", error);
    });
}

// Add event
addEvent("Music Festival", "Enjoy your favorite arists, ONE NIGHT ONLY!", "April 19, 2025", "Piedmont Park");
addEvent("Mindfulness Conference", "Take a break from the strenuous day-to-day and join us for an exploration in rest and relaxation!", "March 31, 2025", "Cobb Galleria Centre");

//load events
document.addEventListener('DOMContentLoaded', function () 
{
    const eventsList = document.getElementById('events-list');

    db.collection("events").get().then((querySnapshot) => 
        {
        querySnapshot.forEach((doc) => 
            {
            const event = doc.data();
            const eventItem = document.createElement('li');
            eventItem.innerHTML = `<a href="event-info.html?event=${doc.id}"><button>${event.title}</button></a>`;
            eventsList.appendChild(eventItem);
        });
    }).catch((error) => 
        {
        console.error("Error fetching events: ", error);
    });
});

//show event details
document.addEventListener('DOMContentLoaded', function () 
{
    const eventQuery = new URLSearchParams(window.location.search).get('event');
    
    if (eventQuery) {
        const eventRef = db.collection('events').doc(eventQuery);
        
        eventRef.get().then((doc) => 
            {
            if (doc.exists) {
                const event = doc.data();
                document.getElementById('eventTitle').textContent = event.title;
                document.getElementById('eventDescription').textContent = "Description: " + event.description;
                document.getElementById('eventDate').textContent = "Date: " + event.date;
                document.getElementById('eventLocation').textContent = "Location: " + event.location;
            } else {
                console.log("Event not found!");
            }
        }).catch((error) => 
            {
            console.error("Error fetching event: ", error);
        });

        const bookEventBtn = document.getElementById('bookEventBtn');
        bookEventBtn.addEventListener('click', function () 
        {
            alert("Event booked successfully!");
        });
    }
});
