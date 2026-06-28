"use client";

import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Color Palette
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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 900 }}>
            <img 
                src="/logo.png" 
                alt="AltRx Logo"
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 8,
                  objectFit: "contain",
                }}
            />
            <span>AltRx</span>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Home", "Upload Prescription", "Find Medicines", "Health Resources", "Track Order", "About Us"].map((item) => (
            <a key={item} href="#" style={{ fontSize: 14, color: colors.lightGray, cursor: "pointer", textDecoration: "none" }}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <div style={{ fontSize: 13 }}>
              <div style={{ color: colors.lightGray, fontSize: 11 }}>Deliver to</div>
              <div>New Delhi</div>
            </div>
          </div>
          <button style={{ background: "transparent", border: "none", color: colors.lightGray, cursor: "pointer", fontSize: 14 }}>
            Login / Sign Up
          </button>
          <div style={{ cursor: "pointer" }}>🛒 0</div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          padding: "60px 40px",
          alignItems: "center",
          gap: 40,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Left side */}
        <div>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: colors.white }}>
            Your Prescription,
            <span style={{ color: colors.brightBlue }}> Our Priority.</span>
          </h1>

          <p style={{ fontSize: 16, color: colors.lightGray, marginBottom: 40, lineHeight: 1.6 }}>
            Upload your prescription, get alternate medicines with same benefits and order with fast delivery.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
            {/* Upload Prescription Card */}
            <div
              style={{
                border: `1px solid ${colors.darkGray}`,
                borderRadius: 12,
                padding: 24,
                background: colors.almostBlack,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📤</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: colors.white }}>Upload Prescription</div>
              <div style={{ fontSize: 13, color: colors.lightGray, marginBottom: 12 }}>Upload a clear image of your prescription</div>
              <button
                style={{
                  background: "transparent",
                  border: `1px solid ${colors.brightBlue}`,
                  color: colors.brightBlue,
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Choose File
              </button>
            </div>

            {/* Search Card */}
            <div
              style={{
                border: `1px solid ${colors.darkGray}`,
                borderRadius: 12,
                padding: 24,
                background: colors.almostBlack,
              }}
            >
              <div style={{ fontSize: 14, color: colors.lightGray, marginBottom: 12 }}>Or Search Medicines</div>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by medicine"
                  style={{
                    flex: 1,
                    background: colors.almostBlack,
                    border: `1px solid ${colors.darkGray}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: colors.white,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: colors.brightBlue,
                    border: "none",
                    borderRadius: 6,
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: colors.white,
                    fontSize: 18,
                  }}
                >
                  🔍
                </button>
              </form>
            </div>
          </div>

          {/* Features */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "✓", label: "100% Genuine Medicines" },
              { icon: "🔒", label: "Secure & Private" },
              { icon: "⚡", label: "Fast Delivery in 30-60 mins" },
            ].map((feature) => (
              <div key={feature.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 20, color: colors.emeraldGreen }}>{feature.icon}</span>
                <span style={{ fontSize: 13, color: colors.lightGray }}>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Image placeholder */}
        <div
          style={{
            background: colors.black,
            borderRadius: 0,
            height: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `0px solid ${colors.darkGray}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 1. Semicircle Background */}
          <div
            style={{
                position: "absolute",
                width: 500,  // Keep width exactly double the height
                height: 250, 
                borderRadius: "250px 250px 0 0", // Creates the perfectly flat-bottom semicircle
                background: "linear-gradient(135deg, #62FF8B 0%, #2BC5FF 100%)",
                bottom: 150, // Adjust this to move the semicircle up or down
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 0,
            }}
          />

          {/* 2. Flat Base Shadow */}
          <div
            style={{
                position: "absolute",
                width: 550, // Slightly wider than the semicircle
                height: 100, // Thin height to act as a grounded floor shadow
                bottom: 85, // Positioned just below the flat base of the semicircle
                left: "50%",
                transform: "translateX(-50%)",
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)",
                filter: "blur(14px)", // Tight blur for a realistic drop shadow
                zIndex: 1,
            }}
          />

          {/* 3. Hero Image Container */}
          <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 2,
            }}
        >
            <img 
                src="/hero-image.png" 
                alt="AltRx Hero"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
            />
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div style={{ padding: "60px 40px", background: colors.almostBlack, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, textAlign: "center", color: colors.white }}>
            Our Process in 4 Steps
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { num: "01", icon: "📤", title: "Upload Prescription", desc: "Upload and we'll review your prescription" },
              { num: "02", icon: "✓", title: "Get Alternatives", desc: "We suggest alternate medicines with same benefits" },
              { num: "03", icon: "🛒", title: "Add to Cart", desc: "Add medicines to cart and place your order" },
              { num: "04", icon: "🚚", title: "Fast Delivery", desc: "Get your medicines delivered in 30-60 mins" },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 24,
                  background: colors.almostBlack,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: 11, color: colors.brightBlue, fontWeight: 700, marginBottom: 8 }}>STEP {step.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: colors.white }}>{step.title}</div>
                <div style={{ fontSize: 13, color: colors.lightGray }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose AltRx Section */}
      <div style={{ padding: "60px 40px", background: colors.black }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, textAlign: "center", color: colors.white }}>Why Choose AltRx?</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {[
              { icon: "🛡️", title: "Why Choose AltRx?", desc: "We make healthcare simple, accessible and affordable for everyone." },
              { icon: "👥", title: "Same Benefits", desc: "Alternate medicines with same composition" },
              { icon: "💰", title: "Affordable Prices", desc: "Best prices on all medicines" },
              { icon: "👨‍⚕️", title: "Trusted by Doctors", desc: "Partnered with verified pharmacies" },
              { icon: "📞", title: "24/7 Support", desc: "We're here to help you anytime" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 0 ? colors.almostBlack : colors.black,
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: colors.white }}>{item.title}</div>
                <div style={{ fontSize: 13, color: colors.lightGray, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div style={{ padding: "60px 40px", background: colors.black, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: colors.white }}>Popular Categories</h2>
          <p style={{ fontSize: 14, color: colors.lightGray, marginBottom: 40 }}>Find affordable alternatives for these popular medicine categories</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {[
              { icon: "💊", name: "Pain Relief", count: "45+ alternatives" },
              { icon: "🤒", name: "Cold & Fever", count: "38+ alternatives" },
              { icon: "🫁", name: "Cough & Cold", count: "52+ alternatives" },
              { icon: "💓", name: "Heart Care", count: "29+ alternatives" },
              { icon: "🩺", name: "Blood Pressure", count: "41+ alternatives" },
              { icon: "🧬", name: "Vitamins", count: "56+ alternatives" },
            ].map((cat) => (
              <div
                key={cat.name}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 20,
                  background: colors.almostBlack,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors.white, marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: colors.brightBlue }}>{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: "60px 40px", background: colors.almostBlack, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { stat: "50K+", label: "Happy Customers", color: colors.emeraldGreen },
              { stat: "2500+", label: "Medicines Available", color: colors.brightBlue },
              { stat: "1000+", label: "Verified Pharmacies", color: colors.aquaGreen },
              { stat: "₹50L+", label: "Savings Achieved", color: colors.neonGreen },
            ].map((item) => (
              <div
                key={item.stat}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 32,
                  background: colors.black,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 900, color: item.color, marginBottom: 8 }}>{item.stat}</div>
                <div style={{ fontSize: 14, color: colors.lightGray }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Medicines */}
      <div style={{ padding: "60px 40px", background: colors.black, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: colors.white }}>Featured Deals Today</h2>
          <p style={{ fontSize: 14, color: colors.lightGray, marginBottom: 40 }}>Save up to 80% on popular medicines with AltRx</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { name: "Crocin 650mg", brand: "GSK", saving: "72%", price: "₹22", alt: "P-500 (Generic)" },
              { name: "Dolo 650mg", brand: "Micro Labs", saving: "65%", price: "₹30", alt: "Metacin 500mg" },
              { name: "Brufen 400mg", brand: "Abbott", saving: "58%", price: "₹42", alt: "Generic Ibuprofen" },
            ].map((med) => (
              <div
                key={med.name}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 24,
                  background: colors.almostBlack,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.white, marginBottom: 4 }}>{med.name}</div>
                    <div style={{ fontSize: 12, color: colors.lightGray }}>{med.brand}</div>
                  </div>
                  <div style={{
                    background: colors.emeraldGreen,
                    color: colors.black,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    Save {med.saving}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: colors.lightGray, marginBottom: 8 }}>💰 Original Price</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: colors.brightBlue, marginBottom: 12 }}>{med.price}</div>
                  <div style={{ fontSize: 12, color: colors.lightGray, marginBottom: 8 }}>✓ Cheapest Alternative</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.white }}>{med.alt}</div>
                </div>
                <button style={{
                  width: "100%",
                  background: colors.brightBlue,
                  border: "none",
                  color: colors.white,
                  padding: "10px",
                  borderRadius: 6,
                  fontWeight: 700,
                  cursor: "pointer",
                }}>
                  View Alternatives →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Detailed */}
      <div style={{ padding: "60px 40px", background: colors.almostBlack, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, textAlign: "center", color: colors.white }}>
            How AltRx Works - Step by Step
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
            {[
              { 
                step: "01",
                title: "Upload or Search",
                desc: "Upload your prescription image or search for any medicine by name. Our system instantly identifies the active ingredients.",
                points: ["📸 Clear prescription photos", "🔍 Smart search engine", "⚡ Instant recognition"]
              },
              { 
                step: "02",
                title: "Find Alternatives",
                desc: "Get a curated list of generic and branded alternatives with the same active ingredient composition.",
                points: ["✓ Same benefits guaranteed", "🧬 Identical salt composition", "📊 Side-by-side comparison"]
              },
              { 
                step: "03",
                title: "Compare & Save",
                desc: "Compare prices, effectiveness, and user reviews. See exactly how much you'll save per month and year.",
                points: ["💰 Up to 80% savings", "📈 Monthly savings calculator", "⭐ Verified reviews"]
              },
              { 
                step: "04",
                title: "Order & Deliver",
                desc: "Add to cart and order. We partner with verified pharmacies for fastest and safest delivery.",
                points: ["🚚 30-60 mins delivery", "🔐 100% authentic", "📦 Discreet packaging"]
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 28,
                  background: colors.black,
                }}
              >
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    background: colors.brightBlue,
                    color: colors.white,
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: colors.white }}>{item.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: colors.lightGray, lineHeight: 1.6, marginBottom: 16 }}>{item.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {item.points.map((point) => (
                    <div key={point} style={{ fontSize: 13, color: colors.lightGray, display: "flex", gap: 8 }}>
                      <span style={{ color: colors.emeraldGreen }}>{point.split(" ")[0]}</span>
                      <span>{point.split(" ").slice(1).join(" ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose AltRx - Enhanced */}
      <div style={{ padding: "60px 40px", background: colors.black, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, textAlign: "center", color: colors.white }}>
            Why Thousands Trust AltRx
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { 
                icon: "🛡️",
                title: "100% Authentic Medicines",
                desc: "Every medicine is sourced from verified pharmacies and manufacturers. Direct partnerships ensure authenticity.",
              },
              { 
                icon: "💰",
                title: "Massive Savings",
                desc: "Save up to 80% by switching to generic alternatives. Same active ingredients, fraction of the cost.",
              },
              { 
                icon: "⚡",
                title: "Lightning Fast Delivery",
                desc: "Orders delivered in 30-60 minutes across major Indian cities. Track your order in real-time.",
              },
              { 
                icon: "👨‍⚕️",
                title: "Doctor Recommended",
                desc: "Endorsed by healthcare professionals. All suggestions are medically verified and safe.",
              },
              { 
                icon: "🔒",
                title: "Privacy Protected",
                desc: "Your prescription and medical data are encrypted and never shared. Complete confidentiality guaranteed.",
              },
              { 
                icon: "📞",
                title: "24/7 Customer Support",
                desc: "Expert pharmacists available round the clock. Chat, call, or email anytime for help.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 24,
                  background: colors.almostBlack,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.white, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: colors.lightGray, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "60px 40px", background: colors.almostBlack, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, textAlign: "center", color: colors.white }}>
            What Our Customers Say
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { name: "Rajesh Kumar", city: "Delhi", testimonial: "Saved ₹3,000 per month on my diabetes medication. AltRx is a lifesaver!", rating: 5 },
              { name: "Priya Sharma", city: "Mumbai", testimonial: "Fast delivery and authentic medicines. I recommend AltRx to all my friends.", rating: 5 },
              { name: "Amit Patel", city: "Bangalore", testimonial: "Finding alternatives was so easy. Great app and amazing customer support!", rating: 4 },
            ].map((review) => (
              <div
                key={review.name}
                style={{
                  border: `1px solid ${colors.darkGray}`,
                  borderRadius: 12,
                  padding: 24,
                  background: colors.black,
                }}
              >
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} style={{ fontSize: 16 }}>⭐</span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: colors.lightGray, lineHeight: 1.6, marginBottom: 16 }}>"{review.testimonial}"</p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.white }}>{review.name}</div>
                  <div style={{ fontSize: 12, color: colors.lightGray }}>{review.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ padding: "60px 40px", background: colors.black, borderTop: `1px solid ${colors.darkGray}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", padding: "40px", borderRadius: 16, background: `linear-gradient(135deg, ${colors.almostBlack}, ${colors.almostBlack})`, border: `1px solid ${colors.darkGray}` }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, color: colors.white }}>
            Ready to Save on Your Medicines?
          </h2>
          <p style={{ fontSize: 16, color: colors.lightGray, marginBottom: 32, lineHeight: 1.6 }}>
            Upload your prescription or search for medicines to find affordable alternatives. Save money without compromising on quality.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button style={{
              background: colors.brightBlue,
              color: colors.white,
              border: "none",
              padding: "14px 32px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}>
              Upload Prescription Now
            </button>
            <button style={{
              background: "transparent",
              color: colors.brightBlue,
              border: `1px solid ${colors.brightBlue}`,
              padding: "14px 32px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}>
              Search Medicines
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: "60px 40px", textAlign: "center", borderTop: `1px solid ${colors.darkGray}`, color: colors.mediumGray, fontSize: 13, background: colors.almostBlack }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, marginBottom: 40, textAlign: "left" }}>
            <div>
              <h4 style={{ color: colors.white, fontWeight: 700, marginBottom: 16 }}>About AltRx</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>About Us</a></li>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Our Mission</a></li>
                <li><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Media Kit</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: colors.white, fontWeight: 700, marginBottom: 16 }}>Help & Support</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Contact Us</a></li>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>FAQs</a></li>
                <li><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: colors.white, fontWeight: 700, marginBottom: 16 }}>Legal</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Privacy Policy</a></li>
                <li style={{ marginBottom: 8 }}><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Terms & Conditions</a></li>
                <li><a href="#" style={{ color: colors.lightGray, textDecoration: "none" }}>Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: colors.white, fontWeight: 700, marginBottom: 16 }}>Follow Us</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 8 }}>📘 Facebook</li>
                <li style={{ marginBottom: 8 }}>𝕏 Twitter</li>
                <li>📷 Instagram</li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 24, borderTop: `1px solid ${colors.darkGray}` }}>
          <p>© 2024 AltRx. All rights reserved. | Made with ❤️ for your health</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>Consult a qualified doctor before switching medicines.</p>
        </div>
      </footer>
    </div>
  );
}
