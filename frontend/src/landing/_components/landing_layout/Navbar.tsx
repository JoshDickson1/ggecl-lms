// Navbar.tsx — Windows 2000 Style
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import GGECL_LOGO from "@/assets/ggecl_logo.jpg";

const links = [
  { path: "/courses",     title: "Courses" },
  { path: "/instructors", title: "Instructors" },
  { path: "/categories",  title: "Categories" },
  { path: "/about",       title: "About" },
];

const Navbar = ({ showNav }: { showNav?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      navigate("/search?q=" + encodeURIComponent(search.trim()));
      setMenuOpen(false);
    }
  };

  return (
    <>
      <style>{`
        .win-nav-bar {
          font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
          background: #d4d0c8;
          border-bottom: 2px solid #808080;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          box-shadow: 0 2px 0 #ffffff inset, 0 -1px 0 #404040 inset;
        }
        .win-title-bar {
          background: linear-gradient(to right, #0a246a, #a6b5e7);
          color: #fff;
          font-weight: bold;
          font-size: 11px;
          padding: 2px 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.02em;
        }
        .win-title-bar img {
          width: 14px; height: 14px; border-radius: 2px;
        }
        .win-menu-bar {
          display: flex;
          align-items: center;
          padding: 0 8px;
          background: #d4d0c8;
          border-bottom: 1px solid #808080;
          gap: 2px;
        }
        .win-menu-item {
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 12px;
          color: #000;
          padding: 3px 8px;
          cursor: pointer;
          text-decoration: none;
          display: block;
          border: 1px solid transparent;
        }
        .win-menu-item:hover {
          background: #0a246a;
          color: #fff;
          border: 1px solid #0a246a;
        }
        .win-toolbar {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          gap: 6px;
          background: #d4d0c8;
        }
        .win-btn {
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 11px;
          padding: 3px 10px;
          background: #d4d0c8;
          border-top: 1.5px solid #ffffff;
          border-left: 1.5px solid #ffffff;
          border-right: 1.5px solid #404040;
          border-bottom: 1.5px solid #404040;
          cursor: pointer;
          color: #000;
          text-decoration: none;
          display: inline-block;
          white-space: nowrap;
        }
        .win-btn:hover {
          background: #e8e8e8;
        }
        .win-btn:active {
          border-top: 1.5px solid #404040;
          border-left: 1.5px solid #404040;
          border-right: 1.5px solid #ffffff;
          border-bottom: 1.5px solid #ffffff;
        }
        .win-btn-primary {
          background: #0a246a;
          color: #fff;
          border-top: 1.5px solid #3060c0;
          border-left: 1.5px solid #3060c0;
          border-right: 1.5px solid #000820;
          border-bottom: 1.5px solid #000820;
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 11px;
          padding: 3px 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .win-btn-primary:hover { background: #1a3a8a; }
        .win-search-box {
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 11px;
          padding: 2px 4px;
          border-top: 1.5px solid #808080;
          border-left: 1.5px solid #808080;
          border-right: 1.5px solid #ffffff;
          border-bottom: 1.5px solid #ffffff;
          background: #fff;
          color: #000;
          outline: none;
          width: 180px;
        }
        .win-separator {
          width: 1px;
          height: 20px;
          background: #808080;
          margin: 0 4px;
          box-shadow: 1px 0 0 #fff;
        }
        .win-logo-img {
          width: 20px; height: 20px;
          border-radius: 2px;
          border: 1px solid #808080;
          object-fit: cover;
        }
        .win-icon-btn {
          padding: 3px 7px;
          background: #d4d0c8;
          border-top: 1.5px solid #ffffff;
          border-left: 1.5px solid #ffffff;
          border-right: 1.5px solid #404040;
          border-bottom: 1.5px solid #404040;
          cursor: pointer;
          color: #000;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
        }
        .win-icon-btn:hover { background: #e8e8e8; }
        .win-mobile-menu {
          background: #d4d0c8;
          border: 2px solid #808080;
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          position: absolute;
          top: 100%;
          left: 0; right: 0;
          z-index: 200;
          padding: 4px;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.4);
        }
        .win-mobile-link {
          display: block;
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 12px;
          color: #000;
          padding: 5px 12px;
          text-decoration: none;
          border: 1px solid transparent;
        }
        .win-mobile-link:hover {
          background: #0a246a; color: #fff;
        }
        .win-spacer { height: 72px; }
      `}</style>

      <nav className="win-nav-bar">
        {/* Title bar */}
        <div className="win-title-bar">
          <img src={GGECL_LOGO} alt="GGECL" />
          GGECL Learning Management System
        </div>

        {/* Menu bar */}
        <div className="win-menu-bar">
          {links.map((l) => (
            <Link key={l.path} to={l.path} className="win-menu-item">{l.title}</Link>
          ))}
        </div>

        {/* Toolbar */}
        <div className="win-toolbar" style={{ position: "relative" }}>
          <Link to="/">
            <img src={GGECL_LOGO} alt="GGECL" className="win-logo-img" />
          </Link>

          <div className="win-separator" />

          {/* Back / Forward buttons */}
          <button className="win-btn" style={{ fontSize: 10 }}>&#9664; Back</button>
          <button className="win-btn" style={{ fontSize: 10 }}>Forward &#9654;</button>

          <div className="win-separator" />

          {/* Address / search */}
          <span style={{ fontSize: 11, fontFamily: "Tahoma, Arial", color: "#000" }}>Search:</span>
          <input
            type="text"
            placeholder="Search courses..."
            className="win-search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="win-btn" onClick={() => search.trim() && navigate("/search?q=" + encodeURIComponent(search.trim()))}>Go</button>

          <div className="win-separator" />

          {/* Cart */}
          <Link to="/cart">
            <button className="win-icon-btn" title="Shopping Cart">
              <ShoppingCart size={13} />
            </button>
          </Link>

          <div className="win-separator" />

          {/* Auth buttons */}
          <Link to="/login">
            <button className="win-btn">Login Student</button>
          </Link>
          <Link to="/instructor/login">
            <button className="win-btn-primary">Login Instructor</button>
          </Link>

          {/* Hamburger for mobile */}
          <button
            className="win-icon-btn"
            style={{ marginLeft: "auto", display: "none" }}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            &#9776;
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="win-mobile-menu">
              {links.map((l) => (
                <Link key={l.path} to={l.path} className="win-mobile-link" onClick={() => setMenuOpen(false)}>
                  {l.title}
                </Link>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid #808080", margin: "4px 0" }} />
              <Link to="/login" className="win-mobile-link" onClick={() => setMenuOpen(false)}>Login Student</Link>
              <Link to="/instructor/login" className="win-mobile-link" onClick={() => setMenuOpen(false)}>Login Instructor</Link>
            </div>
          )}
        </div>
      </nav>
      <div className="win-spacer" />
    </>
  );
};

export default Navbar;
