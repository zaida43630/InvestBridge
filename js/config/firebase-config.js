// Import Firebase
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLilwCZd9qVq87QPkOxzFtUlNIfzb6sSw",
    authDomain: "venturebridge-d9529.firebaseapp.com",
    projectId: "venturebridge-d9529",
    storageBucket: "venturebridge-d9529.firebasestorage.app",
    messagingSenderId: "23284722610",
    appId: "1:23284722610:web:e69385ac9ce26ac1ce92ab"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = firebase.auth()
const db = firebase.firestore()

// Export for use in other modules
window.firebaseAuth = auth
window.firebaseDB = db

// Configure Firestore settings
db.settings({
  timestampsInSnapshots: true,
})

console.log("Firebase initialized successfully")
