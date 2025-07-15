// Authentication Guard Utility
class AuthGuard {
  constructor() {
    this.currentUser = null
    this.userType = null
    this.userProfile = null // Store full user profile
    this.isInitialized = false
    this.authPromise = null // Promise to track initialization

    this.init()
  }

  async init() {
    if (this.authPromise) {
      return this.authPromise
    }

    this.authPromise = new Promise((resolve) => {
      // Use onAuthStateChanged to ensure Firebase Auth is ready
      const unsubscribe = window.firebaseAuth.onAuthStateChanged(async (user) => {
        this.currentUser = user
        this.isInitialized = true
        unsubscribe() // Unsubscribe after first state change

        if (this.currentUser) {
          await this.loadUserProfile()
        }

        window.logger.info("AuthGuard initialized", {
          isAuthenticated: !!this.currentUser,
          userType: this.userType,
        })
        resolve()
      })
    })
    return this.authPromise
  }

  async loadUserProfile() {
    try {
      if (!this.currentUser) return

      const userDoc = await window.firebaseDB.collection("users").doc(this.currentUser.uid).get()

      if (userDoc.exists) {
        const userData = userDoc.data()
        this.userType = userData.userType
        this.userProfile = userData // Store the full profile

        window.logger.info("User profile loaded", {
          userId: this.currentUser.uid,
          userType: this.userType,
          fullName: this.userProfile.fullName,
        })
      } else {
        window.logger.warn("User profile not found in Firestore for UID:", this.currentUser.uid)
        // Handle case where user exists in Auth but not Firestore (e.g., incomplete registration)
        this.userType = "unknown"
        this.userProfile = { fullName: "Unknown User", userType: "unknown" }
      }
    } catch (error) {
      window.logger.error("Failed to load user profile", error)
      this.userType = "unknown"
      this.userProfile = { fullName: "Error Loading User", userType: "unknown" }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }

  // Check if user has specific role
  hasRole(role) {
    return this.userType === role
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.userType)
  }

  // Redirect to login if not authenticated
  async requireAuth(redirectUrl = "/login.html") {
    await this.authPromise // Ensure initialization is complete
    if (!this.isAuthenticated()) {
      window.logger.warn("Authentication required, redirecting to login")
      window.location.href = redirectUrl
      return false
    }
    return true
  }

  // Require specific role
  async requireRole(role, redirectUrl = "/dashboard.html") {
    if (!(await this.requireAuth())) return false

    if (!this.hasRole(role)) {
      window.logger.warn("Insufficient permissions", {
        required: role,
        current: this.userType,
      })
      window.location.href = redirectUrl
      return false
    }
    return true
  }

  // Get current user info
  getCurrentUser() {
    return {
      user: this.currentUser,
      userType: this.userType,
      userProfile: this.userProfile, // Return full profile
      isAuthenticated: this.isAuthenticated(),
    }
  }

  // Logout user
  async logout() {
    try {
      await window.firebaseAuth.signOut()
      this.currentUser = null
      this.userType = null
      this.userProfile = null

      window.logger.info("User logged out successfully")
      window.location.href = "/index.html" // Redirect to landing page
    } catch (error) {
      window.logger.error("Logout failed", error)
      alert("Logout failed: " + error.message) // Provide user feedback
      throw error
    }
  }

  // Wait for auth to be ready
  async waitForAuth() {
    return this.authPromise
  }
}

// Create global auth guard instance
window.authGuard = new AuthGuard()

// Helper function to protect pages
window.protectPage = async (requiredRoles = null) => {
  await window.authGuard.waitForAuth()

  if (!window.authGuard.requireAuth()) {
    return false
  }

  if (requiredRoles && !window.authGuard.hasAnyRole(requiredRoles)) {
    window.logger.warn("Access denied for roles", {
      required: requiredRoles,
      current: window.authGuard.userType,
    })
    window.location.href = "/dashboard.html" // Redirect to general dashboard if role doesn't match
    return false
  }

  return true
}
