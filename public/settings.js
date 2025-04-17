import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Firebase boot
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const logoutButton = document.getElementById("logoutButton");
const notificationSettingsForm = document.getElementById("notificationSettingsForm");
const notificationEmail = document.getElementById("notificationEmail");
const eventReminders = document.getElementById("eventReminders");
const newEventNotifications = document.getElementById("newEventNotifications");
const eventChanges = document.getElementById("eventChanges");
const reminderTime = document.getElementById("reminderTime");
const profileVisibility = document.getElementById("profileVisibility");

// UI Elements for verification status
const emailStatus = document.createElement('p');
emailStatus.id = "emailStatus";
notificationEmail.parentNode.appendChild(emailStatus);

// Firebase Auth
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);

        if (logoutButton) logoutButton.style.display = "block";
        loadUserSettings(user.uid);
        handleEmailVerificationUI(user);
    } else {
        console.log("No user is logged in.");
        window.location.href = "loginregister.html";
    }
});

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}

  
async function loadUserSettings(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.notificationSettings) {
                notificationEmail.value = userData.notificationSettings.email || userData.email || "";
                eventReminders.checked = userData.notificationSettings.eventReminders || false;
                newEventNotifications.checked = userData.notificationSettings.newEventNotifications || false;
                eventChanges.checked = userData.notificationSettings.eventChanges || false;
                reminderTime.value = userData.notificationSettings.reminderTime || "1hour";
                profileVisibility.checked = userData.notificationSettings.profileVisibility || false;
            } else {
                notificationEmail.value = userData.email || "";
            }
        } else {
            console.warn("No document found for user:", userId);
        }
    } catch (err) {
        console.error("Failed to load settings:", err);
    }
}

// Submit settings
if (notificationSettingsForm) {
    notificationSettingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const email = notificationEmail.value.trim();

        if (!validateEmail(email)) {
            showSaveError("Invalid email format.");
            return;
        }

        try {
            const notificationSettings = {
                email,
                eventReminders: eventReminders.checked,
                newEventNotifications: newEventNotifications.checked,
                eventChanges: eventChanges.checked,
                reminderTime: reminderTime.value,
                profileVisibility: profileVisibility.checked,
                updatedAt: new Date()
            };

            await updateDoc(doc(db, "users", user.uid), {
                notificationSettings
            });

            showSaveSuccess();
        } catch (err) {
            console.error("Error saving settings:", err);
            showSaveError(err.message);
        }
    });
}

// Email Verification Handling
function handleEmailVerificationUI(user) {
    if (!user.emailVerified) {
        emailStatus.innerHTML = `
            <span style="color: red;">Email not verified</span> 
            <button id="verifyEmailBtn" class="verify-btn">Verify</button>
        `;
        const verifyBtn = document.getElementById("verifyEmailBtn");
        verifyBtn.addEventListener("click", async () => {
            try {
                await sendEmailVerification(user);
                verifyBtn.disabled = true;
                verifyBtn.textContent = "Verification Sent";
            } catch (error) {
                console.error("Error sending verification:", error);
                showSaveError("Verification email failed.");
            }
        });
    } else {
        emailStatus.innerHTML = `<span style="color: green;">Email verified ✅</span>`;
    }
}

// Email Validation Utility
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Save feedback
function showSaveSuccess() {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'success');
    notification.innerHTML = `<i class="fas fa-check-circle"></i> <span>Settings updated successfully!</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showSaveError(msg) {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'error');
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${msg}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}
