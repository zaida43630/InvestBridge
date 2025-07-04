// Authentication Guard Utility
class AuthGuard {
  constructor() {
    this.currentUser = null
    this.userType = null
    this.isInitialized = false

    this.init()
  }

  async init() {
    try {
      // Wait for Firebase Auth to initialize
      await new Promise((resolve) => {
        const unsubscribe = window.firebaseAuth.onAuthStateChanged((user) => {
          this.currentUser = user
          this.isInitialized = true
          unsubscribe()
          resolve()
        })
      })

      if (this.currentUser) {
        await this.loadUserProfile()
      }

      window.logger.info("AuthGuard initialized", {
        isAuthenticated: !!this.currentUser,
        userType: this.userType,
      })
    } catch (error) {
      window.logger.error("AuthGuard initialization failed", error)
    }
  }

  async loadUserProfile() {
    try {
      if (!this.currentUser) return

      const userDoc = await window.firebaseDB.collection("users").doc(this.currentUser.uid).get()

      if (userDoc.exists) {
        const userData = userDoc.data()
        this.userType = userData.userType

        window.logger.info("User profile loaded", {
          userId: this.currentUser.uid,
          userType: this.userType,
        })
      }
    } catch (error) {
      window.logger.error("Failed to load user profile", error)
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
  requireAuth(redirectUrl = "/login.html") {
    if (!this.isAuthenticated()) {
      window.logger.warn("Authentication required, redirecting to login")
      window.location.href = redirectUrl
      return false
    }
    return true
  }

  // Require specific role
  requireRole(role, redirectUrl = "/dashboard.html") {
    if (!this.requireAuth()) return false

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
      isAuthenticated: this.isAuthenticated(),
    }
  }

  // Logout user
  async logout() {
    try {
      await window.firebaseAuth.signOut()
      this.currentUser = null
      this.userType = null

      window.logger.info("User logged out successfully")
      window.location.href = "/index.html"
    } catch (error) {
      window.logger.error("Logout failed", error)
      throw error
    }
  }

  // Wait for auth to be ready
  async waitForAuth() {
    if (this.isInitialized) return

    return new Promise((resolve) => {
      const checkAuth = () => {
        if (this.isInitialized) {
          resolve()
        } else {
          setTimeout(checkAuth, 100)
        }
      }
      checkAuth()
    })
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
    window.authGuard.requireRole(requiredRoles[0])
    return false
  }

  return true
}
