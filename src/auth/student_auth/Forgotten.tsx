import { Mail, ArrowRight } from "lucide-react";

import { Link } from "react-router-dom";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');`;

const CSS = `
  /* ── Base */
  .lg-root * { box-sizing: border-box; }
  .lg-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    display: flex;
    min-height: 100svh;
    width: 100%;
  }

  /* ── Stagger entrances */
  @keyframes lg-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lg-1 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .05s both; }
  .lg-2 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .13s both; }
  .lg-3 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .21s both; }
  .lg-4 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .29s both; }
  .lg-5 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .37s both; }
  .lg-6 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .45s both; }
  .lg-7 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .53s both; }
  .lg-8 { animation: lg-up .55s cubic-bezier(0.22,1,0.36,1) .61s both; }

  /* ── Left panel */
  .lg-left {
    position: relative;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 52%;
    flex-shrink: 0;
    overflow: hidden;
    background: #06091a;
    padding: 160px 40px 36px;
  }
  @media (min-width: 1024px) { .lg-left { display: flex; } }

  /* Gradient orbs */
  .lg-orb-1 {
    position: absolute; top: -120px; right: -100px;
    width: 480px; height: 480px; border-radius: 50%;
    background: rgba(26,110,247,0.18); filter: blur(110px);
    pointer-events: none;
  }
  .lg-orb-2 {
    position: absolute; bottom: -80px; left: -80px;
    width: 360px; height: 360px; border-radius: 50%;
    background: rgba(77,155,255,0.10); filter: blur(90px);
    pointer-events: none;
  }

  /* Grain */
  .lg-left::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px; opacity: 0.030;
  }

  /* Brand chip */
  .lg-chip {
    position: relative; z-index: 10;
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 999px; padding: 6px 14px 6px 8px;
    width: fit-content;
    margin-bottom: 24px;
  }
  .lg-chip-dot {
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, #4d9bff, #1a6ef7);
    display: flex; align-items: center; justify-content: center;
  }
  .lg-chip span {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11.5px; font-weight: 500; letter-spacing: .06em;
    text-transform: uppercase; color: rgba(255,255,255,0.7);
  }

  /* ── Pinterest drift columns ── */
  .lg-mosaic {
    position: relative; z-index: 10;
    flex: none;
    height: 320px; 
    display: flex;
    align-items: stretch;
    gap: 10px;
    margin: 20px 0;
    overflow: hidden;
    border-radius: 20px;
    /* top/bottom fade masks */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  }

  @keyframes driftUp   { from { transform: translateY(0); }    to { transform: translateY(-50%); } }
  @keyframes driftDown { from { transform: translateY(-50%); } to { transform: translateY(0); } }

  .lg-col {
    flex: 1;
    display: flex; flex-direction: column; gap: 10px;
    will-change: transform;
  }
  /* alternating directions for depth */
  .lg-col-0 { animation: driftUp   30s linear infinite; }
  .lg-col-1 { animation: driftDown 24s linear infinite; margin-top: 40px; }
  .lg-col-2 { animation: driftUp   36s linear infinite; margin-top: -30px; }

  .lg-img-card {
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .lg-img-card img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Varying card heights for each column */
  .lg-col-0 .lg-img-card:nth-child(3n+1) { height: 130px; }
  .lg-col-0 .lg-img-card:nth-child(3n+2) { height: 100px; }
  .lg-col-0 .lg-img-card:nth-child(3n+3) { height: 150px; }
  .lg-col-1 .lg-img-card:nth-child(3n+1) { height: 115px; }
  .lg-col-1 .lg-img-card:nth-child(3n+2) { height: 160px; }
  .lg-col-1 .lg-img-card:nth-child(3n+3) { height: 95px; }
  .lg-col-2 .lg-img-card:nth-child(3n+1) { height: 140px; }
  .lg-col-2 .lg-img-card:nth-child(3n+2) { height: 105px; }
  .lg-col-2 .lg-img-card:nth-child(3n+3) { height: 130px; }

  /* ── Copy below mosaic */
  .lg-copy { position: relative; z-index: 10; }
  .lg-headline {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(2rem, 2.6vw, 2.8rem);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -0.03em; color: #fff; margin: 0 0 12px;
  }
  .lg-headline .blue { color: #4d9bff; }
  .lg-sub {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; font-weight: 300; line-height: 1.65;
    color: rgba(255,255,255,0.45); max-width: 340px;
    margin-bottom: 24px;
  }
  .lg-stats { display: flex; gap: 28px; }
  .lg-stat-n {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 1.4rem; font-weight: 800; color: #fff;
    letter-spacing: -0.03em; line-height: 1;
  }
  .lg-stat-n em { color: #4d9bff; font-style: normal; }
  .lg-stat-l {
    font-size: 11px; font-weight: 400; letter-spacing: .06em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-top: 2px;
  }

  /* Quote */
  .lg-quote {
    position: relative; z-index: 10;
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 20px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .lg-quote p { font-size: 13px; font-style: italic; font-weight: 300; color: rgba(255,255,255,0.35); line-height: 1.6; }
  .lg-quote cite { display: block; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.2); margin-top: 6px; letter-spacing: .06em; text-transform: uppercase; font-style: normal; }

  /* ── Right panel (form side) */
  .lg-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;    /* align to top so padding controls position */
    overflow-y: auto;
    background: #ffffff;
    padding: 170px 64px 60px;       /* 100px top on desktop */
  }
  @media (max-width: 1280px) { .lg-right { padding: 100px 48px 60px; } }
  @media (max-width: 1023px) { .lg-right { padding: 150px 24px 48px; } }
  @media (max-width: 480px)  { .lg-right { padding: 150px 20px 10px; } }

  /* dark mode right panel */
  .dark .lg-right { background: #080d1a; }

  .lg-form-inner { width: 100%; max-width: 400px; margin: 0 auto; }

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

  /* no-account link */
  .lg-no-account {
    text-align: center;
    font-size: 13px; color: #64748b;
  }
  .dark .lg-no-account { color: #475569; }
  .lg-no-account a { color: #1a6ef7; font-weight: 600; text-decoration: none; }
  .lg-no-account a:hover { text-decoration: underline; }
`;

