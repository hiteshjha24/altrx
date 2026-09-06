"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
  });

  // Color Palette - Consistent with Home Page
  const colors = {
    black: "#000000",
    almostBlack: "#060807",
    darkGray: "#2A2A2A",
    white: "#FFFFFF",
    lightGray: "#D1D5DB",
    mediumGray: "#8B8B8B",
    brightBlue: "#1998F4",
    cyan: "#2F959E",
    emeraldGreen: "#59C975",
    aquaGreen: "#68C795",
    darkCyan: "#196A9A",
    neonGreen: "#4CAA9A",
    red: "#EF4444",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.first_name.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }

    if (!formData.last_name.trim()) {
      setError("Last name is required");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(true);

      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: colors.black, color: colors.white, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 24, color: colors.emeraldGreen }}>✓</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Account Created!</h2>
          <p style={{ color: colors.lightGray, marginBottom: 24 }}>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: colors.black, color: colors.white, minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: "70px",
          borderBottom: `1px solid ${colors.darkGray}`,
          background: colors.almostBlack,
          backdropFilter: "blur(10px)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textDecoration: "none" }}>
          <img
            src="/logo3.png"
            alt="AltRx Logo"
            style={{
              width: 180,
              height: 180,
              borderRadius: 4,
              objectFit: "contain",
            }}
          />
        </Link>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 14, color: colors.lightGray, cursor: "pointer", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/login" style={{ fontSize: 14, color: colors.lightGray, cursor: "pointer", textDecoration: "none" }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            background: colors.almostBlack,
            border: `1px solid ${colors.darkGray}`,
            borderRadius: 16,
            padding: 40,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: colors.brightBlue,
                textDecoration: "none",
                fontSize: 14,
                marginBottom: 24,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: colors.white }}>Create Account</h1>
            <p style={{ color: colors.lightGray, fontSize: 14 }}>Join AltRx to find affordable medicine alternatives</p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: `${colors.red}20`,
                border: `1px solid ${colors.red}`,
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 24,
                color: colors.red,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
              <div style={{ minWidth: 0, boxSizing: "border-box" }}>
                <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>First Name</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: colors.darkGray,
                    border: `1px solid ${colors.darkGray}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    transition: "all 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                  }}
                >
                  <User size={18} color={colors.mediumGray} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="John"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.white,
                      outline: "none",
                      flex: 1,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ minWidth: 0, boxSizing: "border-box" }}>
                <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>Last Name</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: colors.darkGray,
                    border: `1px solid ${colors.darkGray}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    transition: "all 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                  }}
                >
                  <User size={18} color={colors.mediumGray} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.white,
                      outline: "none",
                      flex: 1,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>Email Address</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: colors.darkGray,
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                }}
              >
                <Mail size={18} color={colors.mediumGray} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.white,
                    outline: "none",
                    flex: 1,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>Phone (Optional)</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: colors.darkGray,
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                }}
              >
                <Phone size={18} color={colors.mediumGray} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.white,
                    outline: "none",
                    flex: 1,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>Password</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: colors.darkGray,
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                }}
              >
                <Lock size={18} color={colors.mediumGray} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.white,
                    outline: "none",
                    flex: 1,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: colors.lightGray, display: "block", marginBottom: 8 }}>Confirm Password</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: colors.darkGray,
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.brightBlue;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.darkGray;
                }}
              >
                <Lock size={18} color={colors.mediumGray} />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.white,
                    outline: "none",
                    flex: 1,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 24px",
                background: colors.brightBlue,
                color: colors.white,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
                marginBottom: 16,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.background = colors.darkCyan;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.background = colors.brightBlue;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <div style={{ textAlign: "center" }}>
              <p style={{ color: colors.lightGray, fontSize: 14 }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: colors.brightBlue, textDecoration: "none", fontWeight: 600, cursor: "pointer" }}>
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
