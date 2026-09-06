"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { cartItemName, cartItemPrice, getAuthenticatedUser, readCart, saveCart, type CartItem } from "@/lib/cart";

const colors = {
  black: "#000000",
  almostBlack: "#060807",
  darkGray: "#2A2A2A",
  white: "#FFFFFF",
  lightGray: "#D1D5DB",
  muted: "#8B8B8B",
  blue: "#1998F4",
  green: "#59C975",
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAuthenticatedUser()) {
      window.location.href = "/login?next=/cart";
      return;
    }
    setItems(readCart());
    setReady(true);
  }, []);

  const updateQuantity = (id: number | string, change: number) => {
    const updated = items
      .map((item) => String(item.id) === String(id) ? { ...item, quantity: Math.max(0, item.quantity + change) } : item)
      .filter((item) => item.quantity > 0);
    setItems(updated);
    saveCart(updated);
  };

  const removeItem = (id: number | string) => {
    const updated = items.filter((item) => String(item.id) !== String(id));
    setItems(updated);
    saveCart(updated);
  };

  const total = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);

  if (!ready) {
    return <main style={{ minHeight: "100vh", background: colors.black, color: colors.white, display: "grid", placeItems: "center" }}>Opening your cart...</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 80% 0%, rgba(25,152,244,.16), transparent 35%), #000", color: colors.white, padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.lightGray, textDecoration: "none", marginBottom: 38 }}><ArrowLeft size={18} /> Back home</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}><ShoppingCart size={28} color={colors.green} /><h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", margin: 0 }}>Your cart</h1></div>
        <p style={{ color: colors.muted, marginBottom: 30 }}>Review your medicines before checkout.</p>

        {items.length === 0 ? (
          <section style={{ border: `1px solid ${colors.darkGray}`, borderRadius: 10, background: colors.almostBlack, padding: 50, textAlign: "center" }}>
            <ShoppingCart size={42} color={colors.muted} style={{ marginBottom: 14 }} />
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: colors.muted, marginBottom: 22 }}>Search for a medicine and add it here when you are ready.</p>
            <Link href="/search-page" style={{ display: "inline-flex", background: colors.blue, color: colors.white, padding: "11px 18px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>Find medicines</Link>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, .35fr)", gap: 20 }}>
            <section style={{ display: "grid", gap: 12 }}>
              {items.map((item) => (
                <article key={String(item.id)} style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", border: `1px solid ${colors.darkGray}`, borderRadius: 9, background: colors.almostBlack, padding: 20 }}>
                  <div><h2 style={{ fontSize: 18, marginBottom: 7 }}>{cartItemName(item)}</h2><p style={{ color: colors.muted, fontSize: 13 }}>{item.manufacturer || "AltRx catalogue"}{item.strength ? ` · ${item.strength}` : ""}</p><p style={{ color: colors.green, fontWeight: 800, marginTop: 10 }}>Rs {cartItemPrice(item).toFixed(2)} each</p></div>
                  <div style={{ textAlign: "right" }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity" style={quantityButtonStyle}><Minus size={14} /></button><strong style={{ minWidth: 20 }}>{item.quantity}</strong><button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity" style={quantityButtonStyle}><Plus size={14} /></button></div><strong>Rs {(cartItemPrice(item) * item.quantity).toFixed(2)}</strong><button type="button" onClick={() => removeItem(item.id)} title="Remove from cart" style={{ display: "flex", alignItems: "center", gap: 5, margin: "10px 0 0 auto", border: "none", background: "transparent", color: "#F87171", cursor: "pointer", fontSize: 12 }}><Trash2 size={14} /> Remove</button></div>
                </article>
              ))}
            </section>
            <aside style={{ height: "fit-content", border: `1px solid ${colors.darkGray}`, borderRadius: 9, background: colors.almostBlack, padding: 22 }}><h2 style={{ fontSize: 20, marginBottom: 20 }}>Order summary</h2><div style={{ display: "flex", justifyContent: "space-between", color: colors.muted, fontSize: 14, marginBottom: 12 }}><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div><div style={{ borderTop: `1px solid ${colors.darkGray}`, paddingTop: 16, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20 }}><span>Total</span><span style={{ color: colors.green }}>Rs {total.toFixed(2)}</span></div><button type="button" disabled style={{ width: "100%", marginTop: 22, border: "none", borderRadius: 7, padding: "13px 16px", background: colors.darkGray, color: colors.muted, fontWeight: 800, cursor: "not-allowed" }}>Checkout coming soon</button></aside>
          </div>
        )}
      </div>
    </main>
  );
}

const quantityButtonStyle = { width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.darkGray}`, borderRadius: 5, background: "#101512", color: colors.lightGray, cursor: "pointer" } as const;