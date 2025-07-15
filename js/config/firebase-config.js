// Firebase Configuration using compat mode with global firebase object
const firebaseConfig = {
  apiKey: "AIzaSyBLilwCZd9qVq87QPkOxzFtUlNIfzb6sSw",
  authDomain: "venturebridge-d9529.firebaseapp.com",
  projectId: "venturebridge-d9529",
  storageBucket: "venturebridge-d9529.firebasestorage.app",
  messagingSenderId: "23284722610",
  appId: "1:23284722610:web:a09b2384aa881114ce92ab"
}

// Wait for Firebase to be loaded from CDN
function initializeFirebaseApp() {
  // Check if Firebase is loaded
  if (typeof window.firebase === "undefined") {
    console.error("Firebase not loaded. Make sure Firebase CDN scripts are included before this script.")
    return false
  }

  try {
    // Initialize Firebase using the global firebase object
    window.firebase.initializeApp(firebaseConfig)

    // Initialize Firebase services
    const auth = window.firebase.auth()
    const db = window.firebase.firestore()

    // Make services available globally
    window.firebaseAuth = auth
    window.firebaseDB = db

    // Configure Firestore settings
    db.settings({
      timestampsInSnapshots: true,
    })

    // Add connection state monitoring
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is signed in:", user.uid)
        // Notify logger that Firebase is ready
        if (window.logger) {
          window.logger.setFirebaseReady()
        }
      } else {
        console.log("User is signed out")
      }
    })

    // Test Firebase connection
    db.enableNetwork()
      .then(() => {
        console.log("Firebase Firestore connected successfully")
      })
      .catch((error) => {
        console.error("Firebase Firestore connection failed:", error)
      })

    console.log("Firebase initialized successfully")
    return true
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    return false
  }
}

// Initialize Firebase when the script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFirebaseApp)
} else {
  initializeFirebaseApp()
}

// Also try to initialize immediately if Firebase is already available
if (typeof window.firebase !== "undefined") {
  initializeFirebaseApp()
}
