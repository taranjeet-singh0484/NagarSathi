import React, { useState, useEffect } from "react";
import "./AdminRequestPannel.css";

const AdminRequestPannel = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin-requests/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
        console.log(
          "Error fetching admin requests:",
         err,
        );
      setError("Could not load pending requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/requests/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(data.message, action === "approve" ? "success" : "error");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showToast(err.message || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="arp-container">
      {/* Toast */}
      {toast && (
        <div className={`arp-toast arp-toast--${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="arp-header">
        <div>
          <h2 className="arp-title">Admin Requests</h2>
          <p className="arp-subtitle">
            Review and manage pending admin access requests
          </p>
        </div>
        <div className="arp-badge-count">
          <span>{requests.length}</span> Pending
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="arp-error">
          <span>⚠️</span> {error}
          <button onClick={fetchRequests} className="arp-retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="arp-loading">
          <div className="arp-spinner" />
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 && !error ? (
        <div className="arp-empty">
          <div className="arp-empty-icon">🎉</div>
          <h3>All clear!</h3>
          <p>No pending admin requests at the moment.</p>
        </div>
      ) : (
        <div className="arp-table-wrapper">
          <table className="arp-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Requested On</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((user) => (
                <tr key={user._id} className="arp-row">
                  <td>
                    <div className="arp-user-cell">
                      <div className="arp-avatar">{getInitials(user.name)}</div>
                      <span className="arp-user-name">{user.name}</span>
                    </div>
                  </td>
                  <td className="arp-email">{user.email}</td>
                  <td className="arp-date">
                    {formatDate(user.adminRequestedAt)}
                  </td>
                  <td className="arp-date">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="arp-actions">
                      <button
                        className="arp-btn arp-btn--approve"
                        onClick={() => handleAction(user._id, "approve")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === user._id + "approve" ? (
                          <span className="arp-btn-spinner" />
                        ) : (
                          "✓ Approve"
                        )}
                      </button>
                      <button
                        className="arp-btn arp-btn--reject"
                        onClick={() => handleAction(user._id, "reject")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === user._id + "reject" ? (
                          <span className="arp-btn-spinner" />
                        ) : (
                          "✕ Reject"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequestPannel;
