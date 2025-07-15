// Investor User Dashboard Module
window.investorDashboard = {
  renderSection: async function (sectionId, userProfile) {
    let content = ""
    switch (sectionId) {
      case "overview":
        content = this.renderOverview(userProfile)
        break
      case "browse-proposals":
        content = await this.renderBrowseProposals()
        break
      case "my-investments":
        content = this.renderMyInvestments()
        break
      case "post-proposal":
        content = this.renderPostInvestmentProposalForm()
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
    window.logger.info("Rendering Investor Overview")
    return `
            <div class="dashboard-overview">
                <h2>Welcome, ${userProfile.fullName || "Investor"}!</h2>
                <p>Explore new business opportunities and manage your investment portfolio.</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary"><i class="fas fa-search-dollar"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>New Proposals</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Active Investments</p>
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
                        <button class="btn btn-primary" onclick="window.dashboard.loadSection('browse-proposals')">Browse Proposals</button>
                        <button class="btn btn-outline" onclick="window.dashboard.loadSection('post-proposal')">Post Investment Proposal</button>
                    </div>
                </div>
            </div>
        `
  },

  renderBrowseProposals: async () => {
    window.logger.info("Rendering Browse Proposals")
    try {
      const proposalsSnapshot = await window.firebaseDB.collection("business-proposals").get()

      let proposalsHtml = ""
      if (proposalsSnapshot.empty) {
        proposalsHtml = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>No Business Proposals Yet</h3><p>There are no business ideas posted at the moment. Check back later!</p></div>`
      } else {
        proposalsHtml = `<div class="table-container"><table class="table"><thead><tr><th>Title</th><th>Category</th><th>Funding</th><th>Stage</th><th>Actions</th></tr></thead><tbody>`
        proposalsSnapshot.forEach((doc) => {
          const proposal = doc.data()
          proposalsHtml += `
                        <tr>
                            <td>${proposal.ideaTitle}</td>
                            <td><span class="badge badge-primary">${proposal.ideaCategory}</span></td>
                            <td>₹${proposal.fundingAmount?.toLocaleString("en-IN") || "N/A"}</td>
                            <td><span class="badge badge-success">${proposal.businessStage}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline">View Details</button>
                                <button class="btn btn-sm btn-primary">Express Interest</button>
                            </td>
                        </tr>
                    `
        })
        proposalsHtml += `</tbody></table></div>`
      }

      return `
                <div class="content-section">
                    <div class="section-header">
                        <h2>Browse Business Proposals</h2>
                    </div>
                    <div class="section-body">
                        ${proposalsHtml}
                    </div>
                </div>
            `
    } catch (error) {
      window.logger.error("Error fetching business proposals for investor", error)
      return `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Proposals</h3><p>Could not load business proposals. Please try again.</p></div>`
    }
  },

  renderMyInvestments: () => {
    window.logger.info("Rendering My Investments")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>My Investments</h2>
                </div>
                <div class="section-body">
                    <div class="empty-state">
                        <i class="fas fa-money-check-alt"></i>
                        <h3>No Active Investments</h3>
                        <p>You haven't made any investments yet. Browse proposals to find your next opportunity!</p>
                    </div>
                </div>
            </div>
        `
  },

  renderPostInvestmentProposalForm: () => {
    window.logger.info("Rendering Post Investment Proposal Form")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Post Investment Proposal</h2>
                </div>
                <div class="section-body">
                    <form id="postInvestmentProposalForm">
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
                        <div class="form-group">
                            <label for="investmentCriteria">Investment Criteria</label>
                            <textarea id="investmentCriteria" name="investmentCriteria" rows="5" placeholder="Describe your investment criteria, what you look for in a startup, etc."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Proposal</button>
                    </form>
                </div>
            </div>
        `
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
    window.logger.info("Rendering Investor Profile")
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
                            <label>Investor Type</label>
                            <input type="text" value="${userProfile.investorType || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Investment Range</label>
                            <input type="text" value="${userProfile.investmentRange || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Preferred Sectors</label>
                            <input type="text" value="${userProfile.preferredSectors?.join(", ") || ""}" readonly>
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
