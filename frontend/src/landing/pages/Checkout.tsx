import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Shield, Lock, User,
  Mail, Phone, MapPin, Building2,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart.tsx";

// ─── Step indicator ───────────────────────────────────────────────────────────
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
                  ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] ring-4 ring-blue-100 dark:ring-blue-900/40"
                  : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-600"
            }`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${
              i <= current ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"
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

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
  label, placeholder, icon: Icon, type = "text", value, onChange, error, required,
}: {
  label: string; placeholder: string; icon: React.ElementType;
  type?: string; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <div className={`relative rounded-xl border transition-all duration-200 ${
        error
          ? "border-red-300 dark:border-red-700"
          : focused
            ? "border-blue-400 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-white/[0.08]"
      }`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
            bg-gray-50/80 dark:bg-white/[0.04]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none transition-all"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Order mini-summary ───────────────────────────────────────────────────────
function OrderMini() {
  const { courses: cartCourses, total, promoApplied, promoCode } = useCart();
  const subtotal = cartCourses.reduce((s, c) => s + c.price, 0);
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;

  return (
    <div className="rounded-[22px] overflow-hidden bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
      <div className="p-6">
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
          Your Order
        </p>
        <div className="flex flex-col gap-3 mb-4">
          {cartCourses.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.thumbnail} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">{c.title}</p>
                  <p className="text-[10px] text-gray-400">{c.instructor.name}</p>
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white flex-shrink-0">
                  ${c.price.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-3" />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span>Promo ({promoCode})</span><span>-${promoDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-gray-900 dark:text-white text-base pt-1">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type FormData = {
  firstName: string; lastName: string; email: string;
  phone: string; address: string; city: string;
  state: string; country: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function Checkout() {
  const navigate = useNavigate();
  const { courses: cartCourses } = useCart();

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "",
    phone: "", address: "", city: "",
    state: "", country: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const setField = (key: keyof FormData) => (v: string) => {
    setForm((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.country.trim()) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    // Store billing info in session for later pages
    sessionStorage.setItem("billing", JSON.stringify(form));
    navigate("/payment");
  };

  if (cartCourses.length === 0) {
    navigate("/cart"); return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-36 pb-24">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-400
            hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </Link>
          <StepBar current={1} />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Personal info */}
            <div className="rounded-[22px] p-7 bg-white dark:bg-[#0f1623]
              border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" placeholder="Jane" icon={User}
                  value={form.firstName} onChange={setField("firstName")} error={errors.firstName} required />
                <Field label="Last Name" placeholder="Doe" icon={User}
                  value={form.lastName} onChange={setField("lastName")} error={errors.lastName} required />
                <Field label="Email" placeholder="jane@example.com" icon={Mail} type="email"
                  value={form.email} onChange={setField("email")} error={errors.email} required />
                <Field label="Phone" placeholder="+1 555 000 0000" icon={Phone} type="tel"
                  value={form.phone} onChange={setField("phone")} error={errors.phone} required />
              </div>
            </div>

            {/* Billing address */}
            <div className="rounded-[22px] p-7 bg-white dark:bg-[#0f1623]
              border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Billing Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Street Address" placeholder="123 Learning Lane" icon={MapPin}
                    value={form.address} onChange={setField("address")} error={errors.address} />
                </div>
                <Field label="City" placeholder="New York" icon={Building2}
                  value={form.city} onChange={setField("city")} error={errors.city} />
                <Field label="State / Region" placeholder="NY" icon={Building2}
                  value={form.state} onChange={setField("state")} error={errors.state} />
                <div className="sm:col-span-2">
                  <Field label="Country" placeholder="United States" icon={MapPin}
                    value={form.country} onChange={setField("country")} error={errors.country} required />
                </div>
              </div>
            </div>

            {/* Continue btn */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
                shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors duration-200">
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-5">
              {[{ icon: Shield, text: "SSL Secured" }, { icon: Lock, text: "Encrypted" }].map(({ icon: Ic, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Ic className="w-3.5 h-3.5" /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-8">
            <OrderMini />
          </motion.div>
        </div>
      </div>
    </div>
  );
}