/* ── Image sets for drift columns ─────────────────────── */
const COL_IMAGES = [
    [
        { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&q=80", alt: "Students collaborating" },
        { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=320&q=80", alt: "Online class" },
        { src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=320&q=80", alt: "Coding" },
    ],
    [
        { src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&q=80", alt: "Student studying" },
        { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=320&q=80", alt: "Group study" },
        { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=320&q=80", alt: "Lecture hall" },
    ],
    [
        { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=320&q=80", alt: "Learning" },
        { src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=320&q=80", alt: "Writing notes" },
        { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=320&q=80", alt: "Classroom" },
    ],
];

/* ── Left Panel ─────────────────────────────────────────── */
function LeftPanel() {
    return (
        <div className="lg-left pt-30">
            <div className="lg-orb-1" />
            <div className="lg-orb-2" />

            {/* Brand chip */}
            <div className="lg-chip">
                <div className="lg-chip-dot">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1L6.2 3.8L9 4.2L7 6.2L7.5 9L5 7.6L2.5 9L3 6.2L1 4.2L3.8 3.8Z" fill="white" />
                    </svg>
                </div>
                <span>GGECL · Learning Platform</span>
            </div>

            {/* ── Pinterest drift mosaic */}
            <div className="lg-mosaic">
                {COL_IMAGES.map((images, colIdx) => {
                    const doubled = [...images, ...images];
                    return (
                        <div key={colIdx} className={`lg-col lg-col-${colIdx}`}>
                            {doubled.map((img, i) => (
                                <div key={i} className="lg-img-card">
                                    <img src={img.src} alt={img.alt} loading={i < 3 ? "eager" : "lazy"} />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Copy */}
            <div className="lg-copy">
                <h2 className="lg-headline">
                    Learn without<br />
                    <span className="blue">limits.</span>
                </h2>
                <p className="lg-sub">
                    Join thousands of students already building their future on GGECL — world-class courses, expert instructors, zero excuses.
                </p>
                <div className="lg-stats">
                    {[["500+", "Students"], ["25+", "Courses"], ["94%", "Completion"]].map(([n, l]) => (
                        <div key={l}>
                            <div className="lg-stat-n">{n.replace("+", "")}<em>{n.includes("+") ? "+" : "%"}</em></div>
                            <div className="lg-stat-l">{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quote */}
            <div className="lg-quote">
                <p>"Education is the most powerful weapon which you can use to change the world."</p>
                <cite>— Nelson Mandela</cite>
            </div>
        </div>
    );
}


const Forgotten = () => {

    return (
        <>
            <style>{FONTS + CSS}</style>

            <div className="lg-root">

                {/* ── Left decorative panel */}
                <LeftPanel />

                {/* ── Right: form */}
                <div className="lg-right">
                    <div className="lg-form-inner">

                        {/* Header */}
                        <div className="lg-1" style={{ marginBottom: 28 }}>
                            <h1 style={{
                                fontFamily: "'Syne', system-ui, sans-serif",
                                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                lineHeight: 1.1,
                                marginBottom: 8,
                                color: "inherit",
                            }}>
                                Forgot your <span className="text-blue-500">password</span>?
                            </h1>
                            <p style={{ fontSize: 14, fontWeight: 300, color: "#64748b", lineHeight: 1.5 }}>
                                Enter your email to reset your password and get back to learning.
                            </p>
                        </div>

                        <>
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

                                {/* Submit */}
                                <div className="lg-5">
                                    <button type="submit" className="lg-submit">
                                        Send reset link
                                        <span className="lg-submit-arrow"><ArrowRight size={9} /></span>
                                    </button>
                                </div>
                            </form>
                        </>

                        {/* Instructor link */}
                        <p className="il-8 text-center text-[13px] text-slate-500 mt-[22px]">
                            Are you an Instructor?{" "}
                            <Link to="/instructor/login" className="text-amber-500 font-semibold no-underline hover:underline">
                                Login here
                            </Link>
                        </p>

                        {/* Footer note */}
                        <p className="text-[11.5px] text-slate-400 text-center leading-relaxed mt-4">
                            By signing in you agree to GGECL's{" "}
                            <a href="https://ggecl.com/terms" target="_blank" rel="noopener noreferrer" className="text-amber-500 no-underline hover:underline">
                                Terms of Service
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Forgotten;