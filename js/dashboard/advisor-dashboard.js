// Advisor User Dashboard Module
window.advisorDashboard = {
  renderSection: async function (sectionId, userProfile) {
    let content = ""
    switch (sectionId) {
      case "overview":
        content = this.renderOverview(userProfile)
        break
      case "post-info":
        content = this.renderPostInformationForm()
        break
      case "view-queries":
        content = this.renderViewQueries()
        break
      case "post-solution":
        content = this.renderPostSolutionForm()
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
    window.logger.info("Rendering Advisor Overview")
    return `
            <div class="dashboard-overview">
                <h2>Welcome, ${userProfile.fullName || "Advisor"}!</h2>
                <p>Share your expertise, answer business queries, and provide valuable solutions.</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary"><i class="fas fa-question-circle"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Pending Queries</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success"><i class="fas fa-lightbulb"></i></div>
                        <div class="stat-info">
                            <h3>0</h3>
                            <p>Solutions Provided</p>
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
                        <button class="btn btn-primary" onclick="window.dashboard.loadSection('post-info')">Post New Information</button>
                        <button class="btn btn-outline" onclick="window.dashboard.loadSection('view-queries')">View Business Queries</button>
                    </div>
                </div>
            </div>
        `
  },

  renderPostInformationForm: () => {
    window.logger.info("Rendering Post Information Form")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Post New Information/Article</h2>
                </div>
                <div class="section-body">
                    <form id="postInfoForm">
                        <div class="form-group">
                            <label for="infoTitle">Title</label>
                            <input type="text" id="infoTitle" name="infoTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="infoContent">Content</label>
                            <textarea id="infoContent" name="infoContent" rows="10" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="infoCategory">Category</label>
                            <select id="infoCategory" name="infoCategory" required>
                                <option value="">Select Category</option>
                                <option value="business-strategy">Business Strategy</option>
                                <option value="financial-planning">Financial Planning</option>
                                <option value="marketing">Marketing</option>
                                <option value="legal">Legal</option>
                                <option value="technology">Technology</option>
                                <option value="operations">Operations</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Publish Information</button>
                    </form>
                </div>
            </div>
        `
  },

  renderViewQueries: () => {
    window.logger.info("Rendering View Queries")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Business Queries</h2>
                </div>
                <div class="section-body">
                    <div class="empty-state">
                        <i class="fas fa-question-circle"></i>
                        <h3>No Pending Queries</h3>
                        <p>There are no new business queries at the moment.</p>
                    </div>
                </div>
            </div>
        `
  },

  renderPostSolutionForm: () => {
    window.logger.info("Rendering Post Solution Form")
    return `
            <div class="content-section">
                <div class="section-header">
                    <h2>Post a Solution</h2>
                </div>
                <div class="section-body">
                    <form id="postSolutionForm">
                        <div class="form-group">
                            <label for="queryId">Related Query ID (Optional)</label>
                            <input type="text" id="queryId" name="queryId" placeholder="Enter ID of the query this solution addresses">
                        </div>
                        <div class="form-group">
                            <label for="solutionTitle">Solution Title</label>
                            <input type="text" id="solutionTitle" name="solutionTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="solutionContent">Solution Details</label>
                            <textarea id="solutionContent" name="solutionContent" rows="10" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Solution</button>
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
    window.logger.info("Rendering Advisor Profile")
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
                            <label>Area of Expertise</label>
                            <input type="text" value="${userProfile.expertise?.join(", ") || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Years of Experience</label>
                            <input type="text" value="${userProfile.experience || ""}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Consulting Rate</label>
                            <input type="text" value="₹${userProfile.consultingRate?.toLocaleString("en-IN") || "0"}/hour" readonly>
                        </div>
                        <div class="form-group">
                            <label>Certifications</label>
                            <textarea readonly>${userProfile.certifications || ""}</textarea>
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
