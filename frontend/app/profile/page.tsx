"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LogOut, MapPin, Save, UserRound } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";

const colors = {
  black: "#000000",
  almostBlack: "#060807",
  darkGray: "#2A2A2A",
  white: "#FFFFFF",
  lightGray: "#D1D5DB",
  muted: "#8B8B8B",
  blue: "#1998F4",
  green: "#59C975",
  red: "#F87171",
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", address: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    api.getCurrentUser(token)
      .then((profile) => {
        setUser(profile);
        setForm({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
        });
        window.localStorage.setItem("user", JSON.stringify(profile));
      })
      .catch(() => setError("We couldn't load your profile. Please sign in again."))
      .finally(() => setLoading(false));
  }, []);

  const completedFields = [form.first_name, form.last_name, form.phone, form.address, form.city].filter((field) => field.trim()).length;
  const completion = Math.round((completedFields / 5) * 100);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = window.localStorage.getItem("auth_token");
    if (!token) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await api.updateCurrentUser(token, form);
      setUser(updated);
      window.localStorage.setItem("user", JSON.stringify(updated));
      setMessage("Your profile is up to date.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return <main style={{ minHeight: "100vh", background: colors.black, color: colors.white, display: "grid", placeItems: "center" }}>Loading your profile...</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 80% 0%, rgba(25,152,244,.18), transparent 35%), #000", color: colors.white }}>
      <nav style={{ height: 70, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: colors.almostBlack, borderBottom: `1px solid ${colors.darkGray}` }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}><img src="/logo3.png" alt="AltRx Logo" style={{ width: 150, height: 150, objectFit: "contain" }} /></Link>
        <Link href="/" style={{ color: colors.lightGray, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}><ArrowLeft size={17} /> Back to home</Link>
      </nav>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div style={{ marginBottom: 34 }}>
          <p style={{ color: colors.green, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Your AltRx profile</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05, marginBottom: 14 }}>Make healthcare feel more personal.</h1>
          <p style={{ color: colors.lightGray, maxWidth: 620, lineHeight: 1.7 }}>Complete your details so medicine searches, delivery information, and future care are ready when you need them.</p>
        </div>

        {error && <p style={{ color: colors.red, border: `1px solid ${colors.red}55`, padding: 14, borderRadius: 8, marginBottom: 20 }}>{error}</p>}
        {message && <p style={{ color: colors.green, border: `1px solid ${colors.green}55`, padding: 14, borderRadius: 8, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}><Check size={17} /> {message}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <aside style={{ border: `1px solid ${colors.darkGray}`, background: "rgba(6,8,7,.86)", padding: 28, borderRadius: 12, height: "fit-content" }}>
            <div style={{ width: 82, height: 82, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #1998F4, #59C975)", fontSize: 36, fontWeight: 900, marginBottom: 20 }}>{form.first_name.charAt(0).toUpperCase()}</div>
            <h2 style={{ fontSize: 22, marginBottom: 6 }}>{user ? `${user.first_name} ${user.last_name}` : "Your profile"}</h2>
            <p style={{ color: colors.muted, fontSize: 14, wordBreak: "break-word", marginBottom: 25 }}>{user?.email}</p>
            <div style={{ height: 7, background: colors.darkGray, borderRadius: 99, overflow: "hidden", marginBottom: 10 }}><div style={{ width: `${completion}%`, height: "100%", background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})` }} /></div>
            <p style={{ color: colors.lightGray, fontSize: 13 }}>{completion}% complete</p>
            <button type="button" onClick={logout} style={{ marginTop: 30, border: `1px solid ${colors.darkGray}`, background: "#101512", color: colors.lightGray, padding: "10px 14px", borderRadius: 7, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 700 }}><LogOut size={16} /> Sign out</button>
          </aside>

          <form onSubmit={handleSubmit} style={{ border: `1px solid ${colors.darkGray}`, background: colors.almostBlack, padding: "30px clamp(20px, 4vw, 42px)", borderRadius: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 26 }}><UserRound size={21} color={colors.green} /><div><h2 style={{ fontSize: 20 }}>Personal details</h2><p style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>Keep your account information current.</p></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
              {([['first_name', 'First name'], ['last_name', 'Last name'], ['phone', 'Phone number'], ['city', 'City']] as const).map(([name, label]) => <label key={name} style={{ display: "grid", gap: 8, color: colors.lightGray, fontSize: 13 }}>{label}<input required={name === "first_name" || name === "last_name"} name={name} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} style={{ background: "#0D110F", border: `1px solid ${colors.darkGray}`, color: colors.white, borderRadius: 7, padding: "12px 13px", fontSize: 14, outline: "none" }} /></label>)}
              <label style={{ gridColumn: "1 / -1", display: "grid", gap: 8, color: colors.lightGray, fontSize: 13 }}><span style={{ display: "flex", gap: 6, alignItems: "center" }}><MapPin size={14} color={colors.green} /> Delivery address</span><textarea name="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={4} placeholder="Add your delivery address" style={{ resize: "vertical", background: "#0D110F", border: `1px solid ${colors.darkGray}`, color: colors.white, borderRadius: 7, padding: "12px 13px", fontSize: 14, outline: "none", fontFamily: "inherit" }} /></label>
            </div>
            <button type="submit" disabled={saving} style={{ marginTop: 28, border: "none", borderRadius: 7, padding: "13px 20px", background: saving ? colors.muted : `linear-gradient(135deg, ${colors.blue}, ${colors.green})`, color: colors.white, fontWeight: 800, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 9 }}>{saving ? "Saving..." : <><Save size={17} /> Save changes</>}</button>
          </form>
        </div>
      </section>
    </main>
  );
}