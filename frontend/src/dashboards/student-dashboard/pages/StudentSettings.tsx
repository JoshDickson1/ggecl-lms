// src/dashboards/student-dashboard/pages/StudentSettings.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, User, Mail, Phone, MapPin,
  Lock, Eye, EyeOff, CheckCircle2, AlertTriangle,
  Save, Loader2, Trash2, Shield, ChevronRight, X,
} from "lucide-react";

// ─── Dummy data ───────────────────────────────────────────────────────────────
const STUDENT = {
  name:     "Emeka Okonkwo",
  avatar:   "EO",
  avatarBg: "bg-blue-500",
  email:    "emeka@ggecl.io",
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: {
  message: string; type: "success" | "error"; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.15)] border",
        type === "success"
          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300"
          : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300"
      )}>
      {type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, description, icon: Icon, children, delay = 0 }: {
  title: string; description?: string; icon: React.ElementType;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-900
          flex items-center justify-center shadow-[0_3px_10px_rgba(6,182,212,0.35)] flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, placeholder, icon: Icon, type = "text", value, onChange, hint, error, required, disabled }: {
  label: string; placeholder: string; icon: React.ElementType;
  type?: string; value: string; onChange?: (v: string) => void;
  hint?: string; error?: string; required?: boolean; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-blue-900">*</span>}
      </label>
      <div className={cn(
        "relative rounded-xl border transition-all duration-200",
        disabled ? "opacity-60" : "",
        error ? "border-red-300 dark:border-red-700"
          : focused ? "border-blue-400 ring-2 ring-blue-500/15"
          : "border-gray-200 dark:border-white/[0.08]"
      )}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
            bg-gray-50/80 dark:bg-white/[0.04]
            text-gray-800 dark:text-white placeholder:text-gray-400
            outline-none transition-all disabled:cursor-not-allowed" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function Textarea({ label, placeholder, value, onChange, hint, rows = 3 }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  hint?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{label}</label>
      <textarea value={value} rows={rows}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm resize-none",
          "bg-gray-50/80 dark:bg-white/[0.04]",
          "border transition-all duration-200",
          "text-gray-800 dark:text-white placeholder:text-gray-400 outline-none",
          focused ? "border-blue-400 ring-2 ring-blue-500/15" : "border-gray-200 dark:border-white/[0.08]"
        )} />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters",     pass: password.length >= 8             },
    { label: "Uppercase letter",  pass: /[A-Z]/.test(password)           },
    { label: "Number",            pass: /[0-9]/.test(password)           },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password)   },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["bg-red-400","bg-orange-400","bg-yellow-400","bg-emerald-400"];
  const labels = ["Weak","Fair","Good","Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300",
            i < score ? colors[score - 1] : "bg-gray-100 dark:bg-white/[0.07]")} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500">{score > 0 ? labels[score - 1] : ""}</span>
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label} className={cn("text-[10px] flex items-center gap-1",
              c.pass ? "text-emerald-500" : "text-gray-400")}>
              <CheckCircle2 className="w-2.5 h-2.5" />{c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveBtn({ loading, onClick, label = "Save Changes" }: {
  loading: boolean; onClick: () => void; label?: string;
}) {
  return (
    <motion.button
      whileHover={!loading ? { scale: 1.02 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      onClick={onClick} disabled={loading}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
        loading
          ? "bg-blue-900 cursor-wait text-white"
          : "bg-gradient-to-br from-blue-500 to-blue-900 hover:bg-blue-900 text-white shadow-blue-900"
      )}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? "Saving…" : label}
    </motion.button>
  );
}

// ─── Nav sections (student-specific) ─────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "avatar",        label: "Photo & Avatar",       icon: Camera   },
  { id: "personal",      label: "Personal Info",         icon: User     },
