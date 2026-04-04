import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Trash2, Tag, ArrowRight, Star,
  Clock, BookOpen, Shield, Zap, ChevronRight,
  X, CheckCircle2, Gift, TrendingUp, Lock,
} from "lucide-react";
import { useCart } from "@/hooks/useCart.tsx";
import { courses, type Course } from "@/data/courses";


function getUpsell(cartIds: string[]): Course[] {
  return courses.filter((c) => !cartIds.includes(c.id)).slice(0, 3);
}

// ─── Cart item row ────────────────────────────────────────────────────────────
function CartItem({ course, onRemove }: { course: Course; onRemove: () => void }) {
  const Icon = course.icon;
  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <motion.div layout
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="flex gap-4 p-4 rounded-[20px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <Link to={`/courses/${course.id}`} className="flex-shrink-0">
        <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${course.thumbnail} flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white drop-shadow" />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/courses/${course.id}`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{course.title}</h3>
        </Link>
        <Link to={`/instructors/${course.instructor.id}`}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors mt-0.5 inline-block">
          {course.instructor.name}
        </Link>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-700 dark:text-gray-300">{course.rating}</span>
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lectures}</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button onClick={onRemove}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600
            hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="text-right">
          <p className="text-base font-black text-gray-900 dark:text-white">${course.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 line-through">${course.originalPrice.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-emerald-500">-{discount}%</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Upsell card ──────────────────────────────────────────────────────────────
function UpsellCard({ course, onAdd, added }: { course: Course; onAdd: () => void; added: boolean }) {
  const Icon = course.icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/[0.07]
      hover:border-blue-200 dark:hover:border-blue-800/40 bg-gray-50/60 dark:bg-white/[0.02]
      transition-all duration-200 group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.thumbnail} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1
          group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</p>
        <p className="text-xs font-black text-gray-900 dark:text-white mt-0.5">
          ${course.price.toFixed(2)}
          <span className="text-[10px] font-normal text-gray-400 line-through ml-1">${course.originalPrice.toFixed(2)}</span>
        </p>
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onAdd} disabled={added}
        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          added
            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
        }`}>
        {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : "+ Add"}
      </motion.button>
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function Summary({ onCheckout }: { onCheckout: () => void }) {
  const { courses: cartCourses, total, originalTotal, promoCode, promoApplied, setPromoCode, applyPromo, removePromo } = useCart();
  const [promoError, setPromoError] = useState(false);
  const subtotal = cartCourses.reduce((s, c) => s + c.price, 0);
  const savings = originalTotal - subtotal;
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;

  const handleApply = () => {
    const ok = applyPromo();
    if (!ok) { setPromoError(true); setTimeout(() => setPromoError(false), 2200); }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Promo */}
      <div className="rounded-[20px] p-5 bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3 flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Promo Code
        </p>
        {promoApplied ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
            bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="flex-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {promoCode} applied!
            </span>
            <button onClick={removePromo}><X className="w-4 h-4 text-emerald-500 hover:text-emerald-700" /></button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input type="text" value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Try LEARN10 or SAVE20"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04]
                  border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white
                  placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/25
                  focus:border-blue-400 transition-all" />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500
                  text-white shadow-[0_3px_12px_rgba(59,130,246,0.3)] transition-colors">
                Apply
              </motion.button>
            </div>
            <AnimatePresence>
              {promoError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
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
            <span>Subtotal ({cartCourses.length} courses)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" />You saved</span>
            <span>-${savings.toFixed(2)}</span>
          </div>
          <AnimatePresence>
            {promoApplied && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Promo ({promoCode})</span>
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
            {promoApplied && <p className="text-xs text-gray-400 line-through">${subtotal.toFixed(2)}</p>}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" }}
          whileTap={{ scale: 0.97 }} onClick={onCheckout}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
            bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
            shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors duration-200">
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center justify-center gap-5 mt-4">
          {[{ icon: Shield, text: "Secure" }, { icon: Lock, text: "Encrypted" }, { icon: Zap, text: "Instant" }].map(({ icon: Ic, text }) => (
            <div key={text} className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Ic className="w-3 h-3" /> {text}
            </div>
          ))}
        </div>
      </div>

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-24 h-24 rounded-[28px] bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center
        shadow-[0_8px_32px_rgba(59,130,246,0.15)] mb-6">
        <ShoppingCart className="w-11 h-11 text-blue-400" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Explore thousands of courses and start learning something extraordinary today.
      </p>
      <Link to="/courses">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full
            bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm
            shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-colors">
          Browse courses <ChevronRight className="w-4 h-4" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Cart() {
  const { courses: cartCourses, removeFromCart, addToCart, items } = useCart();
  const navigate = useNavigate();
  const [addedUpsells, setAddedUpsells] = useState<string[]>([]);
  const upsell = getUpsell(items.map((i) => i.courseId));

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-36 pb-24">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <ShoppingCart className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              {cartCourses.length} {cartCourses.length === 1 ? "item" : "items"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Your <span className="text-blue-600 dark:text-blue-400">Cart</span>
          </h1>
        </motion.div>

        {cartCourses.length === 0 ? <EmptyCart /> : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {cartCourses.map((course) => (
                  <CartItem key={course.id} course={course} onRemove={() => removeFromCart(course.id)} />
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
                <Link to="/courses" className="flex items-center gap-1.5 text-xs font-semibold
                  text-blue-600 dark:text-blue-400 hover:underline">
                  Continue shopping <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
              </div>

              {upsell.length > 0 && (
                <div className="rounded-[22px] p-5 bg-white dark:bg-[#0f1623]
                  border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">Students also bought</p>
                      <p className="text-xs text-gray-400">Frequently purchased together</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {upsell.map((course) => (
                      <UpsellCard key={course.id} course={course}
                        onAdd={() => { addToCart(course.id); setAddedUpsells(p => [...p, course.id]); }}
                        added={addedUpsells.includes(course.id)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-8">
              <Summary onCheckout={() => navigate("/checkout")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}