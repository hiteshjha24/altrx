"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await response.json();

      // Store token and user info in localStorage
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const destination = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(destination.startsWith("/") ? destination : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/signup" style={{ fontSize: 14, color: colors.lightGray, cursor: "pointer", textDecoration: "none" }}>
            Sign Up
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
            maxWidth: "450px",
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
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: colors.white }}>Welcome Back</h1>
            <p style={{ color: colors.lightGray, fontSize: 14 }}>Login to access your AltRx account and find affordable medicines</p>
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
            {/* Email Field */}
            <div style={{ marginBottom: 20 }}>
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

            {/* Password Field */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: colors.lightGray, display: "block" }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: colors.brightBlue, textDecoration: "none", cursor: "pointer" }}>
                  Forgot password?
                </a>
              </div>
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
                  placeholder="Enter your password"
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
              {loading ? "Logging In..." : "Login"}
            </button>

            {/* Signup Link */}
            <div style={{ textAlign: "center" }}>
              <p style={{ color: colors.lightGray, fontSize: 14 }}>
                Don't have an account?{" "}
                <Link href="/signup" style={{ color: colors.brightBlue, textDecoration: "none", fontWeight: 600, cursor: "pointer" }}>
                  Create one now
                </Link>
              </p>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: colors.darkGray }}></div>
            <span style={{ color: colors.mediumGray, fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: colors.darkGray }}></div>
          </div>

          {/* Continue as Guest */}
          <Link
            href="/"
            style={{
              display: "block",
              padding: "12px 24px",
              background: "transparent",
              color: colors.brightBlue,
              border: `1px solid ${colors.brightBlue}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${colors.brightBlue}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
