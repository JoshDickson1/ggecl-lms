// src/dashboards/commons/PreviewAdmin.tsx
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Mail, Calendar, Shield, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  location?: string | null;
  gender?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/20",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-800/30",
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PreviewAdmin() {
  const { id } = useParams<{ id: string }>();

  const { data: apiUser, isLoading, isError } = useQuery<AdminUser>({
    queryKey: ["admin-user", id],
    queryFn: () => UserService.findOne(id!) as Promise<AdminUser>,
    enabled: !!id,
  });

  const joinedDate = apiUser?.createdAt
    ? new Date(apiUser.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  const admin = {
    name:       apiUser?.name ?? "Admin",
    avatar:     initials(apiUser?.name ?? "A"),
    avatarBg:   "bg-gradient-to-br from-rose-500 to-pink-600",
    title:      "Administrator",
    bio:        apiUser?.bio ?? "No bio provided.",
    email:      apiUser?.email ?? "",
    location:   apiUser?.location ?? null,
    gender:     apiUser?.gender ?? null,
    joined:     joinedDate,
    status:     (apiUser?.status === "ACTIVE" || !apiUser?.status ? "Active" : apiUser.status === "BANNED" ? "Suspended" : "Inactive") as "Active" | "Inactive" | "Suspended",
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
      <p className="text-sm font-semibold">Failed to load admin profile</p>
      <Link to="/admin/admins" className="text-xs text-blue-500 hover:underline">← Back to Admins</Link>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-12">

      {/* Back */}
      <Fade>
        <Link to="/admin/admins" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Admins
        </Link>
      </Fade>

      {/* ── Hero ── */}
      <Fade delay={0.02}>
        <Card>
          <div className="h-32 rounded-t-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle 500px at 80% 50%, rgba(251,113,133,0.3), transparent 70%)" }} />
          </div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#0f1623] shadow-xl flex-shrink-0 z-10">
                {apiUser?.image
                  ? <img src={apiUser.image} alt={admin.name} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${admin.avatarBg}`}>{admin.avatar}</div>
                }
              </div>
              <div className="flex-1 sm:pb-1 relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${STATUS_STYLES[admin.status]}`}>{admin.status}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{admin.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{admin.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 relative z-10">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-500" />{admin.email}</span>
              {admin.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" />{admin.location}</span>}
              {admin.joined && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-rose-500" />Joined {admin.joined}</span>}
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-rose-500" />Administrator</span>
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── About ── */}
      <Fade delay={0.05}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-rose-500" />
            <h2 className="font-black text-base text-gray-900 dark:text-white">About</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{admin.bio}</p>
          <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
            <div className="text-gray-400">
              Role: <span className="font-semibold text-gray-700 dark:text-gray-300">Administrator</span>
            </div>
            <div className="text-gray-400">
              Status: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.status}</span>
            </div>
            {admin.gender && (
              <div className="text-gray-400">
                Gender: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.gender}</span>
              </div>
            )}
            {admin.location && (
              <div className="text-gray-400">
                Location: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.location}</span>
              </div>
            )}
          </div>
        </Card>
      </Fade>
    </div>
  );
}
