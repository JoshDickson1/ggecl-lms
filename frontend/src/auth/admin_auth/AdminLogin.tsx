import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import PageNotifier from "../PageNotifier";


import { Link } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');`;

const CSS = `
  .al-root * { box-sizing: border-box; }
  .al-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    display: flex; min-height: 100svh; width: 100%;
  }

  @keyframes al-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .al-1 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .05s both; }
  .al-2 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .13s both; }
  .al-3 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .21s both; }
  .al-4 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .29s both; }
  .al-5 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .37s both; }
  .al-6 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .45s both; }
  .al-7 { animation: al-up .55s cubic-bezier(0.22,1,0.36,1) .53s both; }

  /* ── Left panel — authoritative, geometric, no drift images */
  .al-left {
    position: relative;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 48%; flex-shrink: 0;
    overflow: hidden;
    background: #020408;
    padding: 148px 44px;
  }
  @media (min-width: 1024px) { .al-left { display: flex; } }

  /* Deep red orbs */
  .al-orb-1 {
    position: absolute; top: -100px; right: -80px;
    width: 420px; height: 420px; border-radius: 50%;
    background: rgba(220,38,38,0.15); filter: blur(110px);
    pointer-events: none;
  }
  .al-orb-2 {
    position: absolute; bottom: -60px; left: -60px;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(153,27,27,0.10); filter: blur(90px);
    pointer-events: none;
  }
  /* Subtle grid lines */
  .al-left::before {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .al-left::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px; opacity: 0.025;
  }

  /* Shield badge */
  .al-shield-wrap {
    position: relative; z-index: 10;
    display: flex; flex-direction: column; gap: 0;
  }
  .al-shield-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #dc2626, #7f1d1d);
    box-shadow: 0 8px 28px rgba(220,38,38,0.4);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    border: 1px solid rgba(220,38,38,0.3);
  }
  .al-brand-label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing:.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 6px;
  }
  .al-brand-name {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing:.04em;
    text-transform: uppercase; color: rgba(255,255,255,0.55);
  }

  /* Center decorative block */
  .al-center { position: relative; z-index: 10; }

  /* Big geometric accent number */
  .al-bg-num {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(6rem, 10vw, 9rem);
    font-weight: 800; line-height: 1;
    letter-spacing: -0.05em;
    color: rgba(220,38,38,0.06);
    position: absolute; top: -40px; right: -20px;
    pointer-events: none; user-select: none;
    white-space: nowrap;
  }

  .al-headline {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(2.2rem, 3vw, 3.2rem);
    font-weight: 800; line-height: 1.06;
    letter-spacing: -0.03em; color: #fff;
    margin: 0 0 16px;
  }
  .al-headline .red { color: #f87171; }

  .al-sub {
    font-size: 14px; font-weight: 300; line-height: 1.65;
    color: rgba(255,255,255,0.38); max-width: 300px; margin-bottom: 32px;
  }

  /* Access level badges */
  .al-badges { display: flex; flex-direction: column; gap: 10px; }
  .al-badge-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    transition: background .2s;
  }
  .al-badge-row:hover { background: rgba(220,38,38,0.07); border-color: rgba(220,38,38,0.15); }
  .al-badge-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .al-badge-text {
    font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.55);
  }
  .al-badge-text strong { font-weight: 600; color: rgba(255,255,255,0.80); }

  /* Bottom */
  .al-bottom { position: relative; z-index: 10; }
  .al-divider-line { height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 20px; }
  .al-warning {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px; border-radius: 10px;
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.18);
  }
  .al-warning-icon { flex-shrink: 0; margin-top: 1px; }
  .al-warning p {
    font-size: 12px; font-weight: 400; line-height: 1.55;
    color: rgba(255,255,255,0.38); margin: 0;
  }
  .al-warning p strong { color: rgba(248,113,113,0.8); font-weight: 500; }

  /* ── Right panel */
  .al-right {
    flex: 1; display: flex; flex-direction: column;
    justify-content: flex-start; overflow-y: auto;
    background: #ffffff; padding: 150px 64px 60px;
  }
  @media (max-width:1280px) { .al-right { padding: 150px 48px 60px; } }
  @media (max-width:1023px) { .al-right { padding: 180px 24px 48px; } }
  @media (max-width:480px)  { .al-right { padding: 160px 20px 40px; } }
  .dark .al-right { background: #080d1a; }

  .al-form-inner { width: 100%; max-width: 400px; margin: 0 auto; }

  /* Inputs */
  .al-input-wrap { position: relative; }
  .al-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #94a3b8;
  }
  .dark .al-input-icon { color: #475569; }
  .al-input {
    width: 100%; padding: 13px 14px 13px 44px;
    border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.10);
    background: rgba(0,0,0,0.025);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; color: #0f172a; outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  .al-input::placeholder { color: #94a3b8; font-weight: 300; }
  .al-input:focus {
    border-color: rgba(220,38,38,0.45);
    background: rgba(220,38,38,0.025);
    box-shadow: 0 0 0 3px rgba(220,38,38,0.08);
  }
  .dark .al-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: #e2e8f0; }
  .dark .al-input::placeholder { color: #475569; }
  .dark .al-input:focus {
    border-color: rgba(248,113,113,0.45);
    background: rgba(248,113,113,0.05);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.10);
  }

  .al-eye {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 2px;
    color: #94a3b8; transition: color .18s; display: flex; align-items: center;
  }
  .al-eye:hover { color: #475569; }
  .dark .al-eye { color: #475569; }
  .dark .al-eye:hover { color: #7a8499; }

  .al-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 7px; color: #374151; }
  .dark .al-label { color: #94a3b8; }
  .al-err { font-size: 12px; color: #ef4444; margin-top: 4px; }

  /* Submit — red accent for admin */
  .al-submit {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 14px 24px; border-radius: 12px; border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14.5px; font-weight: 600; letter-spacing: -.01em;
    background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
    color: #fff;
    box-shadow: 0 4px 20px rgba(220,38,38,0.38);
    transition: transform .2s cubic-bezier(0.34,1.56,0.64,1), box-shadow .2s ease;
  }
  .al-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(220,38,38,0.52);
  }
  .al-submit:active:not(:disabled) { transform: scale(0.98); }
  .al-submit:disabled { opacity: .55; cursor: not-allowed; }
  .al-submit-arrow {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(255,255,255,0.20);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: transform .2s ease;
  }
  .al-submit:hover .al-submit-arrow { transform: translateX(2px); }

  .al-remember { display: flex; align-items: center; gap: 8px; }
  .al-remember input[type=checkbox] { width: 16px; height: 16px; accent-color: #dc2626; cursor: pointer; }
  .al-remember label { font-size: 13px; font-weight: 400; color: #64748b; cursor: pointer; }
  .dark .al-remember label { color: #475569; }

  .al-footer-note { font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.6; }
  .al-footer-note a { color: #dc2626; text-decoration: none; }
  .al-footer-note a:hover { text-decoration: underline; }
  .dark .al-footer-note { color: #334155; }

  /* ── Form inputs */
  .lg-input-wrap { position: relative; }
  .lg-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #94a3b8;
  }
  .dark .lg-input-icon { color: #475569; }

  .lg-input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,0.10);
    background: rgba(0,0,0,0.025);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; color: #0f172a;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .lg-input::placeholder { color: #94a3b8; font-weight: 300; }
  .lg-input:focus {
    border-color: rgba(26,110,247,0.45);
    background: rgba(26,110,247,0.03);
    box-shadow: 0 0 0 3px rgba(26,110,247,0.10);
  }
  .dark .lg-input {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.08);
    color: #e2e8f0;
  }
  .dark .lg-input::placeholder { color: #475569; }
  .dark .lg-input:focus {
    border-color: rgba(77,155,255,0.45);
    background: rgba(77,155,255,0.06);
    box-shadow: 0 0 0 3px rgba(77,155,255,0.12);
  }

  /* eye toggle */
  .lg-eye {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 2px;
    color: #94a3b8; transition: color 0.18s;
    display: flex; align-items: center;
  }
  .lg-eye:hover { color: #475569; }
  .dark .lg-eye { color: #475569; }
  .dark .lg-eye:hover { color: #7a8499; }

  /* label */
  .lg-label {
    display: block;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13px; font-weight: 500; margin-bottom: 7px;
    color: #374151;
  }
  .dark .lg-label { color: #94a3b8; }

  /* error */
  .lg-err { font-size: 12px; color: #ef4444; margin-top: 4px; }

  /* submit */
  .lg-submit {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 14px 24px; border-radius: 12px;
    border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14.5px; font-weight: 600; letter-spacing: -.01em;
    background: linear-gradient(135deg, #1a6ef7 0%, #0a3ba8 100%);
    color: #fff;
    box-shadow: 0 4px 20px rgba(26,110,247,0.38);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .lg-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(26,110,247,0.52);
  }
  .lg-submit:active:not(:disabled) { transform: scale(0.98); }
  .lg-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .lg-submit-arrow {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(255,255,255,0.20);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .lg-submit:hover .lg-submit-arrow { transform: translateX(2px); }

  /* remember */
  .lg-remember { display: flex; align-items: center; gap: 8px; }
  .lg-remember input[type=checkbox] {
    width: 16px; height: 16px; border-radius: 5px;
    accent-color: #1a6ef7; cursor: pointer;
  }
  .lg-remember label {
    font-size: 13px; font-weight: 400; color: #64748b; cursor: pointer; select: none;
  }
  .dark .lg-remember label { color: #475569; }

  /* footer note */
  .lg-footer-note {
    font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.6;
  }
  .lg-footer-note a { color: #1a6ef7; text-decoration: none; }
  .lg-footer-note a:hover { text-decoration: underline; }
  .dark .lg-footer-note { color: #334155; }

`;

