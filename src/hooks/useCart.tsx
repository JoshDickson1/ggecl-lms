// src/hooks/useCart.ts
// Wrap your app root with <CartProvider> in main.tsx or App.tsx:
//   import { CartProvider } from "@/hooks/useCart";
//   <CartProvider><App /></CartProvider>

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { courses, type Course } from "../data/courses";

export type CartItem = {
  courseId: string;
  addedAt: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  courses: Course[];
  total: number;
  originalTotal: number;
  promoCode: string;
  promoApplied: boolean;
  appliedPromoRate: number;
  setPromoCode: (v: string) => void;
  applyPromo: () => boolean;
  removePromo: () => void;
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  inCart: (courseId: string) => boolean;
};

const CartContext = createContext<CartCtx | null>(null);

const VALID_PROMOS: Record<string, number> = {
  LEARN10: 0.1,
  SAVE20:  0.2,
};

const DEMO_IDS = ["dev-001", "mkt-001", "mus-001"];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(
    DEMO_IDS.map((id) => ({ courseId: id, addedAt: Date.now() }))
  );
  const [promoCode, setPromoCode]             = useState("");
  const [promoApplied, setPromoApplied]       = useState(false);
  const [appliedPromoRate, setAppliedPromoRate] = useState(0);

  const cartCourses   = courses.filter((c) => items.some((i) => i.courseId === c.id));
  const subtotal      = cartCourses.reduce((s, c) => s + c.price, 0);
  const originalTotal = cartCourses.reduce((s, c) => s + c.originalPrice, 0);
  const total         = subtotal - (promoApplied ? subtotal * appliedPromoRate : 0);

  const addToCart = useCallback((courseId: string) => {
    setItems((p) => p.some((i) => i.courseId === courseId) ? p : [...p, { courseId, addedAt: Date.now() }]);
  }, []);

  const removeFromCart = useCallback((courseId: string) => {
    setItems((p) => p.filter((i) => i.courseId !== courseId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]); setPromoApplied(false); setAppliedPromoRate(0); setPromoCode("");
  }, []);

  const inCart = useCallback((courseId: string) => items.some((i) => i.courseId === courseId), [items]);

  const applyPromo = useCallback(() => {
    const rate = VALID_PROMOS[promoCode.trim().toUpperCase()];
    if (rate !== undefined) { setAppliedPromoRate(rate); setPromoApplied(true); return true; }
    return false;
  }, [promoCode]);

  const removePromo = useCallback(() => {
    setPromoApplied(false); setAppliedPromoRate(0); setPromoCode("");
  }, []);

  return (
    <CartContext.Provider value={{
      items, count: items.length, courses: cartCourses,
      total, originalTotal, promoCode, promoApplied, appliedPromoRate,
      setPromoCode, applyPromo, removePromo,
      addToCart, removeFromCart, clearCart, inCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}