import React from "react";
import { Link } from "react-router-dom";
import { getUserRole } from "../services/api";
import "./Home.css";

const Home = () => {
  const userRole = getUserRole();
  const userName = localStorage.getItem("userName");

  return (
    <div className="dashboard-container">
      {/* Sidebar Glow */}
      <div className="dashboard-overlay"></div>

      <div className="dashboard-content">
        {/* ===== HEADER ===== */}
        <div className="dashboard-header">
          <div>
            <h1>Citizen Resolution System</h1>
            <p>Smart complaint management platform for better communities.</p>
          </div>

          {userRole && userName ? (
            <div className="profile-box">
              <div className="profile-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
l
              <div>
                <h3>{userName}</h3>
                <span>{userRole}</span>
              </div>
            </div>
          ) : (
            <div className="header-buttons">
              <Link to="/login" className="primary-btn">
                Login
              </Link>

              <Link to="/register" className="secondary-btn">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ===== HERO ===== */}
        <div className="hero-card">
          <div className="hero-left">
            <h2>Building Better Communities Together</h2>

            <p>
              Submit complaints, track resolutions, and help improve your
              surroundings through an efficient digital governance platform.
            </p>

            {!userRole && (
              <div className="hero-buttons">
                <Link to="/register" className="cta-btn primary">
                  Get Started
                </Link>

                <Link to="/login" className="cta-btn secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT PROFESSIONAL PANEL */}
          <div className="hero-info-panel">
            <div className="info-box">
              <span>✔</span>
              <div>
                <h4>Fast Complaint Resolution</h4>
                <p>Track issues in real time with transparent updates.</p>
              </div>
            </div>

            <div className="info-box">
              <span>🔒</span>
              <div>
                <h4>Secure Authentication</h4>
                <p>Your information remains protected and encrypted.</p>
              </div>
            </div>

            <div className="info-box">
              <span>📍</span>
              <div>
                <h4>Community Driven</h4>
                <p>Citizens and authorities working together efficiently.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        {userRole ? (
          <div className="section">
            <div className="section-title">
              <h2>Quick Actions</h2>
            </div>

            <div className="card-grid">
              {userRole === "citizen" && (
                <>
                  <div className="dashboard-card">
                    <div className="card-icon">📝</div>

                    <h3>Submit Complaint</h3>

                    <p>
                      Report road issues, sanitation problems, electricity
                      faults, and more.
                    </p>

                    <Link to="/submit-complaint" className="card-btn">
                      Submit Now
                    </Link>
                  </div>

                  <div className="dashboard-card">
                    <div className="card-icon">📊</div>

                    <h3>My Complaints</h3>

                    <p>
                      Track all your submitted complaints and resolution status.
                    </p>

                    <Link to="/my-complaints" className="card-btn">
                      View Complaints
                    </Link>
                  </div>
                </>
              )}

              {userRole === "admin" && (
                <div className="dashboard-card admin-card">
                  <div className="card-icon">⚙️</div>

                  <h3>Admin Dashboard</h3>

                  <p>
                    Manage complaints, assign priorities, and monitor issue
                    resolutions.
                  </p>

                  <Link to="/admin-dashboard" className="card-btn">
                    Open Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="section">
            <div className="section-title">
              <h2>How It Works</h2>
            </div>

            <div className="steps-container">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Create Account</h3>
                <p>Register securely and access the platform.</p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Submit Issues</h3>
                <p>Upload complaint details with photos and location.</p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Track Progress</h3>
                <p>Monitor complaint updates and resolution status.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