function LeftPanel() {
    return (
        <div className="al-left">
            <div className="al-orb-1" /><div className="al-orb-2" />

            {/* Top: shield + brand */}
            <div className="al-shield-wrap">
                <div className="al-shield-icon">
                    <Shield size={26} color="white" strokeWidth={1.8} />
                </div>
                <div className="al-brand-label">Restricted Access</div>
                <div className="al-brand-name">GGECL Admin Portal</div>
            </div>

            {/* Centre: headline + access list */}
            <div className="al-center">
                <div className="al-bg-num">ADM</div>
                <h2 className="al-headline">
                    Full<br /><span className="red">Control.</span>
                </h2>
                <p className="al-sub">
                    The GGECL admin portal gives you complete oversight of instructors, students, content, and platform settings.
                </p>

                <div className="al-badges">
                    {[
                        { color: "#dc2626", label: "Instructor Management", detail: "Approve, suspend, monitor" },
                        { color: "#f59e0b", label: "Student Oversight", detail: "Enroll, track, support" },
                        { color: "#3b82f6", label: "Content Control", detail: "Courses, modules, media" },
                        { color: "#10b981", label: "Analytics & Reports", detail: "Real-time platform data" },
                    ].map((b) => (
                        <div key={b.label} className="al-badge-row">
                            <div className="al-badge-dot" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}66` }} />
                            <span className="al-badge-text">
                                <strong>{b.label}</strong> — {b.detail}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom: warning */}
            <div className="al-bottom">
                <div className="al-divider-line" />
                <div className="al-warning">
                    <div className="al-warning-icon">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1L13 12H1L7 1Z" stroke="#f87171" strokeWidth="1.4" strokeLinejoin="round" />
                            <path d="M7 5.5V8" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round" />
                            <circle cx="7" cy="10" r=".7" fill="#f87171" />
                        </svg>
                    </div>
                    <p><strong>Restricted area.</strong> Unauthorized access attempts are logged and reported. Admin credentials are strictly confidential.</p>
                </div>
            </div>
        </div>
    );
}

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <style>{FONTS + CSS}</style>
            <div className="al-root">
                <LeftPanel />

                <div className="al-right">
                    <div className="al-form-inner">

                        {/* Header */}
                        <div className="al-1" style={{ marginBottom: 28 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                    background: "linear-gradient(135deg,#dc2626,#7f1d1d)",
                                    boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Shield size={16} color="white" strokeWidth={1.8} />
                                </div>
                                <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#991b1b", fontFamily: "'DM Sans',sans-serif" }}>
                                    Admin Portal
                                </span>
                            </div>
                            <h1 style={{
                                fontFamily: "'Syne',system-ui,sans-serif",
                                fontSize: "clamp(1.8rem,3vw,2.4rem)",
                                fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
                                marginBottom: 8, color: "inherit",
                            }}>
                                Admin Access
                            </h1>
                            <p style={{ fontSize: 14, fontWeight: 300, color: "#64748b", lineHeight: 1.5 }}>
                                Login to manage instructors, students, and platform settings.
                            </p>
                        </div>
                        {/* Form */}
                        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Email */}
                            <div className="lg-2"> 
                                <label className="lg-label">Email address</label>
                                <div className="lg-input-wrap">
                                    <Mail className="lg-input-icon" size={15} />
                                    <input
                                        placeholder="you@example.com"
                                        className="lg-input"
                                        type="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="lg-3">
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                                    <label className="lg-label">Password</label>
                                    <Link
                                        to="/forgotten-password"
                                        style={{ fontSize: 12, color: "red", fontWeight: 500, textDecoration: "none" }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="lg-input-wrap">
                                    <Lock className="lg-input-icon" size={15} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="lg-input"
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        className="lg-eye"
                                        onClick={() => setShowPassword(p => !p)}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="al-4 al-remember">
                                <input type="checkbox" id="al-remember" />
                                <label htmlFor="al-remember">Remember me on this device</label>
                            </div>

                            <div className="al-5">
                                <button type="submit" className="al-submit">
                                    Access Dashboard
                                </button>
                            </div>
                        </form>

                        {/* Security notice */}
                        <div className="al-6" style={{ marginTop: 24 }}>
                            <div style={{
                                display: "flex", alignItems: "flex-start", gap: 10,
                                padding: "12px 14px", borderRadius: 10,
                                background: "rgba(220,38,38,0.05)",
                                border: "1px solid rgba(220,38,38,0.12)",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <path d="M7 1L13 12H1L7 1Z" stroke="#dc2626" strokeWidth="1.4" strokeLinejoin="round" />
                                    <path d="M7 5.5V8" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
                                    <circle cx="7" cy="10" r=".7" fill="#dc2626" />
                                </svg>
                                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55, margin: 0 }}>
                                    This is a restricted area. All login attempts are monitored and logged for security purposes.
                                </p>
                            </div>
                        </div>

                        <p className="al-footer-note" style={{ marginTop: 20 }}>
                            By signing in you agree to GGECL's{" "}
                            <a href="https://ggecl.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                        </p>
                    </div>
                </div>
            </div>
            <PageNotifier variant="admin" />
        </>
    );
};

export default AdminLogin;