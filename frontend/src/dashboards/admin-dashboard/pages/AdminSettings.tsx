// src/pages/admin/AdminSettings.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Camera, User, Mail, Phone, MapPin, Globe,
  Lock, Eye, EyeOff, CheckCircle2, AlertTriangle,
  Save, Loader2, Trash2, Shield, ChevronRight, X,
} from "lucide-react";
import { useDashboardUser, getInitials } from "@/hooks/useDashboardUser";
import StorageService from "@/services/storage.service";
import UserService from "@/services/user.service";
import { authClient } from "@/lib/auth-client";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
      {type === "success"
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      }
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: "easeOut" }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
          flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)] flex-shrink-0 mt-0.5">
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

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, placeholder, icon: Icon, type = "text", value, onChange, hint, error, required, disabled }: {
  label: string; placeholder: string; icon: React.ElementType;
  type?: string; value: string; onChange?: (v: string) => void;
  hint?: string; error?: string; required?: boolean; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
        {label} {required && <span className="text-blue-500">*</span>}
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
        <input
          type={type} value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
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
      <textarea
        value={value} rows={rows}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm resize-none",
          "bg-gray-50/80 dark:bg-white/[0.04]",
          "border transition-all duration-200",
          "text-gray-800 dark:text-white placeholder:text-gray-400 outline-none",
          focused
            ? "border-blue-400 ring-2 ring-blue-500/15"
            : "border-gray-200 dark:border-white/[0.08]"
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
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i < score ? colors[score - 1] : "bg-gray-100 dark:bg-white/[0.07]"
          )} />
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
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
        loading
          ? "bg-blue-400 cursor-wait text-white"
          : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
      )}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? "Saving…" : label}
    </motion.button>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "avatar",    label: "Photo & Avatar",       icon: Camera   },
  { id: "personal",  label: "Personal Info",         icon: User     },
  { id: "socials",   label: "Social Links",          icon: Globe    },
  { id: "password",  label: "Password & Security",   icon: Lock     },
  { id: "danger",    label: "Danger Zone",           icon: Trash2   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const { user } = useDashboardUser();

  // ── Avatar
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSave = async () => {
    if (!avatarFile || !user?.id) return;
    setAvatarUploading(true);
    try {
      const publicUrl = await StorageService.upload("avatars", avatarFile);
      await UserService.update(user.id, { image: publicUrl });
      await authClient.updateUser({ image: publicUrl });
      setAvatarFile(null);
      setAvatarPreview(null);
      showToast("Photo updated successfully!");
    } catch {
      showToast("Failed to upload photo. Please try again.", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Fetch full profile for bio/phone
  const { data: profile } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => UserService.getMe() as Promise<{ bio?: string; phone?: string }>,
    enabled: !!user?.id,
  });

  // ── Personal info
  const [personal, setPersonal] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    location:  "",
    website:   "",
    bio:       "",
  });

  // Sync when session or profile data loads
  useEffect(() => {
    if (!user) return;
    setPersonal(p => ({
      ...p,
      firstName: user.firstName || p.firstName,
      lastName:  user.lastName  || p.lastName,
      email:     user.email     || p.email,
    }));
  }, [user?.id]);

  useEffect(() => {
    if (!profile) return;
    setPersonal(p => ({
      ...p,
      phone: profile.phone ?? p.phone,
      bio:   profile.bio   ?? p.bio,
    }));
  }, [profile]);

  // ── Socials
  const [socials, setSocials] = useState({
    github:   "#", twitter: "#", linkedin: "#", youtube: "#",
  });


  // ── Password
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  // ── Toast + loading states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

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

  const handlePersonalSave = async () => {
    if (!user?.id) return;
    setSaving(p => ({ ...p, personal: true }));
    try {
      const name = `${personal.firstName} ${personal.lastName}`.trim();
      await UserService.update(user.id, {
        name,
        bio:   personal.bio   || undefined,
        phoneNumber: personal.phone || undefined,
      });
      await authClient.updateUser({ name });
      showToast("Profile saved successfully!");
    } catch {
      showToast("Failed to save profile. Please try again.", "error");
    } finally {
      setSaving(p => ({ ...p, personal: false }));
    }
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

  const setP = (k: keyof typeof personal) => (v: string) =>
    setPersonal(p => ({ ...p, [k]: v }));
  const setS = (k: keyof typeof socials) => (v: string) =>
    setSocials(p => ({ ...p, [k]: v }));

  const [activeSection, setActiveSection] = useState("avatar");

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Account <span className="text-blue-600 dark:text-blue-400">Settings</span>
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Manage your profile, preferences, and security settings.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Sidebar nav ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
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
                    ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                    : id === "danger"
                      ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400"
                )}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
                {activeSection !== id && (
                  <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Photo & Avatar */}
          <div id="section-avatar">
            <Section title="Photo & Avatar" description="Your public profile photo" icon={Camera} delay={0.05}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Preview */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-[20px] overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/40
                    shadow-[0_4px_16px_rgba(59,130,246,0.2)]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-blue-600">
                        {getInitials(user)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                      bg-blue-600 hover:bg-blue-500 flex items-center justify-center
                      shadow-[0_3px_10px_rgba(59,130,246,0.45)] transition-all">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Upload area */}
                <div className="flex-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-white/[0.08]
                      hover:border-blue-300 dark:hover:border-blue-700
                      rounded-2xl py-6 px-4 text-center transition-all duration-200 group">
                    <Camera className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Click to upload a new photo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF · Max 5MB</p>
                  </button>
                  {avatarPreview && (
                    <div className="flex gap-2 mt-3">
                      <SaveBtn loading={avatarUploading} onClick={handleAvatarSave} label="Save Photo" />
                      <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
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

          {/* Personal Info */}
          <div id="section-personal">
            <Section title="Personal Information" description="Your basic account details" icon={User} delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="First Name" placeholder="Jane" icon={User} value={personal.firstName}
                  onChange={setP("firstName")} required />
                <Field label="Last Name" placeholder="Doe" icon={User} value={personal.lastName}
                  onChange={setP("lastName")} required />
                <Field label="Email Address" placeholder="jane@example.com" icon={Mail} type="email"
                  value={personal.email} onChange={setP("email")} required
                  hint="Changes require email verification" />
                <Field label="Phone Number" placeholder="+1 555 000 0000" icon={Phone} type="tel"
                  value={personal.phone} onChange={setP("phone")} />
                <Field label="Location" placeholder="City, Country" icon={MapPin} value={personal.location}
                  onChange={setP("location")} />
                <Field label="Website" placeholder="https://yoursite.com" icon={Globe} value={personal.website}
                  onChange={setP("website")} />
                <div className="sm:col-span-2">
                  <Textarea label="Short Bio" placeholder="Tell students about yourself…"
                    value={personal.bio} onChange={setP("bio")}
                    hint="Shown on your public profile. Max 300 characters." rows={4} />
                </div>
              </div>
              <SaveBtn loading={!!saving.personal} onClick={handlePersonalSave} />
            </Section>
          </div>

          {/* Social Links */}
          <div id="section-socials">
            <Section title="Social Links" description="Connect your professional profiles" icon={Globe} delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {([
                  { key: "github",   icon: Globe,   placeholder: "https://github.com/username"   },
                  { key: "twitter",  icon: Globe,  placeholder: "https://twitter.com/username"  },
                  { key: "linkedin", icon: Globe, placeholder: "https://linkedin.com/in/username" },
                  { key: "youtube",  icon: Globe,  placeholder: "https://youtube.com/@channel"  },
                ] as const).map(({ key, icon: Icon, placeholder }) => (
                  <Field key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    placeholder={placeholder}
                    icon={Icon}
                    value={socials[key]}
                    onChange={setS(key)} />
                ))}
              </div>
              <SaveBtn loading={!!saving.socials} onClick={() => simulateSave("socials")} />
            </Section>
          </div>

          {/* Password */}
          <div id="section-password">
            <Section title="Password & Security" description="Keep your account safe" icon={Lock} delay={0.3}>
              <div className="flex flex-col gap-4 mb-5">
                {/* Current password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Current Password *</label>
                  <div className={cn("relative rounded-xl border transition-all duration-200",
                    pwdErrors.current ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]",
                    !pwdErrors.current && pwd.current ? "border-blue-400 ring-2 ring-blue-500/15" : ""
                  )}>
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type={showPwd.current ? "text" : "password"} value={pwd.current}
                      onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none" />
                    <button onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.current && <p className="text-xs text-red-500">{pwdErrors.current}</p>}
                </div>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">New Password *</label>
                  <div className={cn("relative rounded-xl border transition-all duration-200",
                    pwdErrors.next ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]",
                    !pwdErrors.next && pwd.next ? "border-blue-400 ring-2 ring-blue-500/15" : ""
                  )}>
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type={showPwd.next ? "text" : "password"} value={pwd.next}
                      onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none" />
                    <button onClick={() => setShowPwd(p => ({ ...p, next: !p.next }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPwd.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.next && <p className="text-xs text-red-500">{pwdErrors.next}</p>}
                  <PasswordStrength password={pwd.next} />
                </div>

                {/* Confirm */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Confirm New Password *</label>
                  <div className={cn("relative rounded-xl border transition-all duration-200",
                    pwdErrors.confirm ? "border-red-300 dark:border-red-700"
                      : pwd.confirm && pwd.confirm === pwd.next ? "border-emerald-400 ring-2 ring-emerald-500/15"
                      : "border-gray-200 dark:border-white/[0.08]"
                  )}>
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type={showPwd.confirm ? "text" : "password"} value={pwd.confirm}
                      onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none" />
                    <button onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdErrors.confirm && <p className="text-xs text-red-500">{pwdErrors.confirm}</p>}
                  {pwd.confirm && pwd.confirm === pwd.next && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>
              </div>
              <SaveBtn loading={!!saving.password} onClick={handlePasswordSave} label="Update Password" />
            </Section>
          </div>

          {/* Danger Zone */}
          <div id="section-danger">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
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
                  <p className="text-xs text-red-400/80 dark:text-red-500/70 mt-0.5">These actions are irreversible. Proceed with caution.</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl
                  bg-red-50/60 dark:bg-red-950/15
                  border border-red-100 dark:border-red-900/20">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Deactivate Account</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Temporarily disable your account. Students keep access to purchased courses.
                    </p>
                  </div>
                  <button className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold
                    border border-red-200 dark:border-red-800/50
                    text-red-600 dark:text-red-400
                    hover:bg-red-100 dark:hover:bg-red-950/40 transition-all">
                    Deactivate
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl
                  bg-red-50/60 dark:bg-red-950/15
                  border border-red-100 dark:border-red-900/20">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Delete Account</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Permanently delete your account and all data. This cannot be undone.
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}