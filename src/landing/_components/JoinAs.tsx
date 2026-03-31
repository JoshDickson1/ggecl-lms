import React from "react";
import teacherImg from "@/assets/Asset3.png";
import studentImg from "@/assets/Asset2.png";

/* ── CSS — matches the Courses section design tokens exactly ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1);   }
    50%       { opacity: .5; transform: scale(1.4); }
  }
  @keyframes ja-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ja-section {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #ffffff;
    padding: 96px 28px;
    transition: background 0.3s ease, color 0.3s ease;
  }
  .dark .ja-section { background: #080d1a; }

  .ja-inner {
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 80px;
  }

  .ja-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  @media (max-width: 900px) {
    .ja-row {
      grid-template-columns: 1fr;
      gap: 36px;
    }
    .ja-row.reverse { direction: ltr; }
  }
  .ja-row.reverse { direction: rtl; }
  .ja-row.reverse > * { direction: ltr; }

  .ja-img-wrap {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
  }

  .ja-img-card {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
    border: 1px solid rgba(26,110,247,0.10);
    box-shadow:
      0 20px 60px rgba(26,110,247,0.10),
      0 4px 16px rgba(0,0,0,0.06);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
    padding: 32px 32px 0;
  }
  .ja-img-card:hover {
    transform: translateY(-6px);
    box-shadow:
      0 32px 72px rgba(26,110,247,0.16),
      0 8px 24px rgba(0,0,0,0.08);
  }
  .dark .ja-img-card {
    background: linear-gradient(135deg, #0d1a35 0%, #0a1228 100%);
    border-color: rgba(77,155,255,0.12);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.4),
      0 4px 16px rgba(0,0,0,0.3);
  }
  .dark .ja-img-card:hover {
    box-shadow:
      0 32px 72px rgba(77,155,255,0.14),
      0 8px 24px rgba(0,0,0,0.4);
  }

  .ja-img-card img {
    display: block;
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    object-fit: contain;
    position: relative;
    bottom: -4px;
    filter: drop-shadow(0 8px 24px rgba(26,110,247,0.18));
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .ja-img-card:hover img {
    transform: translateY(-4px) scale(1.02);
  }

  .ja-badge {
    position: absolute;
    top: 20px; right: -14px;
    background: linear-gradient(135deg, #1a6ef7, #0a3ba8);
    color: #fff;
    border-radius: 999px;
    padding: 6px 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
    box-shadow: 0 4px 16px rgba(26,110,247,0.42);
    white-space: nowrap;
    z-index: 2;
    display: flex; align-items: center; gap: 6px;
  }
  .ja-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.6);
    animation: pulseDot 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .ja-copy {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ja-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    margin-bottom: 16px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    padding: 4px 12px 4px 8px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11.5px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase;
    color: #2563eb;
    width: fit-content;
  }
  .dark .ja-eyebrow {
    background: rgba(37,99,235,0.12);
    border-color: rgba(37,99,235,0.25);
    color: #60a5fa;
  }
  .ja-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #2563eb;
    animation: pulseDot 2s ease-in-out infinite;
    flex-shrink: 0;
  }
  .dark .ja-eyebrow-dot { background: #60a5fa; }

  .ja-heading {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(1.9rem, 3.2vw, 2.75rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #111827;
    margin: 0 0 16px;
  }
  .dark .ja-heading { color: #f0f6ff; }

  .ja-heading .accent {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .dark .ja-heading .accent {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .ja-body {
    font-size: 15px; font-weight: 300; line-height: 1.7;
    color: #6b7280;
    margin-bottom: 28px; max-width: 440px;
  }
  .dark .ja-body { color: #94a3b8; }

  .ja-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 32px;
  }
  .ja-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    font-size: 12px; font-weight: 500; color: #0369a1;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .dark .ja-chip {
    background: rgba(14,165,233,0.08);
    border-color: rgba(14,165,233,0.18);
    color: #38bdf8;
  }

  .ja-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 13px 24px;
    border-radius: 999px;
    border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: -.01em;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    box-shadow: 0 4px 18px rgba(26,110,247,0.38);
    transition:
      transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
      box-shadow 0.22s ease,
      background 0.22s ease;
    width: fit-content;
  }
  .ja-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(26,110,247,0.52);
    background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  }
  .ja-btn:active { transform: scale(0.97); }

  .ja-btn-arrow {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(255,255,255,0.22);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .ja-btn:hover .ja-btn-arrow { transform: translateX(3px); }

  .ja-divider {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(26,110,247,0.12), transparent);
  }
  .dark .ja-divider {
    background: linear-gradient(90deg, transparent, rgba(77,155,255,0.10), transparent);
  }
`;

/* ── Shared row layout ── */
type RowProps = {
  img: string;
  imgAlt: string;
  badgeLabel: string;
  eyebrow: string;
  headingPre: string;
  headingAccent: string;
  headingPost?: string;
  body: string;
  chips: string[];
  btnLabel: string;
  btnIcon: React.ReactNode;
  onBtnClick: () => void;
  reverse?: boolean;
};

