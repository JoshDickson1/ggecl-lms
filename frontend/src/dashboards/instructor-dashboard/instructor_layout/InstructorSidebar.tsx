// src/dashboards/instructor-dashboard/InstructorSidebar.tsx
import { useState, useEffect, useContext, createContext, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, MessageSquare, ChevronDown, LogOut, GraduationCap,
  Video,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDashboardUser, getInitials } from "@/hooks/useDashboardUser";
import { getAccent, type Accent } from "@/data/shared";

// ─── Sidebar context ──────────────────────────────────────────────────────────
type SidebarCtx = { open: boolean; toggle: () => void; close: () => void };
const SidebarCtx = createContext<SidebarCtx>({ open: false, toggle: () => {}, close: () => {} });

export function InstructorSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen(p => !p), close: () => setOpen(false) }}>
      {children}
    </SidebarCtx.Provider>
  );
}
export const useInstructorSidebar = () => useContext(SidebarCtx);

// ─── Nav items (with optional children) ──────────────────────────────────────
interface NavChild { to: string; label: string }
interface NavItemDef { to: string; icon: React.ElementType; label: string; badge?: number; children?: NavChild[]; end?: boolean }

const NAV_ITEMS: NavItemDef[] = [
  {
    to: "/instructor",
    icon: LayoutDashboard,
    label: "Dashboard",
    end: true,
  },

  {
    to: "/instructor/courses",
    icon: BookOpen,
    label: "Manage Courses",
    children: [
      { to: "/instructor/courses", label: "All Courses" },
      { to: "/instructor/assignments", label: "Assignments" },
    ],
  },

  { 
    to: "/instructor/discussions",
    icon: MessageSquare,
    label: "Student Discussions",
    badge: 7,
  },

  { 
    to: "/instructor/video-call",
    icon: Video,
    label: "Video Call",
  },

  {
    to: "/instructor/students",
    icon: Users,
    label: "Manage Students",
    children: [
      { to: "/instructor/students", label: "All Students" },
      { to: "/instructor/reviews", label: "Reviews" },
    ],
  },

  {
    to: "/instructor/profile",
    icon: UserCog,
    label: "Profile",
    children: [
      { to: "/instructor/profile", label: "View Profile" },
      { to: "/instructor/settings", label: "Settings" },
    ],
  }
];

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, accent, onNavigate }: {
  item: NavItemDef; accent: Accent; onNavigate?: () => void;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const isChildActive = item.children?.some(c => location.pathname.startsWith(c.to));

  useEffect(() => { if (isChildActive) setOpen(true); }, [isChildActive]);

  if (hasChildren) {
    return (
      <div>
        <button onClick={() => setOpen(p => !p)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[12.5px] font-semibold transition-all duration-200",
            open ? `${accent.activeBg} ${accent.activeText} ${accent.shadow}` : `${accent.idleBg} ${accent.idleText} ${accent.hoverBg} ${accent.hoverText}`
          )}>
          <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0",
            open ? accent.activeIcon : "bg-white/70 dark:bg-white/[0.08]")}>
            <Icon className="w-[14px] h-[14px]" />
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden">
              <div className={cn("ml-4 mt-1 pl-3 flex flex-col gap-0.5 border-l-2", accent.border)}>
                {item.children!.map(child => {
                  const active = location.pathname === child.to || location.pathname.startsWith(child.to + "/");
                  return (
                    <NavLink key={child.to} to={child.to} onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 pl-3 pr-3 py-2 rounded-xl text-[12px] transition-all duration-200",
                        active ? `${accent.activeBg} ${accent.activeText}` : `text-gray-500 dark:text-gray-400 ${accent.hoverBg} ${accent.hoverText}`
                      )}>
                      <span className="font-medium">{child.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink to={item.to} onClick={onNavigate} end={item.end}
      className={({ isActive }) => cn(
        "flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[12.5px] font-semibold transition-all duration-200",
        isActive ? `${accent.activeBg} ${accent.activeText} ${accent.shadow}` : `${accent.idleBg} ${accent.idleText} ${accent.hoverBg} ${accent.hoverText}`
      )}>
      {({ isActive }) => (
        <>
          <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0",
            isActive ? accent.activeIcon : "bg-white/70 dark:bg-white/[0.08]")}>
            <Icon className="w-[14px] h-[14px]" />
          </div>
          <span className="flex-1">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
              isActive ? "bg-white/25 text-white" : accent.badge)}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useDashboardUser();
  const navigate = useNavigate();
  const accent = getAccent("instructor");
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Instructor";

  return (
    <div className="relative flex flex-col h-full bg-white/90 dark:bg-[#080d18]/95 backdrop-blur-2xl overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: "linear-gradient(to right,rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(to bottom,rgba(99,102,241,1) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

      {/* Logo */}
      <div className="relative px-4 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accent.logoBg} flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)]`}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[13px] font-black text-gray-900 dark:text-white tracking-tight">GGECL</h1>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Instructor Portal</p>
          </div>
        </Link>
      </div>
      {/* Nav */}
      <nav className="relative flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto
        [scrollbar-width:thin] [scrollbar-color:transparent_transparent]
        hover:[scrollbar-color:rgba(156,163,175,0.25)_transparent]
        [&::-webkit-scrollbar]:w-[3px]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-transparent
        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/50">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} accent={accent} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-gray-100 dark:border-white/[0.06]">
        <div className="px-3 pt-3 pb-2">
          <Link to="/instructor/profile" onClick={onNavigate}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all group">
            <div className="relative flex-shrink-0">
              <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 ${accent.ring}`}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white">{getInitials(user)}</span>
                    </div>
                }
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${accent.dot} rounded-full border-2 border-white dark:border-[#080d18]`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", accent.pill)}>Instructor</span>
          </Link>
        </div>
        <div className="px-3 pb-3">
          <button onClick={() => { logout(); navigate("/instructor/login"); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[12.5px] font-semibold
              bg-red-50/80 dark:bg-red-950/20 text-red-600 dark:text-red-400
              border border-red-100 dark:border-red-900/30
              hover:bg-red-100 dark:hover:bg-red-950/40 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 transition-all flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function InstructorSidebar() {
  const { open, close } = useInstructorSidebar();
  const location = useLocation();
  useEffect(() => { close(); }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        )}
      </AnimatePresence>
      <motion.aside initial={false} animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="lg:hidden fixed top-0 left-0 bottom-0 w-[272px] z-50 shadow-2xl">
        <SidebarContent onNavigate={close} />
      </motion.aside>
      <aside className="hidden lg:block fixed top-3 left-3 bottom-3 w-56 rounded-[20px] z-30 overflow-hidden
        shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-gray-200/50 dark:border-white/[0.07]">
        <SidebarContent />
      </aside>
    </>
  );
}