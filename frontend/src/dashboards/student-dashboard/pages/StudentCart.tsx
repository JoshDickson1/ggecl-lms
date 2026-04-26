import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Trash2, Tag, ArrowRight, Star,
  Shield, Zap, ChevronRight, X, CheckCircle2,
  Gift, Lock, BookOpen, Heart, Loader2, AlertCircle,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCart } from "@/services/cart.service";
import { useWishlist } from "@/services/wishlist.service";
import { type CartCourse } from "@/services/cart.service";

// ─── Promo codes (local) ──────────────────────────────────────────────────────
const PROMO_CODES: Record<string, number> = {
  LEARN10: 0.1,
  SAVE20: 0.2,
};

// ─── Cart item row ────────────────────────────────────────────────────────────
function CartItem({
  item,
  onRemove,
  onSaveForLater,
  removing,
  saving,
}: {
  item: CartCourse;
  onRemove: () => void;
  onSaveForLater: () => void;
  removing: boolean;
  saving: boolean;
}) {
  const { course } = item;
  const rating = course.totalRating > 0 ? (course.totalStar / course.totalRating).toFixed(1) : "—";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: removing || saving ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="flex gap-4 p-4 rounded-[20px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
    >
      <Link to={`/student/courses/${course.id}`} className="flex-shrink-0">
        {course.img ? (
          <img
            src={course.img}
            alt={course.title}
            className="w-[72px] h-[72px] rounded-2xl object-cover"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
            flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/student/courses/${course.id}`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{course.instructor.user.name}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-700 dark:text-gray-300">{rating}</span>
            <span>({course.totalRating})</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-white/[0.04]
            border border-gray-100 dark:border-white/[0.06]">
            {course.level}
          </span>
        </div>
        <button
          onClick={onSaveForLater}
          disabled={saving}
          className="mt-1.5 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400
            flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
          Save for later
        </button>
      </div>

      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={onRemove}
          disabled={removing}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600
            hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200
            disabled:opacity-50"
        >
          {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
        <p className="text-base font-black text-gray-900 dark:text-white">
          ${course.price.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Order summary ─────────────────────────────────────────────────────────────
function OrderSummary({
  items,
  onCheckout,
  clearing,
  onClear,
}: {
  items: CartCourse[];
  onCheckout: () => void;
  clearing: boolean;
  onClear: () => void;
}) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.course.price, 0);
  const discountRate = appliedCode ? (PROMO_CODES[appliedCode] ?? 0) : 0;
  const promoDiscount = subtotal * discountRate;
  const total = subtotal - promoDiscount;

  const handleApply = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code] !== undefined) {
      setAppliedCode(code);
      setPromoCode("");
      setPromoError(false);
    } else {
      setPromoError(true);
      setTimeout(() => setPromoError(false), 2200);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Promo */}
      <div className="rounded-[20px] p-5 bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3
          flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Promo Code
        </p>
        {appliedCode ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
            bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="flex-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {appliedCode} applied — {Math.round(discountRate * 100)}% off!
            </span>
            <button onClick={() => setAppliedCode(null)}>
              <X className="w-4 h-4 text-emerald-500 hover:text-emerald-700" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Try LEARN10 or SAVE20"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white
                  placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/25
                  focus:border-blue-400 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500
                  text-white shadow-[0_3px_12px_rgba(59,130,246,0.3)] transition-colors"
              >
                Apply
              </motion.button>
            </div>
            <AnimatePresence>
              {promoError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-500 mt-2 flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" /> Invalid code. Try LEARN10 or SAVE20.
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-[20px] p-5 bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 mb-5" />
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
          Order Summary
        </p>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal ({items.length} course{items.length !== 1 ? "s" : ""})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <AnimatePresence>
            {appliedCode && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex justify-between text-sm text-blue-600 dark:text-blue-400"
              >
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />Promo ({appliedCode})
                </span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-4" />
        <div className="flex justify-between items-end mb-5">
          <span className="text-base font-black text-gray-900 dark:text-white">Total</span>
          <div className="text-right">
            <span className="text-2xl font-black text-gray-900 dark:text-white">${total.toFixed(2)}</span>
            {appliedCode && (
              <p className="text-xs text-gray-400 line-through">${subtotal.toFixed(2)}</p>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onCheckout}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
            bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
            shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors duration-200"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center justify-center gap-5 mt-4">
          {[{ icon: Shield, text: "Secure" }, { icon: Lock, text: "Encrypted" }, { icon: Zap, text: "Instant" }].map(
            ({ icon: Ic, text }) => (
              <div key={text} className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                <Ic className="w-3 h-3" /> {text}
              </div>
            )
          )}
        </div>
      </div>

      {items.length > 0 && (
        <button
          onClick={onClear}
          disabled={clearing}
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500
            transition-colors disabled:opacity-50"
        >
          {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Clear cart
        </button>
      )}

      <div className="rounded-[18px] px-4 py-3.5 bg-blue-50/60 dark:bg-blue-950/20
        border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-bold text-gray-800 dark:text-white">30-day money-back guarantee.</span>{" "}
          Not happy? Full refund, no questions asked.
        </p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="w-24 h-24 rounded-[28px] bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center
        shadow-[0_8px_32px_rgba(59,130,246,0.15)] mb-6">
        <ShoppingCart className="w-11 h-11 text-blue-400" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Explore thousands of courses and start learning something extraordinary today.
      </p>
      <Link to="/student/courses">
        <motion.div
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full
            bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm
            shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-colors"
        >
          Browse courses <ChevronRight className="w-4 h-4" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentDashboardCart() {
  const navigate = useNavigate();
  
  // Use new optimistic hooks
  const { 
    data: cart, 
    isLoading, 
    error,
    removeFromCart,
    moveToWishlist,
    clearCart,
    isRemoving,
    isMoving,
    isClearing
  } = useCart();

  const handleRemove = async (courseId: string) => {
    try {
      await removeFromCart(courseId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const handleMoveToWishlist = async (courseId: string) => {
    try {
      await moveToWishlist(courseId);
    } catch (error) {
      console.error('Failed to move to wishlist:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const items = cart?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-gray-500">Failed to load your cart. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-6 pb-24">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <ShoppingCart className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Your <span className="text-blue-600 dark:text-blue-400">Cart</span>
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    removing={isRemoving}
                    saving={isMoving}
                    onRemove={() => handleRemove(item.course.id)}
                    onSaveForLater={() => handleMoveToWishlist(item.course.id)}
                  />
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
                <Link
                  to="/courses"
                  className="flex items-center gap-1.5 text-xs font-semibold
                    text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Continue shopping <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
              </div>
            </div>

            <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-8">
              <OrderSummary
                items={items}
                onCheckout={() => navigate("/student/cart/checkout")}
                clearing={isClearing}
                onClear={() => handleClearCart()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
