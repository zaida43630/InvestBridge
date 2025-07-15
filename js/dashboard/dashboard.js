// Main Dashboard Logic
document.addEventListener("DOMContentLoaded", async () => {
  window.logger.info("Dashboard page loaded")

  // Protect the page
  const isAuthenticated = await window.protectPage(["business", "investor", "banker", "advisor"])
  if (!isAuthenticated) {
    return // Stop execution if not authenticated or authorized
  }

  const { user, userType, userProfile } = window.authGuard.getCurrentUser()

  if (!user || !userProfile) {
    window.logger.error("User data not available on dashboard load. Redirecting to login.")
    window.authGuard.logout() // Force logout if profile is incomplete/missing
    return
  }

  // DOM Elements
  const userNameEl = document.getElementById("userName")
  const pageTitleEl = document.getElementById("pageTitle")
  const sidebarMenuEl = document.getElementById("sidebarMenu")
  const dashboardContentEl = document.getElementById("dashboardContent")
  const logoutBtn = document.getElementById("logoutBtn")
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  // Update user info in header
  userNameEl.textContent = userProfile.fullName || user.email || "User"
  pageTitleEl.textContent = "Dashboard" // Default title

  window.logger.info("Dashboard user info updated", {
    fullName: userProfile.fullName,
    userType: userType,
  })

  // Dynamic Sidebar Menu
  const menuItems = {
    business: [
      { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },
      { id: "post-idea", label: "Post Idea", icon: "fas fa-lightbulb" },
      { id: "my-proposals", label: "My Proposals", icon: "fas fa-file-alt" },
      { id: "view-investors", label: "View Investors", icon: "fas fa-coins" },
      { id: "messages", label: "Messages", icon: "fas fa-comments" },
      { id: "profile", label: "Profile", icon: "fas fa-user" },
    ],
    investor: [
      { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },
      { id: "browse-proposals", label: "Browse Proposals", icon: "fas fa-search-dollar" },
      { id: "my-investments", label: "My Investments", icon: "fas fa-hand-holding-usd" },
      { id: "post-proposal", label: "Post Investment Proposal", icon: "fas fa-money-bill-wave" },
      { id: "messages", label: "Messages", icon: "fas fa-comments" },
      { id: "profile", label: "Profile", icon: "fas fa-user" },
    ],
    banker: [
      { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },
      { id: "post-loan", label: "Post Loan Details", icon: "fas fa-piggy-bank" },
      { id: "view-businesses", label: "View Businesses", icon: "fas fa-building" },
      { id: "messages", label: "Messages", icon: "fas fa-comments" },
      { id: "profile", label: "Profile", icon: "fas fa-user" },
    ],
    advisor: [
      { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },
      { id: "post-info", label: "Post Information", icon: "fas fa-info-circle" },
      { id: "view-queries", label: "View Queries", icon: "fas fa-question-circle" },
      { id: "post-solution", label: "Post Solution", icon: "fas fa-lightbulb" },
      { id: "messages", label: "Messages", icon: "fas fa-comments" },
      { id: "profile", label: "Profile", icon: "fas fa-user" },
    ],
  }

  function renderSidebar() {
    sidebarMenuEl.innerHTML = "" // Clear existing menu
    const items = menuItems[userType] || []

    items.forEach((item) => {
      const li = document.createElement("li")
      const a = document.createElement("a")
      a.href = "#" + item.id
      a.dataset.section = item.id
      a.innerHTML = `<i class="${item.icon}"></i> <span>${item.label}</span>`
      li.appendChild(a)
      sidebarMenuEl.appendChild(li)
    })

    // Set active class for the first item and load its content
    const firstMenuItem = sidebarMenuEl.querySelector("li a")
    if (firstMenuItem) {
      firstMenuItem.classList.add("active")
      window.dashboard.loadSection(firstMenuItem.dataset.section)
    }
  }

  // Load content into the main area - Exposed globally for quick actions
  window.dashboard = window.dashboard || {} // Ensure window.dashboard exists
  window.dashboard.loadSection = async (sectionId) => {
    window.logger.info("Loading dashboard section", { sectionId, userType })
    pageTitleEl.textContent = menuItems[userType].find((item) => item.id === sectionId)?.label || "Dashboard"

    // Update active sidebar link
    sidebarMenuEl.querySelectorAll("a").forEach((link) => link.classList.remove("active"))
    const targetLink = sidebarMenuEl.querySelector(`a[data-section="${sectionId}"]`)
    if (targetLink) {
      targetLink.classList.add("active")
    }

    dashboardContentEl.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading ${sectionId}...</p></div>`

    try {
      let contentHTML = ""
      switch (userType) {
        case "business":
          contentHTML = await window.businessDashboard.renderSection(sectionId, userProfile)
          break
        case "investor":
          contentHTML = await window.investorDashboard.renderSection(sectionId, userProfile)
          break
        case "banker":
          contentHTML = await window.bankerDashboard.renderSection(sectionId, userProfile)
          break
        case "advisor":
          contentHTML = await window.advisorDashboard.renderSection(sectionId, userProfile)
          break
        default:
          contentHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Unknown User Type</h3><p>We couldn't determine your user type. Please contact support.</p></div>`
      }
      dashboardContentEl.innerHTML = contentHTML
      window.logger.info("Dashboard section loaded successfully", { sectionId })
    } catch (error) {
      window.logger.error("Failed to load dashboard section", { sectionId, error })
      dashboardContentEl.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Content</h3><p>Something went wrong while loading this section. Please try again.</p></div>`
    }
  }

  // Event Listeners
  sidebarMenuEl.addEventListener("click", (e) => {
    e.preventDefault()
    const targetLink = e.target.closest("a[data-section]")
    if (targetLink) {
      window.dashboard.loadSection(targetLink.dataset.section)
    }
  })

  logoutBtn.addEventListener("click", async () => {
    window.logger.info("Logout button clicked")
    try {
      await window.authGuard.logout()
    } catch (error) {
      window.logger.error("Error during logout", error)
    }
  })

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
    mainContent.classList.toggle("sidebar-active")
    window.logger.debug("Sidebar toggled")
  })

  // Initial render
  renderSidebar()
})
