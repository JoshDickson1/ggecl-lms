import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CreditCard, Building2,
  Smartphone, Shield, Lock, CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import { useCart } from "@/hooks/useCart.tsx";

// ─── Step bar (reuse from Checkout, or copy) ─────────────────────────────────
const STEPS = ["Cart", "Checkout", "Payment", "Done"];
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-12">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              i < current
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                : i === current
                  ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40"
                  : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"
            }`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${
              i <= current ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-[2px] mx-1 mb-5 rounded-full transition-all duration-500 ${
              i < current ? "bg-blue-600" : "bg-gray-100 dark:bg-white/[0.06]"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Payment methods ──────────────────────────────────────────────────────────
type Method = "card" | "bank" | "mobile";
const METHODS: { id: Method; label: string; sub: string; icon: React.ElementType }[] = [
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", sub: "Direct bank payment", icon: Building2 },
  { id: "mobile", label: "Mobile Money", sub: "M-Pesa, Airtel Money, etc.", icon: Smartphone },
];

// ─── Card input form ──────────────────────────────────────────────────────────
function CardForm({
  card, setCard,
}: {
  card: { number: string; name: string; expiry: string; cvv: string };
  setCard: (v: typeof card) => void;
}) {
  const [showCvv, setShowCvv] = useState(false);

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(.{2})(.+)/, "$1 / $2");

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm
    bg-gray-50 dark:bg-white/[0.04]
    border border-gray-200 dark:border-white/[0.08]
    text-gray-800 dark:text-white placeholder:text-gray-400
    outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 mt-5">
      {/* Card preview strip */}
      <div className="relative h-14 rounded-2xl overflow-hidden
        bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
        flex items-center justify-between px-5
        shadow-[0_8px_24px_rgba(59,130,246,0.35)]">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <span className="text-white/90 font-mono text-sm tracking-[0.2em] relative z-10">
          {card.number || "•••• •••• •••• ••••"}
        </span>
        <CreditCard className="w-6 h-6 text-white/60 relative z-10" />
      </div>

      <div className="flex flex-col gap-3">
        <input value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
          placeholder="Card number" className={inputClass} />
        <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
          placeholder="Name on card" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            placeholder="MM / YY" className={inputClass} />
          <div className="relative">
            <input value={card.cvv}
              type={showCvv ? "text" : "password"}
              maxLength={4}
              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              placeholder="CVV" className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowCvv(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Bank transfer info ───────────────────────────────────────────────────────
function BankInfo() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-2xl p-5
        bg-blue-50/60 dark:bg-blue-950/20
        border border-blue-100 dark:border-blue-900/30">
      <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">Transfer to:</p>
      {[
        { label: "Bank", value: "First National Learning Bank" },
        { label: "Account Name", value: "GGECL Ltd" },
        { label: "Account No.", value: "0123456789" },
        { label: "Sort Code", value: "12-34-56" },
        { label: "Reference", value: "Use your email" },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between py-1.5 border-b border-blue-100 dark:border-blue-900/20 last:border-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          <span className="text-xs font-bold text-gray-800 dark:text-white">{value}</span>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-3">
        Once your transfer is confirmed (1–2 business days) you'll receive an email with access instructions.
      </p>
    </motion.div>
  );
}

// ─── Mobile money form ────────────────────────────────────────────────────────
function MobileForm({ phone, setPhone }: { phone: string; setPhone: (v: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">
        Mobile Number
      </label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)}
        placeholder="+254 700 000 000"
        className="w-full px-4 py-3 rounded-xl text-sm
          bg-gray-50 dark:bg-white/[0.04]
          border border-gray-200 dark:border-white/[0.08]
          text-gray-800 dark:text-white placeholder:text-gray-400
          outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      <p className="text-xs text-gray-400 mt-2">
        You'll receive a payment prompt on this number. Confirm it to complete your purchase.
      </p>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Provider() {
  const navigate = useNavigate();
  const { total, courses: cartCourses } = useCart();
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [mobilePhone, setMobilePhone] = useState("");

  const canPay =
    method === "bank" ||
    (method === "card" && card.number.replace(/\s/g, "").length === 16 && card.name && card.expiry && card.cvv.length >= 3) ||
    (method === "mobile" && mobilePhone.replace(/\D/g, "").length >= 10);

  const handlePay = () => {
    sessionStorage.setItem("paymentMethod", method);
    navigate("/processing");
  };

  if (cartCourses.length === 0) { navigate("/cart"); return null; }

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

      <div className="relative z-10 max-w-[680px] mx-auto px-6 pt-36 pb-24">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/checkout" className="inline-flex items-center gap-2 text-sm text-gray-400
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to checkout
          </Link>
          <StepBar current={2} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Payment <span className="text-blue-600 dark:text-blue-400">Method</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Choose how you'd like to pay for your {cartCourses.length} course{cartCourses.length !== 1 ? "s" : ""}.
          </p>

          {/* Method selector */}
          <div className="flex flex-col gap-3 mb-2">
            {METHODS.map(({ id, label, sub, icon: Icon }) => (
              <motion.button key={id} whileTap={{ scale: 0.99 }}
                onClick={() => setMethod(id)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 border ${
                  method === id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                    : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] hover:border-blue-300 dark:hover:border-blue-800/50"
                }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  method === id
                    ? "bg-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                    : "bg-gray-100 dark:bg-white/[0.07]"
                }`}>
                  <Icon className={`w-5 h-5 ${method === id ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${method === id ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-white"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  method === id ? "border-blue-600 bg-blue-600" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {method === id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Method-specific form */}
          <AnimatePresence mode="wait">
            {method === "card" && <CardForm key="card" card={card} setCard={setCard} />}
            {method === "bank" && <BankInfo key="bank" />}
            {method === "mobile" && <MobileForm key="mobile" phone={mobilePhone} setPhone={setMobilePhone} />}
          </AnimatePresence>

          {/* Pay button */}
          <div className="mt-8">
            <motion.button
              whileHover={canPay ? { scale: 1.02, boxShadow: "0 12px 36px rgba(59,130,246,0.5)" } : {}}
              whileTap={canPay ? { scale: 0.97 } : {}}
              onClick={canPay ? handlePay : undefined}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                font-black text-sm transition-all duration-200 ${
                canPay
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)] cursor-pointer"
                  : "bg-gray-200 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
              }`}>
              {method === "bank" ? "I've Made the Transfer" : `Pay $${total.toFixed(2)}`}
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-5 mt-4">
              {[{ icon: Shield, text: "SSL Secured" }, { icon: Lock, text: "256-bit Encrypted" }].map(({ icon: Ic, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Ic className="w-3.5 h-3.5" /> {text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}