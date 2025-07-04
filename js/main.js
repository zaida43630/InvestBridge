// Main JavaScript for landing page
document.addEventListener("DOMContentLoaded", () => {
  window.logger.info("Main page loaded")

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      hamburger.classList.toggle("active")

      window.logger.debug("Mobile menu toggled")
    })
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })

        // Close mobile menu if open
        navMenu.classList.remove("active")
        hamburger.classList.remove("active")

        window.logger.debug("Smooth scroll to section", { targetId })
      }
    })
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
        window.logger.debug("Element animated in", {
          element: entry.target.className,
        })
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(".feature-card, .category-card, .user-type-card, .stat")
  animateElements.forEach((el) => observer.observe(el))

  // Handle registration type from URL
  const urlParams = new URLSearchParams(window.location.search)
  const userType = urlParams.get("type")

  if (userType) {
    // Store user type preference
    sessionStorage.setItem("preferredUserType", userType)
    window.logger.info("User type preference stored", { userType })
  }

  // Add scroll effect to navbar
  let lastScrollTop = 0
  const navbar = document.querySelector(".navbar")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      navbar.style.transform = "translateY(-100%)"
    } else {
      // Scrolling up
      navbar.style.transform = "translateY(0)"
    }

    lastScrollTop = scrollTop
  })

  // Add background to navbar on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  })

  // Track user interactions
  document.addEventListener("click", (e) => {
    const target = e.target

    // Track button clicks
    if (target.classList.contains("btn")) {
      window.logger.info("Button clicked", {
        buttonText: target.textContent.trim(),
        buttonClass: target.className,
        href: target.href || null,
      })
    }

    // Track card clicks
    if (target.closest(".feature-card, .category-card, .user-type-card")) {
      const card = target.closest(".feature-card, .category-card, .user-type-card")
      window.logger.info("Card clicked", {
        cardType: card.className,
        cardTitle: card.querySelector("h3")?.textContent || "Unknown",
      })
    }
  })

  // Performance monitoring
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0]
      window.logger.info("Page performance", {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      })
    }, 0)
  })
})

// Add CSS for animations
const style = document.createElement("style")
style.textContent = `
    .navbar {
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .navbar.scrolled {
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .feature-card, .category-card, .user-type-card, .stat {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature-card.animate-in, .category-card.animate-in, .user-type-card.animate-in, .stat.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: var(--background);
        box-shadow: var(--shadow);
        padding: 1rem;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
    }
`
document.head.appendChild(style)