//   { id: "learning",      label: "Learning Preferences",  icon: BookOpen },
  { id: "password",      label: "Password & Security",   icon: Lock     },
  { id: "danger",        label: "Danger Zone",           icon: Trash2   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentSettings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [personal, setPersonal] = useState({
    firstName: STUDENT.name.split(" ")[0],
    lastName:  STUDENT.name.split(" ")[1] ?? "",
    email:     STUDENT.email,
    phone:     "+234 800 000 0000",
    location:  "Lagos, Nigeria",
    bio:       "Passionate about web development and machine learning. Currently transitioning from accounting into tech.",
  });

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState("avatar");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const simulateSave = (key: string) => {
    setSaving(p => ({ ...p, [key]: true }));
    setTimeout(() => {
      setSaving(p => ({ ...p, [key]: false }));
      showToast("Changes saved successfully!");
    }, 1400);
  };

  const handlePasswordSave = () => {
    const errs: Record<string, string> = {};
    if (!pwd.current) errs.current = "Required";
    if (pwd.next.length < 8) errs.next = "Must be at least 8 characters";
    if (pwd.next !== pwd.confirm) errs.confirm = "Passwords don't match";
    setPwdErrors(errs);
    if (Object.keys(errs).length) return showToast("Please fix the errors above", "error");
    simulateSave("password");
    setPwd({ current: "", next: "", confirm: "" });
  };

  const setP = (k: keyof typeof personal) => (v: string) => setPersonal(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Account <span className="text-blue-600 dark:text-blue-400">Settings</span>
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Manage your profile, and security.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar nav */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38 }}
          className="w-full lg:w-52 flex-shrink-0 lg:sticky lg:top-24">
          <div className="rounded-[20px] bg-white dark:bg-[#0f1623]
            border border-gray-100 dark:border-white/[0.07]
            shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-2">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id}
                onClick={() => {
                  setActiveSection(id);
                  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-200 text-left",
                  activeSection === id
                    ? "bg-gradient-to-br from-blue-500 to-blue-900 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]"
                    : id === "danger"
                      ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400"
                )}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
                {activeSection !== id && <ChevronRight className="w-3 h-3 ml-auto opacity-30" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Photo */}
          <div id="section-avatar">
            <Section title="Photo & Avatar" description="Your public profile photo" icon={Camera} delay={0.05}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-[20px] overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-[0_4px_16px_rgba(6,182,212,0.2)]">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${STUDENT.avatarBg}`}>{STUDENT.avatar}</div>
                    }
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                      bg-blue-600 hover:bg-blue-500 flex items-center justify-center
                      shadow-[0_3px_10px_rgba(6,182,212,0.45)] transition-all">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="flex-1">
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-white/[0.08]
                      hover:border-blue-300 dark:hover:border-blue-700
                      rounded-2xl py-6 px-4 text-center transition-all group">
                    <Camera className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Click to upload a new photo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF · Max 5MB</p>
                  </button>
                  {avatarPreview && (
                    <div className="flex gap-2 mt-3">
                      <SaveBtn loading={!!saving.avatar} onClick={() => simulateSave("avatar")} label="Save Photo" />
                      <button onClick={() => setAvatarPreview(null)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08]
                          text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500 transition-all">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Section>
          </div>

          {/* Personal */}
          <div id="section-personal">
            <Section title="Personal Information" description="Your basic account details" icon={User} delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="First Name" placeholder="Emeka" icon={User} value={personal.firstName} onChange={setP("firstName")} required />
                <Field label="Last Name" placeholder="Okonkwo" icon={User} value={personal.lastName} onChange={setP("lastName")} required />
                <Field label="Email Address" placeholder="you@ggecl.io" icon={Mail} type="email" value={personal.email} onChange={setP("email")} required hint="Changes require email verification" />
                <Field label="Phone Number" placeholder="+234 800 000 0000" icon={Phone} type="tel" value={personal.phone} onChange={setP("phone")} />
                <Field label="Location" placeholder="City, Country" icon={MapPin} value={personal.location} onChange={setP("location")} />
                <div className="sm:col-span-2">
                  <Textarea label="Bio" placeholder="Tell others about yourself…"
                    value={personal.bio} onChange={setP("bio")}
                    hint="Shown on your profile. Max 300 characters." rows={3} />
                </div>
              </div>
              <SaveBtn loading={!!saving.personal} onClick={() => simulateSave("personal")} />
            </Section>
          </div>

          {/* Password */}
          <div id="section-password">
            <Section title="Password & Security" description="Keep your account safe" icon={Lock} delay={0.3}>
              <div className="flex flex-col gap-4 mb-5">
                {(["current","next","confirm"] as const).map((field) => {
                  const labels = { current: "Current Password", next: "New Password", confirm: "Confirm New Password" };
                  const placeholders = { current: "Enter current password", next: "Enter new password", confirm: "Confirm new password" };
                  return (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">{labels[field]} *</label>
                      <div className={cn(
                        "relative rounded-xl border transition-all duration-200",
                        pwdErrors[field] ? "border-red-300 dark:border-red-700"
                          : field === "confirm" && pwd.confirm && pwd.confirm === pwd.next ? "border-emerald-400 ring-2 ring-emerald-500/15"
                          : pwd[field] ? "border-blue-400 ring-2 ring-blue-500/15"
                          : "border-gray-200 dark:border-white/[0.08]"
                      )}>
                        {field === "confirm" ? <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> : <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                        <input type={showPwd[field] ? "text" : "password"} value={pwd[field]}
                          onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={placeholders[field]}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none" />
                        <button onClick={() => setShowPwd(p => ({ ...p, [field]: !p[field] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwdErrors[field] && <p className="text-xs text-red-500">{pwdErrors[field]}</p>}
                      {field === "next" && <PasswordStrength password={pwd.next} />}
                      {field === "confirm" && pwd.confirm && pwd.confirm === pwd.next && (
                        <p className="text-xs text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <SaveBtn loading={!!saving.password} onClick={handlePasswordSave} label="Update Password" />
            </Section>
          </div>

          {/* Danger Zone */}
          <div id="section-danger">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.35 }}
              className="rounded-[22px] bg-white dark:bg-[#0f1623]
                border border-red-200 dark:border-red-900/40
                shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-red-100 dark:border-red-900/30">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-red-700 dark:text-red-400">Danger Zone</h2>
                  <p className="text-xs text-red-400/80 dark:text-red-500/70 mt-0.5">These actions cannot be undone.</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl
                  bg-red-50/60 dark:bg-red-950/15 border border-red-100 dark:border-red-900/20">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Pause Learning</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Temporarily pause your account. Your progress and certificates are kept.
                    </p>
                  </div>
                  <button className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold
                    border border-red-200 dark:border-red-800/50
                    text-red-600 dark:text-red-400
                    hover:bg-red-100 dark:hover:bg-red-950/40 transition-all">
                    Pause
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl
                  bg-red-50/60 dark:bg-red-950/15 border border-red-100 dark:border-red-900/20">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Delete Account</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Permanently delete your account. You will lose access to all enrolled courses and certificates.
                    </p>
                  </div>
                  <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                    bg-red-600 hover:bg-red-700 text-white
                    shadow-[0_3px_10px_rgba(239,68,68,0.35)] transition-all">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}