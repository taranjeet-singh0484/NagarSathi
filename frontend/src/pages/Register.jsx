import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "citizen",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("userName", response.name);
      localStorage.setItem("userId", response._id);
      localStorage.setItem("adminStatus", response.adminStatus);

      if (response.adminStatus === "pending") {
        setSuccessMessage(response.message);
        setTimeout(() => navigate("/my-complaints"), 3000);
        return;
      }

      navigate("/my-complaints");
    } catch (error) {
      setErrorMessage(
        error.message || "Registration failed. Please try again.",
      );
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
            setSuccessMessage(
              "Registration successful! Your admin request is pending approval.",
            );
            setTimeout(() => navigate("/my-complaints"), 2000);
          } else {
            navigate("/my-complaints");
          }
        }

        if (event.data.type === "AUTH_ERROR") {
          setErrorMessage("Google login failed. Please try again.");
          popup?.close();
        }
      },
      { once: true },
    );
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
                <strong>Create Account</strong>
                <p>Sign up as a citizen in seconds</p>
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
            <span>or register with email</span>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? "error" : ""}
                />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email */}
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
                  placeholder="Enter your email address"
                  className={errors.email ? "error" : ""}
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Role */}
            <div className="form-group">
              <label htmlFor="role">Register As</label>
              <div className="role-options">
                <div
                  className={`role-option ${formData.role === "citizen" ? "active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "citizen" }))
                  }
                >
                  <span className="role-icon">👤</span>
                  <div>
                    <strong>Citizen</strong>
                    <p>Submit & track complaints</p>
                  </div>
                </div>
                <div
                  className={`role-option ${formData.role === "admin" ? "active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "admin" }))
                  }
                >
                  <span className="role-icon">🛡️</span>
                  <div>
                    <strong>Admin</strong>
                    <p>Requires approval</p>
                  </div>
                </div>
              </div>
              {formData.role === "admin" && (
                <small className="role-hint">
                  ⚠️ Admin access requires approval from an existing admin. You
                  can use the app as a citizen until approved.
                </small>
              )}
            </div>

            {/* Password */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={errors.password ? "error" : ""}
                  />
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className={errors.confirmPassword ? "error" : ""}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
