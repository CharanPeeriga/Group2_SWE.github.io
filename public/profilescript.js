import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const logoutButton = document.getElementById("logoutButton");
const userFullName = document.getElementById("userFullName");
const userEmail = document.getElementById("userEmail");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// Form Elements
const personalInfoForm = document.getElementById("personalInfoForm");
const aboutMeForm = document.getElementById("aboutMeForm");
const socialMediaForm = document.getElementById("socialMediaForm");
const pastEventsList = document.getElementById("pastEventsList");

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user);
        
        // Show logout button
        if (logoutButton) {
            logoutButton.style.display = "block";
        }
        
        // Load user profile data
        loadUserProfile(user.uid);
        
    } else {
        // User is not signed in, redirect to login
        console.log("No user is logged in.");
        window.location.href = "loginregister.html";
    }
});

// Handle logout
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

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove("active"));
        // Add active class to clicked button
        button.classList.add("active");
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.remove("active"));
        
        // Show selected tab content
        const tabId = button.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
    });
});

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Display user info in header
            userFullName.textContent = `${userData.firstName} ${userData.lastName}`;
            userEmail.textContent = userData.email;
            
            // Fill personal info form
            document.getElementById("profileFirstName").value = userData.firstName || "";
            document.getElementById("profileLastName").value = userData.lastName || "";
            document.getElementById("profileDOB").value = userData.DOB || "";
            document.getElementById("profilePhone").value = userData.phoneNumber || "";
            
            // Fill about me form
            document.getElementById("profileBio").value = userData.bio || "";
            document.getElementById("profileInterests").value = userData.interests || "";
            
            // Fill social media form
            document.getElementById("profileTwitter").value = userData.socialMedia?.twitter || "";
            document.getElementById("profileInstagram").value = userData.socialMedia?.instagram || "";
            document.getElementById("profileLinkedin").value = userData.socialMedia?.linkedin || "";
            document.getElementById("profileFacebook").value = userData.socialMedia?.facebook || "";
            
            // Load past events
            loadPastEvents(userData.bookings || []);
        } else {
            console.log("No user document found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Load past events
function loadPastEvents(bookings) {
    if (!pastEventsList) return;
    
    if (bookings.length > 0) {
        pastEventsList.innerHTML = ""; // Clear loading indicator
        
        // Filter past events (events with end time before current time)
        const currentTime = new Date();
        const pastEvents = bookings.filter(event => 
            new Date(event.end_time.seconds * 1000) < currentTime
        );
        
        if (pastEvents.length > 0) {
            pastEvents.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.classList.add('event-card');
                
                eventCard.innerHTML = `
                    <h4>${event.event_name}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p><i class="fas fa-calendar"></i> ${new Date(event.end_time.seconds * 1000).toLocaleDateString()}</p>
                    <p><i class="fas fa-tag"></i> ${event.event_category}</p>
                `;
                
                pastEventsList.appendChild(eventCard);
            });
        } else {
            pastEventsList.innerHTML = `
                <div class="no-events-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>You have no past events to display.</p>
                </div>
            `;
        }
    } else {
        pastEventsList.innerHTML = `
            <div class="no-events-message">
                <i class="fas fa-calendar-times"></i>
                <p>You have no past events to display.</p>
            </div>
        `;
    }
}

// Handle personal info form submission
if (personalInfoForm) {
    personalInfoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const firstName = document.getElementById("profileFirstName").value;
            const lastName = document.getElementById("profileLastName").value;
            const DOB = document.getElementById("profileDOB").value;
            const phoneNumber = document.getElementById("profilePhone").value;
            
            // Update user data in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                firstName: firstName,
                lastName: lastName,
                DOB: DOB,
                phoneNumber: phoneNumber
            });
            
            // Update display name in header
            userFullName.textContent = `${firstName} ${lastName}`;
            
            showSaveSuccess();
        } catch (error) {
            console.error("Error updating profile:", error);
            showSaveError(error.message);
        }
    });
}

// Handle about me form submission
if (aboutMeForm) {
    aboutMeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const bio = document.getElementById("profileBio").value;
            const interests = document.getElementById("profileInterests").value;
            
            // Update user data in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                bio: bio,
                interests: interests
            });
            
            showSaveSuccess();
        } catch (error) {
            console.error("Error updating about me:", error);
            showSaveError(error.message);
        }
    });
}

// Handle social media form submission
if (socialMediaForm) {
    socialMediaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const twitter = document.getElementById("profileTwitter").value;
            const instagram = document.getElementById("profileInstagram").value;
            const linkedin = document.getElementById("profileLinkedin").value;
            const facebook = document.getElementById("profileFacebook").value;
            
            // Update user data in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                socialMedia: {
                    twitter: twitter,
                    instagram: instagram,
                    linkedin: linkedin,
                    facebook: facebook
                }
            });
            
            showSaveSuccess();
        } catch (error) {
            console.error("Error updating social media:", error);
            showSaveError(error.message);
        }
    });
}

// Show save success message
function showSaveSuccess() {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'success');
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Profile updated successfully!</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show save error message
function showSaveError(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'error');
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>Error: ${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
