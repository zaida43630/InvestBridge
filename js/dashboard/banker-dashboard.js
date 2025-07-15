// Banker User Dashboard Module
window.bankerDashboard = {
  renderSection: async function (sectionId, userProfile) {
    let content = ""
    switch (sectionId) {
      case "overview":
        content = this.renderOverview(userProfile)
        break
      case "post-loan":
        content = this.renderPostLoanDetailsForm()
        break
      case "view-businesses":
        content = await this.renderViewBusinesses()
        break
      case "messages":
        content = this.renderMessages()
        break
      case "profile":
        content = this.renderProfile(userProfile)
        break
      default:
        content = `<div class="empty-state"><i class="fas fa-info-circle"></i><h3>Section Not Found</h3><p>The requested section could not be loaded.</p></div>`
    }
    return content
  },

  renderOverview: (userProfile) => {
    window.logger.info("Rendering Banker Overview")
    return `
            <div class="dashboard-overview">
                <h2>Welcome, ${userProfile.fullName || "Banker"}!</h2>
                <p>Manage your loan offerings and connect with businesses seeking financial support.</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary"><i class="fas fa-piggy-bank"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Active Loan Offers</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success"><i class="fas fa-building"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Businesses Connected</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon warning"><i class="fas fa-comments"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Unread Messages</p>
                        </div>
                    </div>
                </div>
                <div class="content-section">
                    <div class="section-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div class="section-body">
                        <button class="btn btn-primary" onclick="window.dashboard.loadSection('post-loan')">Post New Loan Offer</button>
                        <button class="btn btn-outline" onclick="window.dashboard.loadSection('view-businesses')">Browse Businesses</button>
                    </div>
                </div>
            </div>
        `
  },

  renderPostLoanDetailsForm: () => {
    window.logger.info("Rendering Post Loan Details Form")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Post New Loan Details</h2>
                </div>
                <div class="section-body">
                    <form id="postLoanForm">
                        <div class="form-group">
                            <label for="loanTitle">Loan Title</label>
                            <input type="text" id="loanTitle" name="loanTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="loanDescription">Description</label>
                            <textarea id="loanDescription" name="loanDescription" rows="5" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="loanType">Loan Type</label>
                            <select id="loanType" name="loanType" required>
                                <option value="">Select Type</option>
                                <option value="business-loan">Business Loan</option>
                                <option value="startup-loan">Startup Loan</option>
                                <option value="equipment-loan">Equipment Loan</option>
                                <option value="working-capital">Working Capital</option>
                                <option value="term-loan">Term Loan</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="minAmount">Minimum Amount (₹)</label>
                            <input type="number" id="minAmount" name="minAmount" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="maxAmount">Maximum Amount (₹)</label>
                            <input type="number" id="maxAmount" name="maxAmount" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="interestRate">Interest Rate (%)</label>
                            <input type="number" id="interestRate" name="interestRate" min="0" step="0.01" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Loan Offer</button>
                    </form>
                </div>
            </div>
        `
  },

  renderViewBusinesses: async () => {
    window.logger.info("Rendering View Businesses (for Banker)")
    try {
      const businessesSnapshot = await window.firebaseDB.collection("users").where("userType", "==", "business").get()

      let businessesHtml = ""
      if (businessesSnapshot.empty) {
        businessesHtml = `<div class="empty-state"><i class="fas fa-building"></i><h3>No Businesses Found</h3><p>No business profiles are currently available.</p></div>`
      } else {
        businessesHtml = `<div class="table-container"><table class="table"><thead><tr><th>Company Name</th><th>Category</th><th>Stage</th><th>Funding Needed</th><th>Actions</th></tr></thead><tbody>`
        businessesSnapshot.forEach((doc) => {
          const business = doc.data()
          businessesHtml += `
                        <tr>
                            <td>${business.companyName}</td>
                            <td><span class="badge badge-primary">${business.businessCategory}</span></td>
                            <td><span class="badge badge-success">${business.businessStage}</span></td>
                            <td>₹${business.fundingRequired?.toLocaleString("en-IN") || "N/A"}</td>
                            <td>
                                <button class="btn btn-sm btn-outline">View Profile</button>
                                <button class="btn btn-sm btn-primary">Offer Loan</button>
                            </td>
                        </tr>
                    `
        })
        businessesHtml += `</tbody></table></div>`
      }

      return `
                <div class="content-section">
                    <div class="section-header">
                        <h2>Businesses Seeking Funding</h2>
                    </div>
                    <div class="section-body">
                        ${businessesHtml}
                    </div>
                </div>
            `
    } catch (error) {
      window.logger.error("Error fetching businesses for banker", error)
      return `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Businesses</h3><p>Could not load business profiles. Please try again.</p></div>`
    }
  },

  renderMessages: () => {
    window.logger.info("Rendering Messages")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Messages</h2>
                </div>
                <div class="section-body">
                    <div class="empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>No Messages Yet</h3>
                        <p>Your inbox is empty. Start connecting with others to send and receive messages!</p>
                    </div>
                </div>
            </div>
        `
  },

  renderProfile: (userProfile) => {
    window.logger.info("Rendering Banker Profile")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>My Profile</h2>
                </div>
                <div class="section-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" value="${userProfile.fullName || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${userProfile.email || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" value="${userProfile.phone || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>User Type</label>
                            <input type="text" value="${userProfile.userType || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Bank Name</label>
                            <input type="text" value="${userProfile.bankName || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Designation</label>
                            <input type="text" value="${userProfile.designation || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Loan Types Offered</label>
                            <input type="text" value="${userProfile.loanTypes?.join(", ") || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Maximum Loan Amount</label>
                            <input type="text" value="₹${userProfile.maxLoanAmount?.toLocaleString("en-IN") || "0"}" readonly>
                        </div>
                    </div>
                    <div class="mt-3 text-right">
                        <button class="btn btn-primary">Edit Profile</button>
                    </div>
                </div>
            </div>
        `
  },
}
