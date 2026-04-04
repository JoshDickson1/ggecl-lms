import { useNavigate } from "react-router";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  @keyframes nf-float {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50%      { transform: translateY(-14px) rotate(2deg); }
  }
  @keyframes nf-fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes nf-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes nf-pulse-ring {
    0%   { transform: scale(1);   opacity:.4; }
    100% { transform: scale(1.55); opacity:0; }
  }
  @keyframes nf-blink {
    0%,100% { opacity:1; } 50% { opacity:0.35; }
  }

  .nf-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    min-height: 100svh;
    padding-top: 80px;
    display: flex; align-items: center; justify-content: center;
    background: #f8faff;
    position: relative; overflow: hidden;
    transition: background 0.35s ease;
  }
  .dark .nf-root { background: #080d1a; }

  /* Orbs */
  .nf-orb-1 {
    position: absolute; top: -100px; left: -80px;
    width: 420px; height: 420px; border-radius: 50%;
    background: rgba(26,110,247,0.10); filter: blur(110px);
    pointer-events: none;
  }
  .nf-orb-2 {
    position: absolute; bottom: -80px; right: -60px;
    width: 340px; height: 340px; border-radius: 50%;
    background: rgba(77,155,255,0.07); filter: blur(90px);
    pointer-events: none;
  }
  .dark .nf-orb-1 { background: rgba(26,110,247,0.16); }
  .dark .nf-orb-2 { background: rgba(77,155,255,0.10); }

  /* dot grid */
  .nf-root::before {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle, rgba(26,110,247,0.07) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }
  .dark .nf-root::before {
    background-image: radial-gradient(circle, rgba(77,155,255,0.09) 1px, transparent 1px);
  }

  /* Content */
  .nf-content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 40px 24px;
    max-width: 520px;
  }

  /* 404 graphic */
  .nf-graphic {
    position: relative; margin-bottom: 36px;
    animation: nf-float 5s ease-in-out infinite;
  }

  /* Spinning orbit ring */
  .nf-ring {
    position: absolute; inset: -18px; border-radius: 50%;
    border: 1.5px dashed rgba(26,110,247,0.25);
    animation: nf-spin-slow 12s linear infinite;
  }
  .dark .nf-ring { border-color: rgba(77,155,255,0.20); }

  /* Pulse rings */
  .nf-pulse {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(26,110,247,0.3);
    animation: nf-pulse-ring 2.2s ease-out infinite;
  }
  .nf-pulse-2 {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(26,110,247,0.2);
    animation: nf-pulse-ring 2.2s ease-out infinite 0.9s;
  }

  .nf-num-wrap {
    width: 160px; height: 160px; border-radius: 50%;
    background: linear-gradient(145deg, #1a6ef7 0%, #0a3ba8 100%);
    box-shadow:
      0 20px 60px rgba(26,110,247,0.45),
      0 4px 16px rgba(0,0,0,0.12),
      0 0 0 8px rgba(26,110,247,0.08);
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }

  .nf-num {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 3.6rem; font-weight: 800;
    letter-spacing: -0.04em; color: #fff; line-height: 1;
  }

  /* Little blinking dot on 404 */
  .nf-num-dot {
    position: absolute; top: 14px; right: 14px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #60a5fa;
    animation: nf-blink 2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(96,165,250,0.7);
  }

  /* Text */
  .nf-headline {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
    color: #111827; margin: 0 0 10px;
    animation: nf-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }
  .dark .nf-headline { color: #f0f6ff; }
  .nf-headline .accent {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .dark .nf-headline .accent {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text; background-clip: text;
  }

  .nf-body {
    font-size: 14.5px; font-weight: 300; line-height: 1.65;
    color: #6b7280; max-width: 360px; margin-bottom: 32px;
    animation: nf-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both;
  }
  .dark .nf-body { color: #7a8499; }

  /* Buttons */
  .nf-btns {
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    animation: nf-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both;
  }

  .nf-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 24px; border-radius: 999px; border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; font-weight: 600; color: #fff;
    background: linear-gradient(135deg, #1a6ef7 0%, #0a3ba8 100%);
    box-shadow: 0 4px 20px rgba(26,110,247,0.40);
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
  }
  .nf-btn-primary:hover {
    transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,110,247,0.55);
  }
  .nf-btn-primary:active { transform: scale(0.97); }

  .nf-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 999px; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; font-weight: 500;
    border: 1.5px solid rgba(0,0,0,0.10); background: transparent;
    color: #374151;
    transition: all 0.22s ease;
  }
  .nf-btn-ghost:hover {
    background: rgba(26,110,247,0.07); border-color: rgba(26,110,247,0.28); color: #1a6ef7;
  }
  .nf-btn-ghost:active { transform: scale(0.97); }
  .dark .nf-btn-ghost { border-color: rgba(255,255,255,0.10); color: #94a3b8; }
  .dark .nf-btn-ghost:hover {
    background: rgba(77,155,255,0.08); border-color: rgba(77,155,255,0.28); color: #4d9bff;
  }

  /* Footer hint */
  .nf-hint {
    margin-top: 28px; font-size: 12px; font-weight: 300; color: #9ca3af;
    animation: nf-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.42s both;
  }
  .dark .nf-hint { color: #475569; }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{CSS}</style>
      <div className="nf-root">
        <div className="nf-orb-1" />
        <div className="nf-orb-2" />

        <div className="nf-content">

          {/* Graphic */}
          <div className="nf-graphic">
            <div className="nf-pulse" />
            <div className="nf-pulse-2" />
            <div className="nf-ring" />
            <div className="nf-num-wrap">
              <div className="nf-num-dot" />
              <span className="nf-num">404</span>
            </div>
          </div>

          {/* Text */}
          <h1 className="nf-headline">
            Page <span className="accent">not found</span>
          </h1>
          <p className="nf-body">
            The page you're looking for doesn't exist, was moved, or the link is broken.
            Let's get you back on track.
          </p>

          {/* Buttons */}
          <div className="nf-btns">
            <button className="nf-btn-primary" onClick={() => navigate("/")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 7H10V13H4V7H1L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Go Home
            </button>
            <button className="nf-btn-ghost" onClick={() => navigate(-1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L3 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Go Back
            </button>
          </div>

          <p className="nf-hint">Error 404 · GGECL Learning Platform</p>
        </div>
      </div>
    </>
  );
};

export default NotFound;