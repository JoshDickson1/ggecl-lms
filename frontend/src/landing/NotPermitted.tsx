import { useNavigate } from "react-router";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes nf-float {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50% { transform: translateY(-14px) rotate(2deg); }
  }
  @keyframes nf-fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes nf-shield-pulse {
    0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35); }
    100% { box-shadow: 0 0 0 22px rgba(239,68,68,0); }
  }

  .nf-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    min-height: 100svh;
    padding: 32px;
    display: flex; align-items: center; justify-content: center;
    background: #f8faff;
    position: relative; overflow: hidden;
  }
  .dark .nf-root { background: #080d1a; }

  .nf-content {
    position: relative;
    z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    max-width: 620px;
  }

  .nf-graphic {
    margin-bottom: 28px;
    animation: nf-float 5s ease-in-out infinite;
  }

  .nf-lock {
    width: 150px; height: 150px; border-radius: 32px;
    display:flex; align-items:center; justify-content:center;
    background: linear-gradient(145deg, #ef4444 0%, #991b1b 100%);
    color: white;
    animation: nf-shield-pulse 2s infinite;
    box-shadow: 0 20px 60px rgba(239,68,68,0.35);
  }

  .nf-headline {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 800;
    color: #111827;
    margin: 0 0 10px;
    animation: nf-fadeUp .6s ease both;
  }
  .dark .nf-headline { color: #f0f6ff; }

  .nf-body {
    font-size: 15px;
    line-height: 1.7;
    color: #6b7280;
    max-width: 460px;
    margin-bottom: 28px;
  }
  .dark .nf-body { color: #94a3b8; }

  .nf-btns {
    display:flex; gap:12px; flex-wrap:wrap; justify-content:center;
  }

  .nf-btn {
    padding: 12px 20px;
    border-radius: 999px;
    border:none;
    cursor:pointer;
    font-size:14px;
    font-weight:600;
    color:white;
    background: linear-gradient(135deg, #1a6ef7 0%, #0a3ba8 100%);
  }

  .nf-hint {
    margin-top: 20px;
    font-size: 12px;
    color: #9ca3af;
  }
`;

export default function NotPermitted(){
    const navigate = useNavigate()

  return (
    <>
      <style>{CSS}</style>
      <div className="nf-root">
        <div className="nf-content">
          <div className="nf-graphic">
            <div className="nf-lock">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="15" r="1.5" fill="white"/>
              </svg>
            </div>
          </div>

          <h1 className="nf-headline">Access Not Permitted</h1>
          <p className="nf-body">
            You do not have permission to access this page. This route is restricted based on your dashboard role.
            Return to your workspace to continue.
          </p>

          <div className="nf-btns">
            <button className="nf-btn" onClick={() => navigate("/")}>
            back to Homepage
            </button>
            <button className="nf-btn" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>

          <p className="nf-hint">403 · Unauthorized Route Access</p>
        </div>
      </div>
    </>
  );
}
