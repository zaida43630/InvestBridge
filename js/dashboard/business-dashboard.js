// Business User Dashboard Module
window.businessDashboard = {
  renderSection: async function (sectionId, userProfile) {
    let content = ""
    switch (sectionId) {
      case "overview":
        content = this.renderOverview(userProfile)
        break
      case "post-idea":
        content = this.renderPostIdeaForm()
        break
      case "my-proposals":
        content = await this.renderMyProposals(userProfile.uid)
        break
      case "view-investors":
        content = await this.renderViewInvestors()
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
    window.logger.info("Rendering Business Overview")
    return `
            <div class="dashboard-overview">
                <h2>Welcome, ${userProfile.fullName || "Entrepreneur"}!</h2>
                <p>This is your central hub to manage your business ideas, track proposals, and connect with investors.</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary"><i class="fas fa-lightbulb"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Active Proposals</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success"><i class="fas fa-handshake"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Investor Connections</p>
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
                        <button class="btn btn-primary" onclick="window.dashboard.loadSection('post-idea')">Post New Idea</button>
                        <button class="btn btn-outline" onclick="window.dashboard.loadSection('view-investors')">Find Investors</button>
                    </div>
                </div>
            </div>
        `
  },

  renderPostIdeaForm: () => {
    window.logger.info("Rendering Post Idea Form")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Post New Business Idea</h2>
                </div>
                <div class="section-body">
                    <form id="postIdeaForm">
                        <div class="form-group">
                            <label for="ideaTitle">Idea Title</label>
                            <input type="text" id="ideaTitle" name="ideaTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="ideaDescription">Description</label>
                            <textarea id="ideaDescription" name="ideaDescription" rows="5" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="ideaCategory">Category</label>
                            <select id="ideaCategory" name="ideaCategory" required>
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
                            <label for="fundingAmount">Funding Required (₹)</label>
                            <input type="number" id="fundingAmount" name="fundingAmount" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="equityOffered">Equity Offered (%)</label>
                            <input type="number" id="equityOffered" name="equityOffered" min="0" max="100" step="0.1">
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Idea</button>
                    </form>
                </div>
            </div>
        `
  },

  renderMyProposals: async (userId) => {
    window.logger.info("Rendering My Proposals", { userId })
    try {
      const proposalsSnapshot = await window.firebaseDB
        .collection("business-proposals")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get()

      let proposalsHtml = ""
      if (proposalsSnapshot.empty) {
        proposalsHtml = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>No Proposals Yet</h3><p>You haven't posted any business ideas. Click "Post Idea" to get started!</p></div>`
      } else {
        proposalsHtml = `<div class="table-container"><table class="table"><thead><tr><th>Title</th><th>Category</th><th>Funding</th><th>Status</th><th>Actions</th></tr></thead><tbody>`
        proposalsSnapshot.forEach((doc) => {
          const proposal = doc.data()
          proposalsHtml += `
                        <tr>
                            <td>${proposal.ideaTitle}</td>
                            <td><span class="badge badge-primary">${proposal.ideaCategory}</span></td>
                            <td>₹${proposal.fundingAmount.toLocaleString("en-IN")}</td>
                            <td><span class="badge badge-success">${proposal.status || "Active"}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline">View</button>
                                <button class="btn btn-sm btn-primary">Edit</button>
                            </td>
                        </tr>
                    `
        })
        proposalsHtml += `</tbody></table></div>`
      }

      return `
                <div class="content-section">
                    <div class="section-header">
                        <h2>My Business Proposals</h2>
                    </div>
                    <div class="section-body">
                        ${proposalsHtml}
                    </div>
                </div>
            `
    } catch (error) {
      window.logger.error("Error fetching business proposals", error)
      return `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Proposals</h3><p>Could not load your business proposals. Please try again.</p></div>`
    }
  },

  renderViewInvestors: async () => {
    window.logger.info("Rendering View Investors")
    try {
      const investorsSnapshot = await window.firebaseDB.collection("users").where("userType", "==", "investor").get()

      let investorsHtml = ""
      if (investorsSnapshot.empty) {
        investorsHtml = `<div class="empty-state"><i class="fas fa-users-slash"></i><h3>No Investors Found</h3><p>No investor profiles are currently available.</p></div>`
      } else {
        investorsHtml = `<div class="table-container"><table class="table"><thead><tr><th>Name</th><th>Type</th><th>Investment Range</th><th>Preferred Sectors</th><th>Actions</th></tr></thead><tbody>`
        investorsSnapshot.forEach((doc) => {
          const investor = doc.data()
          investorsHtml += `
                        <tr>
                            <td>${investor.fullName}</td>
                            <td><span class="badge badge-primary">${investor.investorType}</span></td>
                            <td>${investor.investmentRange}</td>
                            <td>${investor.preferredSectors?.map((s) => `<span class="badge badge-success">${s}</span>`).join(" ") || "N/A"}</td>
                            <td>
                                <button class="btn btn-sm btn-outline">View Profile</button>
                                <button class="btn btn-sm btn-primary">Message</button>
                            </td>
                        </tr>
                    `
        })
        investorsHtml += `</tbody></table></div>`
      }

      return `
                <div class="content-section">
                    <div class="section-header">
                        <h2>Available Investors</h2>
                    </div>
                    <div class="section-body">
                        ${investorsHtml}
                    </div>
                </div>
            `
    } catch (error) {
      window.logger.error("Error fetching investors", error)
      return `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Investors</h3><p>Could not load investor profiles. Please try again.</p></div>`
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
    window.logger.info("Rendering Business Profile")
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
                            <label>Company Name</label>
                            <input type="text" value="${userProfile.companyName || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Business Category</label>
                            <input type="text" value="${userProfile.businessCategory || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Business Stage</label>
                            <input type="text" value="${userProfile.businessStage || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Funding Required</label>
                            <input type="text" value="₹${userProfile.fundingRequired?.toLocaleString("en-IN") || "0"}" readonly>
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
