document.addEventListener('DOMContentLoaded', function () 
{
    const eventQuery = new URLSearchParams(window.location.search).get('event');

    if (eventQuery) 
        {
        const eventID = document.getElementById('eventID');
        const event_description = document.getElementById('event_description');
        const event_date = document.getElementById('event_date');
        const event_time = document.getElementById('event_time');
        const event_location = document.getElementById('event_location');

        switch (eventQuery) 
        {
            case '1':
                eventID.textContent = "Mindfulness Conference";
                event_description.textContent = "Take a break from the strenuous day-to-day and join us for an exploration in rest and relaxation!";
                event_date.textContent = "On: March 31, 2025";
                event_time.textContent = "From: 10:00am - 12:00pm"
                event_location.textContent = "At: Cobb Galleria Centre";
                break;
            case '2':
                eventID.textContent = "Music Festival";
                event_description.textContent = "Come see your favorite artists for ONE NIGHT ONLY!";
                event_date.textContent = "On: April 19, 2025";
                event_time.textContent = "From: 2:00pm - 5:00pm"
                event_location.textContent = "At: Piedmont Park";
                break;
            case '3':
                eventID.textContent = "Museum Tour";
                event_description.textContent = "Experience our newest exhibit on prehistoric culture";
                event_date.textContent = "On: May 23, 2025";
                event_time.textContent = "From: 11:00am - 2:00pm"
                event_location.textContent = "At: High Museum";
                break;
            default:
                eventID.textContent = "Event Not Found";
                event_description.textContent = "Sorry, this event does not exist.";
                break;
        }

        // Book Event Button
        const bookEventBtn = document.getElementById('bookEventBtn');
        bookEventBtn.addEventListener('click', function () 
        {
            // Save the booking to Firebase
            const userEvent = 
            {
                eventID: eventQuery,
                eventName: eventID.textContent,
                eventDescription: event_description.textContent,
                eventDate: event_date.textContent,
                eventTime: event_time.textContent,
                eventLocation: event_location.textContent,
                bookingDate: new Date().toISOString()
            };

            //Add the booking to Firebase Firestore under the 'bookings' collection
            const db = firebase.firestore();
            db.collection('bookings').add(userEvent)
                .then(() => 
                    {
                    alert("Congrats on your booking!");

                    // Redirect to user portal after booking
                    window.location.href = 'userportal.html';
                })
                .catch(error => 
                    {
                    console.error("Error booking the event:", error);
                    alert("There was an error with your booking. Please try again.");
                });
        });
    }
});
