import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      localStorage.setItem("token", response.token);
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("adminStatus", response.user.adminStatus);

      if (response.user.adminStatus === "pending") {
        setSuccessMessage(response.message);
        setTimeout(() => navigate("/my-complaints"), 2000);
        return;
      }

      if (response.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/my-complaints");
      }
    } catch (error) {
      setLoginError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${import.meta.env.VITE_API_URL}/auth/google`,
      "Google Login",
      "width=500,height=600",
    );

    window.addEventListener(
      "message",
      (event) => {
        if (event.origin !== import.meta.env.VITE_BACKEND_ORIGIN) return;

        if (event.data.type === "AUTH_SUCCESS") {
          const { token, user } = event.data;
          localStorage.setItem("token", token);
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userName", user.name);
          localStorage.setItem("userId", user.id);
          localStorage.setItem("adminStatus", user.adminStatus);
          popup.close();

          if (user.adminStatus === "pending") {
            setSuccessMessage("Your admin request is pending approval.");
            setTimeout(() => navigate("/my-complaints"), 2000);
          } else if (user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/my-complaints");
          }
        }

        if (event.data.type === "AUTH_ERROR") {
          setLoginError("Google login failed. Please try again.");
          popup?.close();
        }
      },
      { once: true },
    );
  };

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-brand-icon">🏛️</div>
            <h1>NagarSathi</h1>
          </div>
          <h2>Your Voice, Our Priority</h2>
          <p>
            Report civic issues, track resolutions, and help build a better
            community together.
          </p>
          <div className="login-features">
            <div className="login-feature">
              <span>📋</span>
              <p>Submit complaints easily</p>
            </div>
            <div className="login-feature">
              <span>🔍</span>
              <p>Track complaint status</p>
            </div>
            <div className="login-feature">
              <span>⚡</span>
              <p>Fast resolution process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {loginError && <div className="error-message">{loginError}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Google Button */}
          <button className="google-btn" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 18 18">
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
            Continue with Google
          </button>

          <div className="divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register">Create one here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
