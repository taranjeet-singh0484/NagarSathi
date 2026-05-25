import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleRegister = () => {
    setIsLoading(true);
    const popup = window.open(
      `${import.meta.env.VITE_API_URL}/auth/google`,
      "Google Register",
      "width=500,height=600",
    );

    window.addEventListener(
      "message",
      (event) => {
        if (event.origin !== import.meta.env.VITE_BACKEND_ORIGIN) return;

        if (event.data.type === "AUTH_SUCCESS") {
          const { token, user, hasPassword} = event.data;
          localStorage.setItem("token", token);
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userName", user.name);
          localStorage.setItem("userId", user.id);
          localStorage.setItem("adminStatus", user.adminStatus);
          popup.close();
          setIsLoading(false);
          if (!hasPassword) {                             // show password setup modal
            setShowPasswordModal(true);
          } else {
            redirectUser();
          }
        }

        if (event.data.type === "AUTH_ERROR") {
          setErrorMessage("Google registration failed. Please try again.");
          setIsLoading(false);
          popup?.close();
        }
      },
      { once: true },
    );
  };

  const redirectUser = () => {
    // const role = localStorage.getItem("userRole");

    // if (role === "admin") {
    //   navigate("/admin-dashboard");
    // } else {
    //   navigate("/my-complaints");
    // }
    navigate("/");
  };

  const handleSetPassword = async () => {
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/set-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPasswordSuccess("Password set successfully!");
      setTimeout(() => {
        redirectUser();
      }, 1500);
    } catch (error) {
      setPasswordError(error.message || "Failed to set password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSkip = () => {
    redirectUser();
  };

  return (
    <div className="register-container">
      {/* Left Panel */}
      <div className="register-left">
        <div className="register-left-content">
          <div className="register-brand">
            <div className="register-brand-icon">🏛️</div>
            <h1>NagarSathi</h1>
          </div>
          <h2>Join Your Community</h2>
          <p>
            Be the change your city needs. Register to report issues and track
            resolutions in your area.
          </p>

          <div className="register-steps">
            <div className="register-step">
              <div className="step-number">1</div>
              <div className="step-text">
                <strong>Sign up with Google</strong>
                <p>One click secure registration</p>
              </div>
            </div>
            <div className="register-step">
              <div className="step-number">2</div>
              <div className="step-text">
                <strong>Report Issues</strong>
                <p>File complaints about civic problems</p>
              </div>
            </div>
            <div className="register-step">
              <div className="step-number">3</div>
              <div className="step-text">
                <strong>Track Progress</strong>
                <p>Monitor resolution status in real time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-card-header">
            <h2>Create Account</h2>
            <p>Join our citizen resolution system</p>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button
            className="google-btn-large"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            <svg width="22" height="22" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
              />
            </svg>
            {isLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="register-info">
            <div className="info-item">✅ No fake accounts</div>
            <div className="info-item">✅ Verified Google identity</div>
            <div className="info-item">✅ Secure & instant signup</div>
            <div className="info-item">✅ Auto assigned as Citizen</div>
          </div>

          <div className="admin-note">
            <span>🛡️</span>
            <p>
              Want Admin access? Register first then request admin role from
              settings.
            </p>
          </div>

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <span>🎉</span>
              <h3>Account Created!</h3>
              <p>Welcome to NagarSathi, {localStorage.getItem("userName")}!</p>
            </div>

            <div className="modal-body">
              <h4>
                Set up a password?{" "}
                <span className="optional-tag">Optional</span>
              </h4>
              <p className="modal-subtitle">
                Add a password so you can also login with your email in the
                future. You can always skip this and use Google to login.
              </p>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="success-message">{passwordSuccess}</div>
              )}

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-skip" onClick={handleSkip}>
                Skip for now
              </button>
              <button
                className="btn-set-password"
                onClick={handleSetPassword}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Saving..." : "Set Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
