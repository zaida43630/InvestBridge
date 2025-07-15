// Firebase Connection Test Utility
class FirebaseTest {
  constructor() {
    this.testResults = {
      firebaseLoaded: false,
      authInitialized: false,
      firestoreInitialized: false,
      connectionTest: false,
    }
  }

  async runTests() {
    console.log("🔥 Running Firebase Connection Tests...")

    // Test 1: Check if Firebase is loaded
    this.testResults.firebaseLoaded = typeof window.firebase !== "undefined"
    console.log(`✅ Firebase loaded: ${this.testResults.firebaseLoaded}`)

    if (!this.testResults.firebaseLoaded) {
      console.error("❌ Firebase not loaded. Check your script tags.")
      return this.testResults
    }

    // Test 2: Check if Auth is initialized
    try {
      this.testResults.authInitialized = typeof window.firebase.auth !== "undefined"
      console.log(`✅ Auth initialized: ${this.testResults.authInitialized}`)
    } catch (error) {
      console.error("❌ Auth initialization failed:", error)
    }

    // Test 3: Check if Firestore is initialized
    try {
      this.testResults.firestoreInitialized = typeof window.firebase.firestore !== "undefined"
      console.log(`✅ Firestore initialized: ${this.testResults.firestoreInitialized}`)
    } catch (error) {
      console.error("❌ Firestore initialization failed:", error)
    }

    // Test 4: Test Firestore connection
    if (this.testResults.firestoreInitialized) {
      try {
        await window.firebase.firestore().enableNetwork()
        this.testResults.connectionTest = true
        console.log("✅ Firestore connection test passed")
      } catch (error) {
        console.error("❌ Firestore connection test failed:", error)
      }
    }

    // Summary
    const allPassed = Object.values(this.testResults).every((result) => result === true)
    console.log(`\n🎯 Test Summary: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`)
    console.table(this.testResults)

    return this.testResults
  }

  // Quick setup guide
  showSetupGuide() {
    if (!this.testResults.firebaseLoaded) {
      console.log(`
🔧 SETUP GUIDE:

1. Make sure you have the correct Firebase CDN links:
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

2. Update your Firebase config in js/config/firebase-config.js:
   - Get your config from Firebase Console > Project Settings > General
   - Replace the placeholder values with your actual Firebase config

3. Make sure scripts are loaded in the correct order:
   - Firebase SDKs first
   - Firebase config second
   - Your app scripts last

4. Check browser console for any loading errors
      `)
    }
  }
}

// Auto-run tests when this script loads
window.addEventListener("load", async () => {
  const tester = new FirebaseTest()
  const results = await tester.runTests()

  if (!Object.values(results).every((result) => result === true)) {
    tester.showSetupGuide()
  }
})

// Make tester available globally for manual testing
window.firebaseTest = new FirebaseTest()
