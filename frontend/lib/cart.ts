export interface CartItem {
  id: number | string;
  brand_name?: string;
  name?: string;
  medicine_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
  salt_name?: string;
  composition?: string;
  price: number | string;
  quantity: number;
}

interface StoredUser {
  id?: number | string;
  email?: string;
}

export function getAuthenticatedUser(): StoredUser | null {
  if (typeof window === "undefined" || !window.localStorage.getItem("auth_token")) return null;

  try {
    return JSON.parse(window.localStorage.getItem("user") ?? "null") as StoredUser | null;
  } catch {
    return null;
  }
}

export function getCartKey(): string | null {
  const user = getAuthenticatedUser();
  if (!user) return null;
  return `cart:${user.id ?? user.email ?? "current"}`;
}

export function readCart(): CartItem[] {
  const key = getCartKey();
  if (!key) return [];

  try {
    const storedValue = window.localStorage.getItem(key);
    const legacyValue = storedValue === null ? window.localStorage.getItem("cart") : null;
    const value = JSON.parse(storedValue ?? legacyValue ?? "[]") as CartItem[];
    if (legacyValue !== null && Array.isArray(value)) {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.localStorage.removeItem("cart");
    }
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  const key = getCartKey();
  if (key) window.localStorage.setItem(key, JSON.stringify(items));
}

export function addCartItem(item: Omit<CartItem, "quantity">, quantity: number) {
  const cart = readCart();
  const existing = cart.find((cartItem) => String(cartItem.id) === String(item.id));

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
  return cart;
}

export function cartItemName(item: CartItem) {
  return item.brand_name || item.name || item.medicine_name || "Medicine";
}

export function cartItemPrice(item: CartItem) {
  return Number(item.price) || 0;
}