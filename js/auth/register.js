// Registration functionality
document.addEventListener("DOMContentLoaded", () => {
  window.logger.info("Register page loaded")

  const registerForm = document.getElementById("registerForm")
  const dynamicFields = document.getElementById("dynamicFields")
  const loadingOverlay = document.getElementById("loadingOverlay")

  // Get preferred user type from URL or session
  const urlParams = new URLSearchParams(window.location.search)
  const preferredType = urlParams.get("type") || sessionStorage.getItem("preferredUserType")

  if (preferredType) {
    const radioButton = document.querySelector(`input[name="userType"][value="${preferredType}"]`)
    if (radioButton) {
      radioButton.checked = true
      updateDynamicFields(preferredType)
    }
  }

  // Handle user type change
  const userTypeRadios = document.querySelectorAll('input[name="userType"]')
  userTypeRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        updateDynamicFields(this.value)
        window.logger.debug("User type changed", { userType: this.value })
      }
    })
  })

  // Dynamic fields based on user type
  function updateDynamicFields(userType) {
    let fieldsHTML = ""

    switch (userType) {
      case "business":
        fieldsHTML = `
                    <div class="form-group">
                        <label for="companyName">Company Name</label>
                        <input type="text" id="companyName" name="companyName" required>
                    </div>
                    <div class="form-group">
                        <label for="businessCategory">Business Category</label>
                        <select id="businessCategory" name="businessCategory" required>
                            <option value="">Select Category</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="education">Education</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="clean-energy">Clean Energy</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="businessStage">Business Stage</label>
                        <select id="businessStage" name="businessStage" required>
                            <option value="">Select Stage</option>
                            <option value="idea">Idea Stage</option>
                            <option value="prototype">Prototype</option>
                            <option value="mvp">MVP</option>
                            <option value="early-revenue">Early Revenue</option>
                            <option value="growth">Growth Stage</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="fundingRequired">Funding Required (₹)</label>
                        <input type="number" id="fundingRequired" name="fundingRequired" min="0" required>
                    </div>
                `
        break

      case "investor":
        fieldsHTML = `
                    <div class="form-group">
                        <label for="investorType">Investor Type</label>
                        <select id="investorType" name="investorType" required>
                            <option value="">Select Type</option>
                            <option value="angel">Angel Investor</option>
                            <option value="vc">Venture Capitalist</option>
                            <option value="individual">Individual Investor</option>
                            <option value="institutional">Institutional Investor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="investmentRange">Investment Range (₹)</label>
                        <select id="investmentRange" name="investmentRange" required>
                            <option value="">Select Range</option>
                            <option value="1-5">1 Lakh - 5 Lakhs</option>
                            <option value="5-25">5 Lakhs - 25 Lakhs</option>
                            <option value="25-100">25 Lakhs - 1 Crore</option>
                            <option value="100-500">1 Crore - 5 Crores</option>
                            <option value="500+">5 Crores+</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="preferredSectors">Preferred Sectors</label>
                        <select id="preferredSectors" name="preferredSectors" multiple required>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="education">Education</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="clean-energy">Clean Energy</option>
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple sectors</small>
                    </div>
                `
        break

      case "banker":
        fieldsHTML = `
                    <div class="form-group">
                        <label for="bankName">Bank/Institution Name</label>
                        <input type="text" id="bankName" name="bankName" required>
                    </div>
                    <div class="form-group">
                        <label for="designation">Designation</label>
                        <input type="text" id="designation" name="designation" required>
                    </div>
                    <div class="form-group">
                        <label for="loanTypes">Loan Types Offered</label>
                        <select id="loanTypes" name="loanTypes" multiple required>
                            <option value="business-loan">Business Loan</option>
                            <option value="startup-loan">Startup Loan</option>
                            <option value="equipment-loan">Equipment Loan</option>
                            <option value="working-capital">Working Capital</option>
                            <option value="term-loan">Term Loan</option>
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple types</small>
                    </div>
                    <div class="form-group">
                        <label for="maxLoanAmount">Maximum Loan Amount (₹)</label>
                        <input type="number" id="maxLoanAmount" name="maxLoanAmount" min="0" required>
                    </div>
                `
        break

      case "advisor":
        fieldsHTML = `
                    <div class="form-group">
                        <label for="expertise">Area of Expertise</label>
                        <select id="expertise" name="expertise" multiple required>
                            <option value="business-strategy">Business Strategy</option>
                            <option value="financial-planning">Financial Planning</option>
                            <option value="marketing">Marketing</option>
                            <option value="legal">Legal</option>
                            <option value="technology">Technology</option>
                            <option value="operations">Operations</option>
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple areas</small>
                    </div>
                    <div class="form-group">
                        <label for="experience">Years of Experience</label>
                        <select id="experience" name="experience" required>
                            <option value="">Select Experience</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="consultingRate">Consulting Rate (₹/hour)</label>
                        <input type="number" id="consultingRate" name="consultingRate" min="0">
                        <small>Leave blank if you offer free consultations</small>
                    </div>
                    <div class="form-group">
                        <label for="certifications">Certifications</label>
                        <textarea id="certifications" name="certifications" placeholder="List your relevant certifications"></textarea>
                    </div>
                `
        break
    }

    dynamicFields.innerHTML = fieldsHTML
  }

  // Form validation
  function validateForm(formData) {
    const errors = []

    // Basic validation
    if (!formData.fullName.trim()) errors.push("Full name is required")
    if (!formData.email.trim()) errors.push("Email is required")
    if (!formData.phone.trim()) errors.push("Phone number is required")
    if (!formData.password) errors.push("Password is required")
    if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match")
    }
    if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters long")
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address")
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, "").slice(-10))) {
      errors.push("Please enter a valid Indian phone number")
    }

    return errors
  }

  // Show loading state
  function showLoading() {
    loadingOverlay.classList.add("active")
    registerForm.querySelector('button[type="submit"]').classList.add("loading")
  }

  // Hide loading state
  function hideLoading() {
    loadingOverlay.classList.remove("active")
    registerForm.querySelector('button[type="submit"]').classList.remove("loading")
  }

  // Show error message
  function showError(message) {
    const existingAlert = document.querySelector(".alert")
    if (existingAlert) existingAlert.remove()

    const alert = document.createElement("div")
    alert.className = "alert alert-error"
    alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

    registerForm.insertBefore(alert, registerForm.firstChild)
    alert.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  // Show success message
  function showSuccess(message) {
    const existingAlert = document.querySelector(".alert")
    if (existingAlert) existingAlert.remove()

    const alert = document.createElement("div")
    alert.className = "alert alert-success"
    alert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`

    registerForm.insertBefore(alert, registerForm.firstChild)
    alert.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  // Handle form submission
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    window.logger.info("Registration form submitted")

    // Get form data
    const formData = new FormData(this)
    const data = Object.fromEntries(formData.entries())

    // Handle multiple select fields
    const multiSelects = this.querySelectorAll("select[multiple]")
    multiSelects.forEach((select) => {
      const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value)
      data[select.name] = selectedOptions
    })

    // Validate form
    const errors = validateForm(data)
    if (errors.length > 0) {
      showError(errors.join("<br>"))
      window.logger.warn("Form validation failed", { errors })
      return
    }

    showLoading()

    try {
      // Create user account
      const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(data.email, data.password)

      const user = userCredential.user

      // Update user profile
      await user.updateProfile({
        displayName: data.fullName,
      })

      // Save user data to Firestore
      const userData = {
        uid: user.uid,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        userType: data.userType,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        profileComplete: true,
      }

      // Add type-specific data
      switch (data.userType) {
        case "business":
          userData.companyName = data.companyName
          userData.businessCategory = data.businessCategory
          userData.businessStage = data.businessStage
          userData.fundingRequired = Number.parseInt(data.fundingRequired)
          break

        case "investor":
          userData.investorType = data.investorType
          userData.investmentRange = data.investmentRange
          userData.preferredSectors = data.preferredSectors
          break

        case "banker":
          userData.bankName = data.bankName
          userData.designation = data.designation
          userData.loanTypes = data.loanTypes
          userData.maxLoanAmount = Number.parseInt(data.maxLoanAmount)
          break

        case "advisor":
          userData.expertise = data.expertise
          userData.experience = data.experience
          userData.consultingRate = data.consultingRate ? Number.parseInt(data.consultingRate) : 0
          userData.certifications = data.certifications
          break
      }

      await window.firebaseDB.collection("users").doc(user.uid).set(userData)

      window.logger.info("User registered successfully", {
        userId: user.uid,
        userType: data.userType,
      })

      showSuccess("Account created successfully! Redirecting to dashboard...")

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 2000)
    } catch (error) {
      window.logger.error("Registration failed", error)

      let errorMessage = "Registration failed. Please try again."

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists."
          break
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please choose a stronger password."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection and try again."
          break
      }

      showError(errorMessage)
    } finally {
      hideLoading()
    }
  })

  // Initialize with default user type
  const defaultUserType = document.querySelector('input[name="userType"]:checked')?.value
  if (defaultUserType) {
    updateDynamicFields(defaultUserType)
  }
})
