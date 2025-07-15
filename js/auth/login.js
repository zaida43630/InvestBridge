// Wait for Firebase to be ready
function waitForFirebase() {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.firebaseAuth && window.firebaseDB) {
        resolve()
      } else {
        setTimeout(checkFirebase, 100)
      }
    }
    checkFirebase()
  })
}

// Login functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Firebase to be initialized
  await waitForFirebase()

  window.logger.info("Login page loaded")

  const loginForm = document.getElementById("loginForm")
  const loadingOverlay = document.getElementById("loadingOverlay")
  const submitButton = loginForm.querySelector('button[type="submit"]')

  // Check if user is already logged in
  window.firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      window.logger.info("User already logged in, redirecting to dashboard")
      window.location.href = "dashboard.html"
    }
  })

  // Show loading state
  function showLoading() {
    loadingOverlay.classList.add("active")
    submitButton.classList.add("loading")
  }

  // Hide loading state
  function hideLoading() {
    loadingOverlay.classList.remove("active")
    submitButton.classList.remove("loading")
  }

  // Show error message
  function showError(message) {
    const existingAlert = loginForm.querySelector(".alert")
    if (existingAlert) existingAlert.remove() // Remove any existing alert

    const alert = document.createElement("div")
    alert.className = "alert alert-error"
    alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

    loginForm.insertBefore(alert, loginForm.firstChild)
    alert.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  // Show success message
  function showSuccess(message) {
    const existingAlert = loginForm.querySelector(".alert")
    if (existingAlert) existingAlert.remove() // Remove any existing alert

    const alert = document.createElement("div")
    alert.className = "alert alert-success"
    alert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`

    loginForm.insertBefore(alert, loginForm.firstChild)
    alert.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  // Form validation
  function validateForm(email, password) {
    const errors = []

    if (!email.trim()) errors.push("Email is required")
    if (!password) errors.push("Password is required")

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      errors.push("Please enter a valid email address")
    }

    return errors
  }

  // Handle form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    window.logger.info("Login form submitted")

    // Clear previous errors
    const existingAlert = loginForm.querySelector(".alert")
    if (existingAlert) existingAlert.remove()

    const formData = new FormData(this)
    const email = formData.get("email")
    const password = formData.get("password")
    const rememberMe = formData.get("rememberMe")

    // Validate form
    const errors = validateForm(email, password)
    if (errors.length > 0) {
      showError(errors.join("<br>"))
      window.logger.warn("Login form validation failed", { errors })
      return
    }

    showLoading()

    let error = null // Declare error variable

    try {
      // Set persistence based on remember me checkbox using compat mode
      const persistence = rememberMe
        ? window.firebase.auth.Auth.Persistence.LOCAL
        : window.firebase.auth.Auth.Persistence.SESSION

      await window.firebaseAuth.setPersistence(persistence)

      // Sign in user
      const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password)
      const user = userCredential.user

      // Get user profile from Firestore
      const userDoc = await window.firebaseDB.collection("users").doc(user.uid).get()

      if (!userDoc.exists) {
        throw new Error("User profile not found")
      }

      const userData = userDoc.data()

      // Update last login using compat mode
      await window.firebaseDB.collection("users").doc(user.uid).update({
        lastLogin: window.firebase.firestore.FieldValue.serverTimestamp(),
      })

      window.logger.info("User logged in successfully", {
        userId: user.uid,
        userType: userData.userType,
        rememberMe: !!rememberMe,
      })

      showSuccess("Login successful! Redirecting to dashboard...")

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1000)
    } catch (err) {
      window.logger.error("Login failed", err)

      let errorMessage = "Login failed. Please try again."

      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled. Please contact support."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later."
          break
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection and try again."
          break
        default:
          errorMessage = err.message || errorMessage // Fallback to generic message or actual error message
          break
      }

      showError(errorMessage)
      error = err // Assign error variable
    } finally {
      // Always hide loading, but with a slight delay after an error for visibility
      setTimeout(
        () => {
          hideLoading()
        },
        error ? 1500 : 0,
      ) // Delay if there was an error
    }
  })

  // Handle forgot password
  const forgotPasswordLink = document.querySelector(".forgot-password")
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault()

      const emailInput = document.getElementById("email")
      const email = emailInput.value

      if (!email) {
        showError("Please enter your email address first to reset password.")
        emailInput.focus()
        return
      }

      showLoading() // Show loading for password reset

      let error = null // Declare error variable

      try {
        await window.firebaseAuth.sendPasswordResetEmail(email)
        showSuccess("Password reset email sent! Check your inbox.")

        window.logger.info("Password reset email sent", { email })
      } catch (err) {
        window.logger.error("Password reset failed", err)

        let errorMessage = "Failed to send password reset email."

        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          default:
            errorMessage = err.message || errorMessage
            break
        }

        showError(errorMessage)
        error = err // Assign error variable
      } finally {
        setTimeout(() => {
          hideLoading()
        }, 1500) // Always hide loading with a delay for password reset
      }
    })
  }
})