function JoinRow({
  img, imgAlt, badgeLabel,
  eyebrow, headingPre, headingAccent, headingPost,
  body, chips, btnLabel, btnIcon, onBtnClick,
  reverse,
}: RowProps) {
  return (
    <div className={`ja-row${reverse ? " reverse" : ""}`}>
      <div className="ja-img-wrap">
        <div className="ja-img-card">
          <img src={img} alt={imgAlt} />
        </div>
        <div className="ja-badge">
          <span className="ja-badge-dot" />
          {badgeLabel}
        </div>
      </div>

      <div className="ja-copy">
        <span className="ja-eyebrow">
          <span className="ja-eyebrow-dot" />
          {eyebrow}
        </span>

        <h2 className="ja-heading">
          {headingPre}{" "}
          <span className="accent">{headingAccent}</span>
          {headingPost && <> {headingPost}</>}
        </h2>

        <p className="ja-body">{body}</p>

        <div className="ja-chips">
          {chips.map((c) => (
            <span key={c} className="ja-chip">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {c}
            </span>
          ))}
        </div>

        <button className="ja-btn" onClick={onBtnClick}>
          {btnLabel}
          <span className="ja-btn-arrow">{btnIcon}</span>
        </button>
      </div>
    </div>
  );
}

/* ── Main component ── */
function JoinAs() {
  const navigate = useCustomNavigate();

  const ArrowIcon = (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6H10M6 2L10 6L6 10" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{CSS}</style>
      <section className="ja-section">
        <div className="ja-inner">

          <JoinRow
            img={teacherImg}
            imgAlt="Become an Instructor"
            badgeLabel="Now accepting instructors"
            eyebrow="Teach the world"
            headingPre="Become an"
            headingAccent="Instructor"
            body="Empower learners globally by sharing your expertise. Access advanced teaching tools, track student progress, and build a reputation in a thriving educational community."
            chips={["Advanced teaching tools", "Revenue sharing", "Global reach", "Analytics dashboard"]}
            btnLabel="Start Teaching Today"
            btnIcon={ArrowIcon}
            onBtnClick={() => navigate("/instructor/login")}
          />

          <div className="ja-divider" />

          <JoinRow
            img={studentImg}
            imgAlt="Enroll as a Student"
            badgeLabel="500+ students enrolled"
            eyebrow="Learn at your pace"
            headingPre="Enroll as a"
            headingAccent="Student"
            body="Access insights from industry leaders and world-class educational content. Master essential skills, earn certificates, and advance your career — at your own pace."
            chips={["Expert instructors", "Lifetime access", "Certificates", "Community support"]}
            btnLabel="Begin Your Learning Journey"
            btnIcon={ArrowIcon}
            onBtnClick={() => navigate("/login")}
            reverse
          />

        </div>
      </section>
    </>
  );
}

export default JoinAs;

/* ── Custom navigate hook (fixed) ── */
function useCustomNavigate(): (path: string) => void {
  // Replace with React Router's useNavigate if available
  return (path: string) => {
    window.location.href = path;
  };
}