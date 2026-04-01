// src/dashboards/student-dashboard/StudentNavbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search, Bell, ShoppingCart, Menu, ChevronDown,
  User, LogOut, Settings, LayoutDashboard, GraduationCap,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardUser, getInitials } from "@/hooks/useDashboardUser";
import { useStudentSidebar } from "./StudentSidebar";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { ModeToggle } from "@/common/mode-toggle";

// ─── Theme toggle (persistent via ThemeContext) ───────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center
        bg-gray-100 dark:bg-white/[0.06]
        hover:bg-blue-50 dark:hover:bg-cyan-950/30
        border border-transparent hover:border-blue-200 dark:hover:border-cyan-800/40
        transition-all duration-200">
      {isDark
        ? <Sun className="w-4 h-4 text-amber-400" />
        : <Moon className="w-4 h-4 text-gray-500" />}
    </button>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (!parts.length) return <span className="text-sm font-bold text-gray-900 dark:text-white">Home</span>;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronDown className="w-3 h-3 text-gray-300 dark:text-gray-600 -rotate-90" />}
            <span className={isLast ? "font-bold text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIFS = [
  { id: 1, text: "Your React Bootcamp certificate is ready!",    time: "5m ago",  unread: true  },
  { id: 2, text: "New lesson added to your enrolled course",      time: "2h ago",  unread: true  },
  { id: 3, text: "Assignment feedback from instructor",           time: "1d ago",  unread: false },
];

function NotificationBell() {
  const unread = NOTIFS.filter(n => n.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center
          bg-gray-100 dark:bg-white/[0.06]
          hover:bg-blue-50 dark:hover:bg-cyan-950/30
          border border-transparent hover:border-blue-200 dark:hover:border-cyan-800/40
          transition-all duration-200">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-cyan-500 border-2 border-white dark:border-[#080d18]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 rounded-[18px] border border-gray-100 dark:border-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.14)] bg-white dark:bg-[#0f1623]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
          <p className="text-xs font-black text-gray-900 dark:text-white">Notifications</p>
          {unread > 0 && <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{unread} new</span>}
        </div>
        {NOTIFS.map(n => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors ${n.unread ? "bg-cyan-50/30 dark:bg-cyan-950/10" : ""}`}>
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-cyan-500" : "bg-transparent"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] text-gray-700 dark:text-gray-300 leading-snug">{n.text}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
        <div className="px-4 py-2.5">
          <button className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline">View all</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown() {
  const { user, logout } = useDashboardUser();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full
          bg-gray-100 dark:bg-white/[0.06]
          hover:bg-blue-50 dark:hover:bg-cyan-950/30
          border border-transparent hover:border-blue-200 dark:hover:border-cyan-800/40
          transition-all duration-200 outline-none">
          <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-200/50 dark:ring-cyan-500/20">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{getInitials(user)}</span>
                </div>
            }
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white dark:border-[#080d18]" />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-[12px] font-bold text-gray-900 dark:text-white">{user?.firstName}</span>
            <span className="text-[9px] text-gray-400 mt-0.5">Student</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-[18px] border border-gray-100 dark:border-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.14)] bg-white dark:bg-[#0f1623] p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2 rounded-[14px] bg-gray-50 dark:bg-white/[0.03] mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-200/50 dark:ring-cyan-500/20">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xs font-black text-white">{getInitials(user)}</span>
                  </div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 inline-block mt-0.5">Student</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/student" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[14px] cursor-pointer text-[12.5px]">
            <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center"><LayoutDashboard className="w-3.5 h-3.5" /></div>
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/student/profile" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[14px] cursor-pointer text-[12.5px]">
            <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/student/settings" className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[14px] cursor-pointer text-[12.5px]">
            <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center"><Settings className="w-3.5 h-3.5" /></div>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/[0.06]" />
        <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[14px] cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[12.5px]">
          <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center"><LogOut className="w-3.5 h-3.5" /></div>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main navbar ──────────────────────────────────────────────────────────────
export function StudentNavbar() {
  const { toggle } = useStudentSidebar();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      {/* Desktop */}
      <header className="hidden lg:flex sticky top-3 z-20 mx-3 mb-3 h-[58px] items-center justify-between px-4
        rounded-[20px] bg-white/80 dark:bg-[#0f1623]/90 backdrop-blur-2xl
        border border-gray-200/50 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex-1 min-w-0 mr-4"><Breadcrumb /></div>
        <div className={`relative transition-all duration-300 ${searchFocused ? "w-80" : "w-60"}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input placeholder="Search courses…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-9 py-2 rounded-full text-[12px]
              bg-gray-100/80 dark:bg-white/[0.05]
              border border-transparent focus:border-cyan-300 dark:focus:border-cyan-700
              focus:ring-2 focus:ring-cyan-500/15
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none transition-all duration-300" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold
            text-gray-400 bg-white dark:bg-white/[0.08] px-1.5 py-0.5 rounded-md
            border border-gray-200 dark:border-white/[0.08]">⌘K</kbd>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <ThemeToggle />
          <NotificationBell />
          <Link to="/student/cart" className="relative w-9 h-9 rounded-full flex items-center justify-center
            bg-gray-100 dark:bg-white/[0.06] hover:bg-blue-50 dark:hover:bg-cyan-950/30
            border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800/40 transition-all">
            <ShoppingCart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </Link>
          <ProfileDropdown />
        </div>
      </header>

      {/* Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-30
        bg-white/90 dark:bg-[#080d18]/95 backdrop-blur-2xl
        border-b border-gray-100 dark:border-white/[0.06]
        flex items-center justify-between px-4">
        <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] hover:bg-blue-50 transition-all">
          <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        <Link to="/" className="flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-black text-gray-900 dark:text-white">GGECL</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </>
  );
}