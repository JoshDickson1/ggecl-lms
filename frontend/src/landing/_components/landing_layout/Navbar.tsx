// Navbar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ react-router-dom v6
import { Menu, Search, ShoppingCart, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {ModeToggle} from "@/common/mode-toggle";
import { useCallback } from "react";
import GGECL_LOGO from "@/assets/ggecl_logo.jpg";
const CSS_VARS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

  .nav-theme {
    --glass-bg:    rgba(255,255,255,0.55);
    --glass-bd:    rgba(255,255,255,0.75);
    --glass-sh:    0 8px 32px rgba(0,0,0,0.10), 0 1.5px 0 rgba(255,255,255,0.80) inset;
    --pill-bg:     rgba(240,242,248,0.70);
    --pill-bd:     rgba(255,255,255,0.75);
    --text:        #0d1117;
    --muted:       #5a6478;
    --accent:      #1a6ef7;
    --accent-s:    rgba(26,110,247,0.12);
  }
  .dark .nav-theme {
  --glass-bg: rgba(8, 15, 35, 0.88); /* much darker navy glass */
  --glass-bd: rgba(59, 130, 246, 0.12);
  --glass-sh:
    0 10px 38px rgba(0, 0, 0, 0.62),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;

  --pill-bg: rgba(15, 23, 42, 0.72);
  --pill-bd: rgba(59, 130, 246, 0.1);

  --text: #f8fbff;
  --muted: #94a3b8;

  --accent: #3b82f6;
  --accent-s: rgba(59, 130, 246, 0.14);
}

  /* All colour transitions run on the variables themselves */
  .nav-pill-box {
  backdrop-filter: blur(15px) saturate(180%);
-webkit-backdrop-filter: blur(28px) saturate(180%);
    background:   var(--glass-bg);
    border-color: var(--glass-bd);
    box-shadow:   var(--glass-sh);
    transition:
      background   0.38s ease,
      border-color 0.38s ease,
      box-shadow   0.38s ease,
      border-radius 0.32s cubic-bezier(0.4,0,0.2,1);
  }
  .nav-pill-box:hover {
    box-shadow: var(--glass-sh), 0 16px 52px rgba(26,110,247,0.07);
  }

  .v-input {
    background:   var(--pill-bg);
    border-color: var(--pill-bd);
    color:        var(--text);
    transition: background 0.3s ease, border-color 0.28s ease, box-shadow 0.2s ease;
  }
  .v-input::placeholder { color: var(--muted); }
  .v-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-s);
    background: var(--glass-bg);
  }

  .v-icon-btn {
    background:   var(--pill-bg);
    border-color: var(--pill-bd);
    color: var(--muted);
    transition: background 0.28s ease, border-color 0.28s ease, color 0.28s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
  }
  .v-icon-btn:hover {
    background:   var(--accent-s);
    border-color: var(--accent);
    color: var(--accent);
    transform: scale(1.09);
  }
  .v-icon-btn:active { transform: scale(0.93); }

  .v-ghost-btn {
    background:   var(--pill-bg);
    border-color: var(--pill-bd);
    color: var(--muted);
    transition: background 0.28s ease, border-color 0.28s ease, color 0.28s ease, transform 0.22s ease, box-shadow 0.22s ease;
  }
  .v-ghost-btn:hover {
    background:   var(--accent-s);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--accent-s);
  }
  .v-ghost-btn:active { transform: translateY(0) scale(0.97); }

  .v-nav-link {
    color: var(--muted);
    transition: color 0.25s ease, background 0.25s ease;
  }
  .v-nav-link:hover { color: var(--text); background: var(--accent-s); }

  .v-m-link {
    color: var(--text);
    border-color: transparent;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .v-m-link:hover {
    background: linear-gradient(90deg, var(--accent-s) 0%, transparent 100%);
    border-color: rgba(26,110,247,0.2);
    color: var(--accent);
    transform: translateX(4px);
  }
  .v-m-link:active { transform: translateX(4px) scale(0.98); }

  .v-divider {
    background: var(--glass-bd);
    transition: background 0.38s ease;
  }
  .v-shortcut {
    background:   var(--pill-bg);
    border-color: var(--pill-bd);
    color: var(--muted);
    transition: opacity 0.2s ease;
  }
  .v-input:focus ~ .v-shortcut { opacity: 0; }

  .v-toggle {
    transition: background 0.38s ease, border-color 0.38s ease;
  }

  /* ── Mobile menu: absolute dropdown that floats OVER page content */
  .mobile-menu-anchor {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    z-index: 200;
    pointer-events: none;
  }
  .mobile-menu-anchor.open { pointer-events: all; }

  .mobile-menu-card {
  backdrop-filter: blur(10px) saturate(180%);
-webkit-backdrop-filter: blur(28px) saturate(180%);
    background:   var(--glass-bg);
    border: 1px solid var(--glass-bd);
    box-shadow:   var(--glass-sh);
    border-radius: 22px;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px) scale(0.975);
    transition:
      max-height 0.42s cubic-bezier(0.4,0,0.2,1),
      opacity    0.26s ease,
      transform  0.36s cubic-bezier(0.34,1.56,0.64,1),
      background   0.38s ease,
      border-color 0.38s ease,
      box-shadow   0.38s ease;
  }
  .mobile-menu-anchor.open .mobile-menu-card {
    max-height: 640px;
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const defaultLinks = [
  { path: "/courses",     title: "Courses" },
  { path: "/instructors", title: "Instructors" },
  { path: "/categories",  title: "Categories" },
  { path: "/about",       title: "About" },
];

const Navbar = ({ showNav }: { showNav?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") { setMenuOpen(false); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      navigate("/search?q=" + encodeURIComponent(e.currentTarget.value.trim()));
      closeMenu();
    }
  };

  const allLinks = showNav ? defaultLinks : defaultLinks;

  return (
    <>
      <style>{CSS_VARS}</style>

      {/* 
        position: relative on the nav so the absolute mobile-menu-anchor
        is positioned relative to it, but the nav itself is fixed so it
        doesn't push down page content. 
      */}
      <nav
        className={cn("nav-theme fixed top-0 left-0 z-[100] w-full px-4 pt-3")}
        style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif", position: "fixed" }}
      >
        {/* Centering wrapper — position:relative so mobile-menu-anchor is relative to this */}
        <div className="relative max-w-[1200px] mx-auto">

          {/* ── Pill */}
          <div className="nav-pill-box border rounded-full px-[18px]">
            <div className="flex items-center gap-10 h-[72px]">

              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 no-underline group">
                <img
                  src={GGECL_LOGO}
                  alt="GGECL"
                  className="w-[52px] h-[52px] rounded-full border-2 border-[rgba(255,255,255,0.75)] shadow-[0_2px_10px_rgba(0,0,0,0.14)] object-cover transition-transform duration-300 group-hover:scale-[1.09] group-hover:-rotate-[4deg]"
                />
              </Link>

              {/* Desktop centre */}
              {!showNav ? (
                <div className="relative flex-1 max-w-[340px] hidden md:block">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search courses, instructors…"
                    onKeyDown={handleSearch}
                    className="v-input w-full rounded-full py-[9px] pl-[38px] pr-[54px] text-sm outline-none border"
                  />
                  <span className="v-shortcut absolute right-2.5 top-1/2 -translate-y-1/2 border rounded-[7px] px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide pointer-events-none">
                    ⌘K
                  </span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
                  {allLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="v-nav-link relative px-4 py-2 rounded-full text-[14px] font-medium no-underline whitespace-nowrap after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:rounded-sm after:bg-gradient-to-r after:from-[#1a6ef7] after:to-[#0a3ba8] after:transition-[width] after:duration-[250ms] hover:after:w-[38%]"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <Link to="/login" className="hidden md:block">
                  <button className="v-ghost-btn px-[18px] py-2 rounded-full text-[13.5px] font-semibold cursor-pointer whitespace-nowrap border">
                    Login Student
                  </button>
                </Link>
                <Link to="/instructor/login" className="hidden md:block">
                  <button className="px-[18px] py-2 rounded-full text-[13.5px] font-bold cursor-pointer whitespace-nowrap text-white bg-gradient-to-br from-[#1a6ef7] to-[#0a3ba8] border border-[rgba(77,155,255,0.35)] shadow-[0_3px_14px_rgba(26,110,247,0.38)] transition-all duration-200 hover:from-[#2e7fff] hover:to-[#1a6ef7] hover:shadow-[0_7px_22px_rgba(26,110,247,0.50)] hover:-translate-y-[1.5px] active:scale-[0.97]">
                    Login Instructor
                  </button>
                </Link>


                  <Link to="/cart" className="v-icon-btn hidden md:flex w-10 h-10 rounded-full items-center justify-center border no-underline relative">
                    <ShoppingCart size={16} />
                    <span className="w-[7px] h-[7px] rounded-full absolute top-0.5 right-0.5 bg-[var(--accent)] shadow-[0_0_0_2px_var(--glass-bg)]" />
                  </Link>

                {/* Docs icon — desktop */}
                <Link to="/docs"
                  title="Documentation"
                  className="v-icon-btn hidden md:flex w-10 h-10 rounded-full items-center justify-center border no-underline">
                  <BookOpen size={16} />
                </Link>

                {/* Theme toggle */}
                <div className=""><ModeToggle /></div>
                

                {/* Hamburger */}
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  aria-label="Toggle menu"
                  className="md:hidden v-icon-btn w-10 h-10 rounded-full flex flex-col items-center justify-center gap-[5px] border cursor-pointer p-0"
                >
                  <Menu /> 
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile dropdown — absolute, overlays page content */}
          <div className={cn("mobile-menu-anchor md:hidden", menuOpen && "open")}>
            <div className="mobile-menu-card">
              <div className="px-5 py-5">

                {/* Search */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  <input
                    type="text"
                    placeholder="Search courses, instructors…"
                    onKeyDown={handleSearch}
                    className="v-input w-full rounded-2xl py-3 pl-[42px] pr-4 text-[14.5px] outline-none border"
                  />
                </div>

                <div className="v-divider h-px mb-4" />

                {/* Links */}
                <nav className="flex flex-col gap-0.5 mb-4">
                  {allLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className="v-m-link flex items-center justify-between px-4 py-[13px] rounded-2xl text-[15.5px] font-medium no-underline border"
                    >
                      {link.title}
                      <span style={{ color: "var(--muted)", opacity: 0.35 }} className="text-[17px]">›</span>
                    </Link>
                  ))}
                    <Link to="/cart" onClick={closeMenu} className="v-m-link flex items-center justify-between px-4 py-[13px] rounded-2xl text-[15.5px] font-medium no-underline border">
                      Cart
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-[#1a6ef7] to-[#0a3ba8] text-white tracking-wider">NEW</span>
                        <span style={{ color: "var(--muted)", opacity: 0.35 }} className="text-[17px]">›</span>
                      </span>
                    </Link>
                    <Link to="/docs" onClick={closeMenu}
                      className="v-m-link flex items-center justify-between px-4 py-[13px] rounded-2xl text-[15.5px] font-medium no-underline border">
                      <span className="flex items-center gap-2.5">
                        <BookOpen size={16} style={{ color: "var(--accent)" }} />
                        Documentation
                      </span>
                      <span style={{ color: "var(--muted)", opacity: 0.35 }} className="text-[17px]">›</span>
                    </Link>
                </nav>

                <div className="v-divider h-px mb-4" />

                {/* Buttons */}
                <div className="flex flex-col gap-2.5">
                  <Link to="/login" onClick={closeMenu} className="block">
                    <button className="v-ghost-btn w-full py-[14px] rounded-2xl text-[14.5px] font-semibold text-center cursor-pointer border">
                      Login as Student
                    </button>
                  </Link>
                  <Link to="/instructor/login" onClick={closeMenu} className="block">
                    <button className="w-full py-[14px] rounded-2xl text-[14.5px] font-bold text-center cursor-pointer text-white bg-gradient-to-br from-[#1a6ef7] to-[#0a3ba8] border border-transparent shadow-[0_3px_14px_rgba(26,110,247,0.38)] transition-all duration-200 hover:from-[#2e7fff] hover:to-[#1a6ef7] hover:-translate-y-[1.5px]">
                      Login as Instructor
                    </button>
                  </Link>

                </div>

              </div>
            </div>
          </div>

        </div>
      </nav>
      
      {/* space for bottom content */}
      {/* <div className="h-[80px]" /> */}
    </>
  );
};

export default Navbar;
