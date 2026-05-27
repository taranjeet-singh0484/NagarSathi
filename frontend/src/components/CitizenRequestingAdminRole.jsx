import React, { useState, useEffect } from "react";
import "./CititzenRequestingAdminRole.css";

const CitizenAdminRequestPanel = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  // Get user data from localStorage
 const adminStatus = localStorage.getItem("adminStatus");

 useEffect(() => {
   setStatus(adminStatus || "none");
 }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleRequest = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin-requests/request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setStatus("pending");

      // update local storage
    localStorage.setItem("adminStatus", "pending");
      showToast(data.message);
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay"></div>

      <div className="dashboard-content">
        <div className="request-hero-card">
          {/* LEFT */}
          <div className="request-left">
            <div className="request-badge">🛡️ Admin Access</div>

            <h1>Request Administrative Access</h1>

            <p>
              Gain elevated permissions to manage complaints, monitor platform
              activities, and help maintain community services efficiently.
            </p>

            {status === "none" && (
              <button
                className="request-btn"
                onClick={handleRequest}
                disabled={loading}
              >
                {loading ? "Submitting Request..." : "Request Admin Access"}
              </button>
            )}

            {status === "pending" && (
              <div className="request-status pending">
                ⏳ Your request is currently under review
              </div>
            )}

            {status === "approved" && (
              <div className="request-status approved">
                ✅ Your request has been approved
              </div>
            )}

            {status === "rejected" && (
              <>
                <div className="request-status rejected">
                  ❌ Your request was rejected
                </div>

                <button className="request-btn" onClick={handleRequest}>
                  Request Again
                </button>
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="request-info-panel">
            <div className="request-info-box">
              <span>⚙️</span>

              <div>
                <h4>Manage Complaints</h4>

                <p>Review, update, and resolve citizen complaints.</p>
              </div>
            </div>

            <div className="request-info-box">
              <span>📊</span>

              <div>
                <h4>Access Dashboard</h4>

                <p>Monitor reports and platform analytics efficiently.</p>
              </div>
            </div>

            <div className="request-info-box">
              <span>🔒</span>

              <div>
                <h4>Secure Permissions</h4>

                <p>Admin actions are protected through role-based access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenAdminRequestPanel;
