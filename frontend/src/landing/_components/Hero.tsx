// Hero.tsx — Windows 2000 Style
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <>
      <style>{`
        .hero-win {
          font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
          background: #d4d0c8;
          padding: 16px;
        }

        /* Marquee announcement bar */
        .hero-marquee-bar {
          background: #000080;
          color: #ffff00;
          font-size: 11px;
          font-family: "Tahoma", Arial, sans-serif;
          padding: 3px 0;
          overflow: hidden;
          margin-bottom: 12px;
          border-top: 1px solid #0000c0;
          border-bottom: 1px solid #000040;
        }
        .hero-marquee-inner {
          display: inline-block;
          white-space: nowrap;
          animation: win-marquee 22s linear infinite;
          padding-left: 100%;
        }
        @keyframes win-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }

        /* Main window frame */
        .hero-window {
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          background: #d4d0c8;
          max-width: 1100px;
          margin: 0 auto;
        }

        .hero-window-title {
          background: linear-gradient(to right, #0a246a, #a6b5e7);
          color: #fff;
          font-weight: bold;
          font-size: 12px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          user-select: none;
        }
        .hero-window-title-btns {
          display: flex;
          gap: 2px;
        }
        .hero-win-ctrl-btn {
          width: 16px; height: 14px;
          background: #d4d0c8;
          border-top: 1px solid #fff;
          border-left: 1px solid #fff;
          border-right: 1px solid #404040;
          border-bottom: 1px solid #404040;
          font-size: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #000;
          font-weight: bold;
          line-height: 1;
        }

        .hero-window-body {
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        /* Left panel — welcome box */
        .hero-welcome-panel {
          flex: 1;
          min-width: 0;
        }

        .hero-welcome-box {
          border-top: 1px solid #808080;
          border-left: 1px solid #808080;
          border-right: 1px solid #ffffff;
          border-bottom: 1px solid #ffffff;
          background: #ffffff;
          padding: 16px;
          margin-bottom: 12px;
        }
        .hero-welcome-box h1 {
          font-size: 20px;
          font-weight: bold;
          color: #000080;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .hero-welcome-box h1 span {
          color: #cc0000;
        }
        .hero-welcome-box p {
          font-size: 12px;
          color: #000;
          line-height: 1.6;
          margin: 0 0 12px;
        }

        .hero-btn-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .win-action-btn {
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 12px;
          padding: 5px 16px;
          background: #d4d0c8;
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          cursor: pointer;
          color: #000;
          text-decoration: none;
          display: inline-block;
          min-width: 80px;
          text-align: center;
        }
        .win-action-btn:hover { background: #e4e0d8; }
        .win-action-btn:active {
          border-top: 2px solid #404040;
          border-left: 2px solid #404040;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        }
        .win-action-btn-primary {
          background: #000080;
          color: #ffffff;
          border-top: 2px solid #0000c0;
          border-left: 2px solid #0000c0;
          border-right: 2px solid #000040;
          border-bottom: 2px solid #000040;
          font-family: "Tahoma", Arial, sans-serif;
          font-size: 12px;
          padding: 5px 16px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        .win-action-btn-primary:hover { background: #0000a0; }

        /* Stats row */
        .hero-stats-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .hero-stat-box {
          flex: 1;
          border-top: 1px solid #808080;
          border-left: 1px solid #808080;
          border-right: 1px solid #ffffff;
          border-bottom: 1px solid #ffffff;
          background: #fff;
          padding: 8px;
          text-align: center;
        }
        .hero-stat-num {
          font-size: 18px;
          font-weight: bold;
          color: #000080;
          display: block;
        }
        .hero-stat-label {
          font-size: 10px;
          color: #444;
        }

        /* Features panel */
        .hero-features-panel {
          width: 260px;
          flex-shrink: 0;
        }
        .hero-features-window {
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
        }
        .hero-features-title {
          background: linear-gradient(to right, #0a246a, #a6b5e7);
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          padding: 3px 7px;
        }
        .hero-features-body {
          background: #fff;
          padding: 8px;
        }
        .hero-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 5px 0;
          border-bottom: 1px dotted #c0c0c0;
          font-size: 11px;
          color: #000;
        }
        .hero-feature-item:last-child { border-bottom: none; }
        .hero-feature-icon {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* "NEW" blinky badge */
        .win-new-badge {
          display: inline-block;
          background: #cc0000;
          color: #fff;
          font-size: 9px;
          font-weight: bold;
          padding: 1px 4px;
          margin-left: 4px;
          animation: win-blink 1s step-end infinite;
        }
        @keyframes win-blink {
          50% { opacity: 0; }
        }

        /* IE-style status bar */
        .hero-status-bar {
          background: #d4d0c8;
          border-top: 1px solid #808080;
          padding: 2px 8px;
          font-size: 10px;
          color: #000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: "Tahoma", Arial;
        }
        .hero-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hero-status-dot {
          width: 8px; height: 8px;
          background: #00aa00;
          border-radius: 50%;
        }
      `}</style>

      <div className="hero-win">
        {/* Marquee announcement */}
        <div className="hero-marquee-bar">
          <span className="hero-marquee-inner">
            *** WELCOME TO GGECL LEARNING MANAGEMENT SYSTEM *** 500+ Courses Available *** World-Class Instructors *** Start Learning Today! *** Best Online Education Platform *** Join 10,000+ Students ***
          </span>
        </div>

        {/* Main window */}
        <div className="hero-window">
          <div className="hero-window-title">
            <span>GGECL Learning Management System — Welcome</span>
            <div className="hero-window-title-btns">
              <div className="hero-win-ctrl-btn">_</div>
              <div className="hero-win-ctrl-btn">&#9633;</div>
              <div className="hero-win-ctrl-btn">&#215;</div>
            </div>
          </div>

          <div className="hero-window-body">
            {/* Left panel */}
            <div className="hero-welcome-panel">
              <div className="hero-welcome-box">
                <h1>
                  Welcome to <span>GGECL</span> LMS<br />
                  Online Learning Portal
                </h1>
                <p>
                  Access world-class education from the comfort of your desktop.
                  Browse 500+ courses taught by industry professionals. Earn
                  certificates, track your progress, and advance your career — all
                  from one place.
                  <span className="win-new-badge">NEW</span>
                </p>
                <div className="hero-btn-row">
                  <Link to="/courses">
                    <button className="win-action-btn-primary">Browse Courses</button>
                  </Link>
                  <Link to="/login">
                    <button className="win-action-btn">Student Login</button>
                  </Link>
                  <Link to="/instructor/login">
                    <button className="win-action-btn">Instructor Login</button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="hero-stats-row">
                <div className="hero-stat-box">
                  <span className="hero-stat-num">500+</span>
                  <span className="hero-stat-label">Courses</span>
                </div>
                <div className="hero-stat-box">
                  <span className="hero-stat-num">10k+</span>
                  <span className="hero-stat-label">Students</span>
                </div>
                <div className="hero-stat-box">
                  <span className="hero-stat-num">50+</span>
                  <span className="hero-stat-label">Instructors</span>
                </div>
                <div className="hero-stat-box">
                  <span className="hero-stat-num">4.9</span>
                  <span className="hero-stat-label">Rating</span>
                </div>
              </div>

              {/* Status bar */}
              <div className="hero-status-bar">
                <div className="hero-status-indicator">
                  <div className="hero-status-dot" />
                  <span>Portal Online — All Systems Operational</span>
                </div>
                <span>Zone: Trusted Site</span>
              </div>
            </div>

            {/* Right panel — features */}
            <div className="hero-features-panel">
              <div className="hero-features-window">
                <div className="hero-features-title">Platform Features</div>
                <div className="hero-features-body">
                  {[
                    { icon: "📚", title: "500+ Courses", desc: "Across all major disciplines" },
                    { icon: "🏆", title: "Certificates", desc: "Industry-recognized credentials" },
                    { icon: "▶", title: "HD Video", desc: "High quality video lectures" },
                    { icon: "💬", title: "Live Support", desc: "24/7 student support team" },
                    { icon: "📊", title: "Analytics", desc: "Track your learning progress" },
                    { icon: "🌐", title: "Global Access", desc: "Learn from anywhere, anytime" },
                  ].map((f) => (
                    <div className="hero-feature-item" key={f.title}>
                      <span className="hero-feature-icon">{f.icon}</span>
                      <div>
                        <strong style={{ fontSize: 11 }}>{f.title}</strong>
                        <br />
                        <span style={{ color: "#555", fontSize: 10 }}>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visitors counter */}
              <div style={{
                marginTop: 8,
                border: "1px inset #808080",
                background: "#000",
                color: "#00ff00",
                fontFamily: "Courier New, monospace",
                fontSize: 11,
                padding: "4px 8px",
                textAlign: "center",
              }}>
                Visitors: 0 0 0 1 2 4 8 7
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
