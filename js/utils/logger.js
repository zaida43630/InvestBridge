// Logging Utility
class Logger {
  constructor() {
    this.logLevel = "INFO" // DEBUG, INFO, WARN, ERROR
    this.logs = []
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
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
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

    console.log(`%c[${timestamp}] ${level}: ${message}`, styles[level], data || "")

    // Send to Firebase for persistent logging
    this._sendToFirebase(logEntry)

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  async _sendToFirebase(logEntry) {
    try {
      if (window.firebaseDB) {
        await window.firebaseDB.collection("logs").add({
          ...logEntry,
          userId: window.firebaseAuth?.currentUser?.uid || "anonymous",
        })
      }
    } catch (error) {
      console.error("Failed to send log to Firebase:", error)
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
    error: event.error?.stack,
  })
})

// Log unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  window.logger.error("Unhandled promise rejection", {
    reason: event.reason,
    promise: event.promise,
  })
})
