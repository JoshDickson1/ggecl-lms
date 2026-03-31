import f1 from "@/assets/Asset3.png";
import { Star, Users, BookOpen, Globe, Briefcase, Mail, Award, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes ip-fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ip-fadeRight {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes ip-scaleIn {
    from { opacity:0; transform:scale(0.94); }
    to   { opacity:1; transform:scale(1); }
  }

  /* ── Page */
  .ip-page {
    font-family: 'DM Sans', system-ui, sans-serif;
    min-height: 100vh;
    background: #f8faff;
    transition: background 0.35s ease;
    position: relative;
    overflow-x: hidden;
    padding-top: 70px; 
  }
  .dark .ip-page { background: #080d1a; }

  /* Orbs */
  .ip-orb-1 {
    position: absolute; top: -80px; right: -60px;
    width: 440px; height: 440px; border-radius: 50%;
    background: rgba(26,110,247,0.08); filter: blur(110px);
    pointer-events: none; z-index: 0;
  }
  .ip-orb-2 {
    position: absolute; bottom: 200px; left: -80px;
    width: 340px; height: 340px; border-radius: 50%;
    background: rgba(26,110,247,0.05); filter: blur(90px);
    pointer-events: none; z-index: 0;
  }
  .dark .ip-orb-1 { background: rgba(26,110,247,0.13); }
  .dark .ip-orb-2 { background: rgba(77,155,255,0.08); }

  /* ── Hero band */
  .ip-hero {
    position: relative; z-index: 1;
    padding: 56px 28px 0;
    max-width: 1120px; margin: 0 auto;
  }
  @media (max-width: 640px) { .ip-hero { padding: 40px 20px 0; } }

  /* Breadcrumb */
  .ip-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 400; color: #94a3b8;
    margin-bottom: 32px;
    animation: ip-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .dark .ip-breadcrumb { color: #475569; }
  .ip-breadcrumb a { color: #1a6ef7; text-decoration: none; font-weight: 500; }
  .dark .ip-breadcrumb a { color: #4d9bff; }
  .ip-breadcrumb a:hover { text-decoration: underline; }
  .ip-breadcrumb-sep { opacity: 0.4; }

  /* Hero grid */
  .ip-hero-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 40px;
    align-items: flex-start;
  }
  @media (max-width: 700px) {
    .ip-hero-grid { grid-template-columns: 1fr; gap: 24px; }
  }

  /* Avatar */
  .ip-avatar-col { animation: ip-scaleIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .ip-avatar-wrap {
    position: relative; width: 160px; height: 160px;
  }
  @media (max-width: 700px) { .ip-avatar-wrap { width: 120px; height: 120px; } }

  .ip-avatar {
    width: 100%; height: 100%; border-radius: 28px;
    object-fit: cover; object-position: top;
    border: 3px solid rgba(26,110,247,0.22);
    box-shadow: 0 8px 32px rgba(26,110,247,0.18), 0 2px 8px rgba(0,0,0,0.10);
    display: block;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .ip-avatar-wrap:hover .ip-avatar { transform: scale(1.03); }

  /* Online dot */
  .ip-online {
    position: absolute; bottom: 10px; right: 10px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #22c55e;
    border: 2.5px solid #f8faff;
    box-shadow: 0 0 8px rgba(34,197,94,0.5);
  }
  .dark .ip-online { border-color: #080d1a; }

  /* Copy col */
  .ip-copy-col { animation: ip-fadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both; }

  /* Eyebrow */
  .ip-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    margin-bottom: 12px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 999px; padding: 3px 12px 3px 8px;
    font-size: 11px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase; color: #2563eb;
    width: fit-content;
  }
  .dark .ip-eyebrow { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.25); color: #60a5fa; }
  .ip-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%; background: #2563eb;
    animation: pulseDot 2s ease-in-out infinite; flex-shrink: 0;
  }
  .dark .ip-eyebrow-dot { background: #60a5fa; }

  /* Name */
  .ip-name {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 3rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.06;
    color: #111827; margin: 0 0 8px;
  }
  .dark .ip-name { color: #f0f6ff; }

  /* Role */
  .ip-role {
    font-size: 15px; font-weight: 300; color: #6b7280; margin-bottom: 20px;
  }
  .dark .ip-role { color: #94a3b8; }

  /* Stats row */
  .ip-stats {
    display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;
  }
  .ip-stat {
    display: flex; align-items: center; gap: 8px;
  }
  .ip-stat-icon-wrap {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    background: rgba(26,110,247,0.10);
    border: 1px solid rgba(26,110,247,0.18);
    display: flex; align-items: center; justify-content: center;
    color: #1a6ef7;
  }
  .dark .ip-stat-icon-wrap { background: rgba(77,155,255,0.10); border-color: rgba(77,155,255,0.18); color: #4d9bff; }
  .ip-stat-n {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; color: #111827; line-height: 1;
  }
  .dark .ip-stat-n { color: #f0f6ff; }
  .ip-stat-l { font-size: 11.5px; font-weight: 300; color: #9ca3af; margin-top: 1px; }

  /* Action buttons */
  .ip-actions { display: flex; flex-wrap: wrap; gap: 10px; }

  .ip-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 999px; border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13.5px; font-weight: 600; color: #fff;
    background: linear-gradient(135deg, #1a6ef7 0%, #0a3ba8 100%);
    box-shadow: 0 4px 18px rgba(26,110,247,0.38);
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
    text-decoration: none;
  }
  .ip-btn-primary:hover {
    transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,110,247,0.52);
  }
  .ip-btn-primary:active { transform: scale(0.97); }

  .ip-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 999px; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13.5px; font-weight: 500;
    border: 1.5px solid rgba(0,0,0,0.10); background: transparent;
    color: #374151; text-decoration: none;
    transition: all 0.22s ease;
  }
  .ip-btn-ghost:hover {
    background: rgba(26,110,247,0.07); border-color: rgba(26,110,247,0.28); color: #1a6ef7;
  }
  .dark .ip-btn-ghost {
    border-color: rgba(255,255,255,0.10); color: #94a3b8;
  }
  .dark .ip-btn-ghost:hover {
    background: rgba(77,155,255,0.08); border-color: rgba(77,155,255,0.28); color: #4d9bff;
  }

  /* ── Divider line below hero */
  .ip-hero-divider {
    max-width: 1120px; margin: 40px auto 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(26,110,247,0.15), transparent);
  }
  .dark .ip-hero-divider {
    background: linear-gradient(90deg, transparent, rgba(77,155,255,0.12), transparent);
  }

  /* ── Content grid */
  .ip-content {
    position: relative; z-index: 1;
    max-width: 1120px; margin: 0 auto;
    padding: 48px 28px 96px;
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 40px;
    align-items: start;
  }
  @media (max-width: 960px) { .ip-content { grid-template-columns: 1fr; } }
  @media (max-width: 640px) { .ip-content { padding: 36px 20px 64px; } }

  /* ── Left: main content */
  .ip-main { display: flex; flex-direction: column; gap: 40px; }

  /* Section card */
  .ip-card {
    background: rgba(255,255,255,0.80);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.80);
    border-radius: 22px; padding: 28px 28px 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1.5px 0 rgba(255,255,255,0.9) inset;
    animation: ip-fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }
  .dark .ip-card {
    background: rgba(10,13,24,0.72);
    border-color: rgba(255,255,255,0.08);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 1.5px 0 rgba(255,255,255,0.05) inset;
  }
  .ip-card:nth-child(1) { animation-delay: 0.10s; }
  .ip-card:nth-child(2) { animation-delay: 0.18s; }
  .ip-card:nth-child(3) { animation-delay: 0.26s; }

  .ip-card-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em;
    color: #111827; margin: 0 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .ip-card-title { color: #f0f6ff; }
  .ip-card-title-icon {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, #1a6ef7, #0a3ba8);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(26,110,247,0.35);
  }

  .ip-body-text {
    font-size: 14.5px; font-weight: 300; line-height: 1.75; color: #6b7280;
  }
  .dark .ip-body-text { color: #94a3b8; }

  /* Expertise list */
  .ip-expertise-list {
    display: flex; flex-direction: column; gap: 10px;
    list-style: none; padding: 0; margin: 0;
  }
  .ip-expertise-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    border: 1px solid rgba(26,110,247,0.08);
    background: rgba(26,110,247,0.03);
    font-size: 14px; font-weight: 400; color: #374151;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .ip-expertise-item:hover {
    background: rgba(26,110,247,0.07); border-color: rgba(26,110,247,0.20);
    transform: translateX(4px);
  }
  .dark .ip-expertise-item {
    border-color: rgba(77,155,255,0.08); background: rgba(77,155,255,0.04); color: rgba(255,255,255,0.72);
  }
  .dark .ip-expertise-item:hover { background: rgba(77,155,255,0.10); border-color: rgba(77,155,255,0.22); }
  .ip-expertise-check { color: #1a6ef7; flex-shrink: 0; }
  .dark .ip-expertise-check { color: #4d9bff; }

  /* ── Right: sidebar */
  .ip-sidebar { display: flex; flex-direction: column; gap: 20px; }

  .ip-sidebar-card {
    background: rgba(255,255,255,0.80);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.80);
    border-radius: 22px; padding: 22px 22px 18px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1.5px 0 rgba(255,255,255,0.9) inset;
  }
  .dark .ip-sidebar-card {
    background: rgba(10,13,24,0.72);
    border-color: rgba(255,255,255,0.08);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 1.5px 0 rgba(255,255,255,0.05) inset;
  }

  .ip-sidebar-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; color: #9ca3af;
    margin: 0 0 14px;
  }
  .dark .ip-sidebar-title { color: #4b5563; }

  /* Link buttons in sidebar */
  .ip-link-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 12px; width: 100%;
    border: 1.5px solid rgba(0,0,0,0.08);
    background: transparent; cursor: pointer; text-decoration: none;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13.5px; font-weight: 500; color: #374151;
    transition: all 0.22s ease; margin-bottom: 8px;
  }
  .ip-link-btn:last-child { margin-bottom: 0; }
  .ip-link-btn:hover {
    background: rgba(26,110,247,0.07); border-color: rgba(26,110,247,0.25); color: #1a6ef7;
  }
  .dark .ip-link-btn { border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }
  .dark .ip-link-btn:hover { background: rgba(77,155,255,0.08); border-color: rgba(77,155,255,0.25); color: #4d9bff; }
  .ip-link-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: rgba(26,110,247,0.10); border: 1px solid rgba(26,110,247,0.15);
    display: flex; align-items: center; justify-content: center; color: #1a6ef7;
  }
  .dark .ip-link-icon { background: rgba(77,155,255,0.10); border-color: rgba(77,155,255,0.15); color: #4d9bff; }
  .ip-link-arrow { margin-left: auto; opacity: 0.35; transition: opacity 0.18s, transform 0.22s ease; }
  .ip-link-btn:hover .ip-link-arrow { opacity: 0.8; transform: translateX(3px); }

  /* Rating stars */
  .ip-stars { display: flex; gap: 3px; }
  .ip-star { color: #fbbf24; font-size: 14px; }

  /* Quick stat row in sidebar */
  .ip-quick-stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .ip-quick-stat {
    padding: 12px 14px; border-radius: 14px;
    background: rgba(26,110,247,0.05);
    border: 1px solid rgba(26,110,247,0.10);
    text-align: center;
    transition: background 0.2s ease;
  }
  .ip-quick-stat:hover { background: rgba(26,110,247,0.09); }
  .dark .ip-quick-stat { background: rgba(77,155,255,0.06); border-color: rgba(77,155,255,0.12); }
  .dark .ip-quick-stat:hover { background: rgba(77,155,255,0.10); }
  .ip-quick-stat-n {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;
    color: #111827; line-height: 1;
  }
  .dark .ip-quick-stat-n { color: #f0f6ff; }
  .ip-quick-stat-n em { color: #1a6ef7; font-style: normal; }
  .dark .ip-quick-stat-n em { color: #4d9bff; }
  .ip-quick-stat-l { font-size: 11px; color: #9ca3af; margin-top: 3px; text-transform: uppercase; letter-spacing: .05em; }
`;

const expertiseItems = [
  "React & Modern JavaScript (ES6+)",
  "UI/UX Design Principles & Figma",
  "Node.js & RESTful API Design",
  "Responsive Web Development",
  "Database Design (SQL & NoSQL)",
  "Performance Optimisation",
  "Agile & Scrum Methodology",
  "Technical Mentorship & Code Review",
];

const InstructorPage = () => {
  return (
    <>
      <style>{CSS}</style>
      <div className="ip-page">
        <div className="ip-orb-1" />
        <div className="ip-orb-2" />

        {/* ── Hero */}
        <div className="ip-hero">
          {/* Breadcrumb */}
          <div className="ip-breadcrumb">
            <Link to="/">Home</Link>
            <span className="ip-breadcrumb-sep">›</span>
            <Link to="/instructors">Instructors</Link>
            <span className="ip-breadcrumb-sep">›</span>
            <span>Ronald Richards</span>
          </div>

          <div className="ip-hero-grid">
            {/* Avatar */}
            <div className="ip-avatar-col">
              <div className="ip-avatar-wrap">
                <img src={f1} alt="Ronald Richards" className="ip-avatar" />
                <div className="ip-online" title="Available" />
              </div>
            </div>

            {/* Copy */}
            <div className="ip-copy-col">
              <span className="ip-eyebrow">
                <span className="ip-eyebrow-dot" />
                Verified Instructor
              </span>

              <h1 className="ip-name">Ronald Richards</h1>
              <p className="ip-role">Web Developer · UI/UX Designer · Educator</p>

              {/* Stats */}
              <div className="ip-stats">
                <div className="ip-stat">
                  <div className="ip-stat-icon-wrap"><Users size={15} /></div>
                  <div>
                    <div className="ip-stat-n">1,000<span style={{ fontSize: "0.75em", color: "#1a6ef7" }}>+</span></div>
                    <div className="ip-stat-l">Students</div>
                  </div>
                </div>
                <div className="ip-stat">
                  <div className="ip-stat-icon-wrap"><Star size={15} /></div>
                  <div>
                    <div className="ip-stat-n">154</div>
                    <div className="ip-stat-l">Reviews</div>
                  </div>
                </div>
                <div className="ip-stat">
                  <div className="ip-stat-icon-wrap"><BookOpen size={15} /></div>
                  <div>
                    <div className="ip-stat-n">12</div>
                    <div className="ip-stat-l">Courses</div>
                  </div>
                </div>
                <div className="ip-stat">
                  <div className="ip-stat-icon-wrap"><Award size={15} /></div>
                  <div>
                    <div className="ip-stat-n">4.8</div>
                    <div className="ip-stat-l">Avg. Rating</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ip-actions">
                <button className="ip-btn-primary">
                  <Mail size={14} /> Contact Instructor
                </button>
                <a href="#" className="ip-btn-ghost">
                  <Globe size={14} /> Website
                </a>
                <a href="#" className="ip-btn-ghost">
                  <Briefcase size={14} /> Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ip-hero-divider" />

        {/* ── Content */}
        <div className="ip-content">

          {/* Left: main */}
          <div className="ip-main">

            {/* About */}
            <div className="ip-card">
              <div className="ip-card-title">
                <div className="ip-card-title-icon">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="4" r="2.5" stroke="white" strokeWidth="1.4"/>
                    <path d="M1.5 12c0-2.76 2.239-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                About Ronald Richards
              </div>
              <p className="ip-body-text">
                Ronald Richards is a seasoned web developer and UI/UX designer with over 10 years
                of industry experience. He has worked with startups and Fortune 500 companies alike,
                leading product design and full-stack engineering teams across three continents.
              </p>
              <p className="ip-body-text" style={{ marginTop: 12 }}>
                As an educator, Ronald is passionate about breaking down complex concepts into
                digestible, hands-on lessons. His courses emphasise real-world projects, industry
                best practices, and the kind of problem-solving skills that separate great developers
                from good ones.
              </p>
            </div>

            {/* Expertise */}
            <div className="ip-card">
              <div className="ip-card-title">
                <div className="ip-card-title-icon">
                  <CheckCircle size={13} color="white" strokeWidth={1.8} />
                </div>
                Areas of Expertise
              </div>
              <ul className="ip-expertise-list">
                {expertiseItems.map((item) => (
                  <li key={item} className="ip-expertise-item">
                    <CheckCircle size={14} className="ip-expertise-check" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience */}
            <div className="ip-card">
              <div className="ip-card-title">
                <div className="ip-card-title-icon">
                  <Briefcase size={13} color="white" strokeWidth={1.8} />
                </div>
                Professional Experience
              </div>
              <p className="ip-body-text">
                Before transitioning to full-time teaching, Ronald served as a Senior Frontend
                Engineer at a Series B SaaS company where he led a team of 8 engineers, reduced
                page load times by 60%, and shipped a design system used across 4 product lines.
              </p>
              <p className="ip-body-text" style={{ marginTop: 12 }}>
                He has consulted for clients in fintech, edtech, and e-commerce, and holds
                certifications in Google UX Design and AWS Cloud Practitioner. He brings that
                real-world context into every lesson he teaches.
              </p>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="ip-sidebar">

            {/* Quick stats */}
            <div className="ip-sidebar-card">
              <div className="ip-sidebar-title">At a Glance</div>
              <div className="ip-quick-stats">
                {[
                  ["1k", "+", "Students"],
                  ["154", "", "Reviews"],
                  ["12", "", "Courses"],
                  ["4.8", "★", "Rating"],
                ].map(([n, s, l]) => (
                  <div key={l} className="ip-quick-stat">
                    <div className="ip-quick-stat-n">{n}<em>{s}</em></div>
                    <div className="ip-quick-stat-l">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="ip-sidebar-card">
              <div className="ip-sidebar-title">Student Rating</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontFamily: "'Syne',sans-serif", fontSize: "2.6rem",
                  fontWeight: 800, letterSpacing: "-0.03em", color: "#111827", lineHeight: 1,
                }}>4.8</span>
                <div>
                  <div className="ip-stars">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="ip-star" style={{ opacity: i <= 4 ? 1 : 0.35 }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 2 }}>Based on 154 reviews</div>
                </div>
              </div>
              {/* Rating bars */}
              {[[5,78],[4,14],[3,5],[2,2],[1,1]].map(([star, pct]) => (
                <div key={star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"#9ca3af", width:8, flexShrink:0 }}>{star}</span>
                  <div style={{ flex:1, height:5, borderRadius:999, background:"rgba(0,0,0,0.07)", overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", borderRadius:999, background:"linear-gradient(90deg,#1a6ef7,#4d9bff)" }} />
                  </div>
                  <span style={{ fontSize:11, color:"#9ca3af", width:26, textAlign:"right" }}>{pct}%</span>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="ip-sidebar-card">
              <div className="ip-sidebar-title">Connect</div>
              {[
                { icon: <Globe size={14} />, label: "Personal Website" },
                { icon: <Briefcase size={14} />, label: "Portfolio" },
                { icon: <Mail size={14} />, label: "Send Message" },
              ].map((link) => (
                <a key={link.label} href="#" className="ip-link-btn">
                  <div className="ip-link-icon">{link.icon}</div>
                  {link.label}
                  <span className="ip-link-arrow">›</span>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorPage;