// Logging Utility - Fixed for Firestore compatibility
class Logger {
  constructor() {
    this.logLevel = "INFO" // DEBUG, INFO, WARN, ERROR
    this.logs = []
    this.firebaseReady = false
    this.pendingLogs = []
  }

  debug(message, data = null) {
    this._log("DEBUG", message, data)
  }

  info(message, data = null) {
    this._log("INFO", message, data)
  }

  warn(message, data = null) {
    this._log("WARN", message, data)
  }

  error(message, error = null) {
    this._log("ERROR", message, error)
  }

  _log(level, message, data) {
    const timestamp = new Date().toISOString()

    // Sanitize data for Firestore compatibility
    const sanitizedData = this._sanitizeData(data)

    const logEntry = {
      timestamp,
      level,
      message: String(message),
      data: sanitizedData,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this._getSessionId(),
    }

    // Store log entry
    this.logs.push(logEntry)

    // Console output with styling
    const styles = {
      DEBUG: "color: #6b7280",
      INFO: "color: #2563eb",
      WARN: "color: #f59e0b",
      ERROR: "color: #ef4444; font-weight: bold",
    }

    console.log(`%c[${timestamp}] ${level}: ${message}`, styles[level], sanitizedData || "")

    // Send to Firebase for persistent logging (only for important logs)
    if (level === "ERROR" || level === "WARN") {
      this._sendToFirebase(logEntry)
    }

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  _sanitizeData(data) {
    if (data === null || data === undefined) {
      return null
    }

    try {
      // Convert to JSON and back to remove functions, circular references, etc.
      const jsonString = JSON.stringify(data, (key, value) => {
        // Handle different types of values
        if (typeof value === "function") {
          return "[Function]"
        }
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          }
        }
        if (value instanceof Date) {
          return value.toISOString()
        }
        if (typeof value === "object" && value !== null) {
          // Check for circular references
          if (value.constructor && value.constructor.name !== "Object" && value.constructor.name !== "Array") {
            return `[${value.constructor.name}]`
          }
        }
        return value
      })

      return JSON.parse(jsonString)
    } catch (error) {
      // If sanitization fails, return a simple string representation
      return String(data)
    }
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem("logSessionId")
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      sessionStorage.setItem("logSessionId", sessionId)
    }
    return sessionId
  }

  async _sendToFirebase(logEntry) {
    try {
      // Check if Firebase is available and user is authenticated
      if (!window.firebaseDB) {
        this.pendingLogs.push(logEntry)
        return
      }

      // Only send logs if user is authenticated (optional)
      const currentUser = window.firebaseAuth?.currentUser

      const logData = {
        ...logEntry,
        userId: currentUser?.uid || "anonymous",
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      }

      await window.firebaseDB.collection("logs").add(logData)
    } catch (error) {
      // Don't log Firebase errors to avoid infinite loops
      console.warn("Failed to send log to Firebase:", error.message)

      // Store failed logs for retry
      this.pendingLogs.push(logEntry)
    }
  }

  // Retry sending pending logs when Firebase becomes available
  async retryPendingLogs() {
    if (this.pendingLogs.length === 0) return

    const logsToRetry = [...this.pendingLogs]
    this.pendingLogs = []

    for (const logEntry of logsToRetry) {
      await this._sendToFirebase(logEntry)
    }
  }

  // Get logs for debugging
  getLogs(level = null) {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return this.logs
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    this.pendingLogs = []
    console.log("Logs cleared")
  }

  // Export logs as JSON
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `investbridge-logs-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  // Set Firebase ready state
  setFirebaseReady() {
    this.firebaseReady = true
    this.retryPendingLogs()
  }
}

// Create global logger instance
window.logger = new Logger()

// Log page load
window.logger.info("Page loaded", {
  page: window.location.pathname,
  referrer: document.referrer,
})

// Log errors globally
window.addEventListener("error", (event) => {
  window.logger.error("Global error caught", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  })
})

// Log unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  window.logger.error("Unhandled promise rejection", {
    reason: event.reason?.message || event.reason,
    stack: event.reason?.stack,
  })
})
