import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, BookOpen,
  GraduationCap, Target, MessageSquare,
  CheckCircle2, ArrowRight, Loader2,
} from "lucide-react";

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  label, placeholder, icon: Icon, type = "text",
  value, onChange, error, required, hint,
}: {
  label: string; placeholder: string; icon: React.ElementType;
  type?: string; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean; hint?: string;
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <input type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
            bg-gray-50/80 dark:bg-white/[0.04]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none transition-all" />
      </div>
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Textarea field ───────────────────────────────────────────────────────────
function TextareaField({
  label, placeholder, icon: Icon, value, onChange, hint,
}: {
  label: string; placeholder: string; icon: React.ElementType;
  value: string; onChange: (v: string) => void; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{label}</label>
      <div className={`relative rounded-xl border transition-all duration-200 ${
        focused ? "border-blue-400 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-white/[0.08]"
      }`}>
        <div className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <textarea value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder} rows={3}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm resize-none
            bg-gray-50/80 dark:bg-white/[0.04]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none transition-all" />
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({
  label, icon: Icon, value, onChange, options, required, error,
}: {
  label: string; icon: React.ElementType;
  value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <div className="relative rounded-xl border border-gray-200 dark:border-white/[0.08]
        focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm appearance-none
            bg-gray-50/80 dark:bg-white/[0.04]
            text-gray-800 dark:text-white
            outline-none cursor-pointer">
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[22px] p-7 bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
          flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Form = {
  fullName: string; email: string; phone: string; location: string;
  educationLevel: string; occupation: string;
  learningGoal: string; experience: string; notes: string;
  hearAboutUs: string;
};

export default function StudentInfoForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const billing = (() => {
    try { return JSON.parse(sessionStorage.getItem("billing") ?? "{}"); } catch { return {}; }
  })();

  const [form, setForm] = useState<Form>({
    fullName: billing.firstName ? `${billing.firstName} ${billing.lastName}` : "",
    email: billing.email ?? "",
    phone: billing.phone ?? "",
    location: billing.country ?? "",
    educationLevel: "", occupation: "",
    learningGoal: "", experience: "", notes: "",
    hearAboutUs: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const set = (k: keyof Form) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.educationLevel) e.educationLevel = "Required";
    if (!form.learningGoal.trim()) e.learningGoal = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call to admin
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => navigate("/"), 3500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-[28px] p-12 text-center bg-white dark:bg-[#0f1623]
            border border-gray-100 dark:border-white/[0.07] shadow-[0_16px_64px_rgba(0,0,0,0.1)]
            max-w-md w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
              flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All set!</h2>
          <p className="text-gray-400 text-sm">
            Your information has been sent to the admin. You'll hear from us within 24 hours. Redirecting you home…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18]">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

      <div className="relative z-10 max-w-[720px] mx-auto px-6 pt-36 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <GraduationCap className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              One last step
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Student <span className="text-blue-600 dark:text-blue-400">Information</span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm max-w-md">
            Help us personalise your learning experience. This information is shared with your instructors and our admin team.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Personal */}
          <Section title="Personal Details" icon={User} delay={0.05}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" placeholder="Jane Doe" icon={User}
                  value={form.fullName} onChange={set("fullName")} error={errors.fullName} required />
              </div>
              <Field label="Email Address" placeholder="jane@example.com" icon={Mail} type="email"
                value={form.email} onChange={set("email")} error={errors.email} required />
              <Field label="Phone Number" placeholder="+1 555 000 0000" icon={Phone}
                value={form.phone} onChange={set("phone")} error={errors.phone} required />
              <div className="sm:col-span-2">
                <Field label="Country / Location" placeholder="e.g. Lagos, Nigeria" icon={MapPin}
                  value={form.location} onChange={set("location")} />
              </div>
            </div>
          </Section>

          {/* Background */}
          <Section title="Academic & Professional Background" icon={GraduationCap} delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Highest Education Level" icon={GraduationCap}
                value={form.educationLevel} onChange={set("educationLevel")}
                options={["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Self-taught / Other"]}
                required error={errors.educationLevel} />
              <Field label="Current Occupation" placeholder="e.g. Software Engineer, Student" icon={BookOpen}
                value={form.occupation} onChange={set("occupation")} />
            </div>
          </Section>

          {/* Learning goals */}
          <Section title="Learning Goals" icon={Target} delay={0.15}>
            <div className="flex flex-col gap-4">
              <TextareaField label="What do you hope to achieve from these courses? *"
                placeholder="e.g. I want to transition into frontend development within 6 months…"
                icon={Target} value={form.learningGoal} onChange={set("learningGoal")} />
              {errors.learningGoal && <p className="text-xs text-red-500 -mt-2">{errors.learningGoal}</p>}

              <SelectField label="Prior experience in this subject" icon={BookOpen}
                value={form.experience} onChange={set("experience")}
                options={["None — complete beginner", "Some basics", "Intermediate", "Advanced"]} />

              <SelectField label="How did you hear about us?" icon={MessageSquare}
                value={form.hearAboutUs} onChange={set("hearAboutUs")}
                options={["Google / Search", "Social Media", "Friend / Referral", "Newsletter", "Other"]} />

              <TextareaField label="Any additional notes for the admin / instructors"
                placeholder="Anything else we should know? Accessibility needs, preferred learning pace, timezone…"
                icon={MessageSquare} value={form.notes} onChange={set("notes")}
                hint="Optional but appreciated." />
            </div>
          </Section>

          {/* Submit */}
          <motion.button
            whileHover={!submitting ? { scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" } : {}}
            whileTap={!submitting ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
              font-black text-sm transition-all duration-200 ${
              submitting
                ? "bg-blue-400 cursor-wait text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
            }`}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              <>Submit Information <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>

          <p className="text-center text-xs text-gray-400">
            Your data is handled securely and never sold to third parties.
          </p>
        </div>
      </div>
    </div>
  );
}