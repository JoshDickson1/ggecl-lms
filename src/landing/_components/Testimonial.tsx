import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1);   }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes tm-fadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes tm-slideIn {
    from { opacity:0; transform:translateX(18px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* ── Section */
  .tm-section {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #ffffff;
    padding: 96px 28px;
    overflow: hidden;
    transition: background 0.3s ease;
    position: relative;
  }
  .dark .tm-section { background: #080d1a; }

  /* subtle background grid */
  .tm-section::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(26,110,247,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,110,247,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }
  .dark .tm-section::before {
    background-image:
      linear-gradient(rgba(77,155,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(77,155,255,0.05) 1px, transparent 1px);
  }

  .tm-inner {
    max-width: 1120px;
    margin: 0 auto;
    position: relative; z-index: 1;
  }

  /* ── Header row */
  .tm-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 52px;
    animation: tm-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  @media (max-width: 640px) {
    .tm-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  }

  /* Eyebrow */
  .tm-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    margin-bottom: 14px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    padding: 4px 12px 4px 8px;
    font-size: 11.5px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase;
    color: #2563eb; width: fit-content;
  }
  .dark .tm-eyebrow {
    background: rgba(37,99,235,0.12);
    border-color: rgba(37,99,235,0.25);
    color: #60a5fa;
  }
  .tm-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #2563eb;
    animation: pulseDot 2s ease-in-out infinite;
    flex-shrink: 0;
  }
  .dark .tm-eyebrow-dot { background: #60a5fa; }

  /* Heading */
  .tm-heading {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(1.9rem, 3.2vw, 2.75rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #111827;
    margin: 0;
  }
  .dark .tm-heading { color: #f0f6ff; }
  .tm-heading .accent {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .dark .tm-heading .accent {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .tm-subtext {
    font-size: 15px; font-weight: 300; line-height: 1.6;
    color: #6b7280; margin-top: 10px; max-width: 400px;
  }
  .dark .tm-subtext { color: #94a3b8; }

  /* ── Nav arrows */
  .tm-arrows {
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .tm-arrow {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 1.5px solid rgba(0,0,0,0.10);
    background: rgba(255,255,255,0.80);
    backdrop-filter: blur(12px);
    color: #374151;
    transition:
      background 0.22s ease,
      border-color 0.22s ease,
      color 0.22s ease,
      transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
      box-shadow 0.22s ease;
  }
  .tm-arrow:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    border-color: transparent;
    color: #fff;
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(26,110,247,0.38);
  }
  .tm-arrow:active { transform: scale(0.94); }
  .dark .tm-arrow {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.10);
    color: #94a3b8;
  }
  .dark .tm-arrow:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    border-color: transparent;
    color: #fff;
  }
  .tm-arrow:disabled {
    opacity: 0.35; cursor: default;
    transform: none !important; box-shadow: none !important;
  }

  /* ── Carousel viewport */
  .tm-viewport { overflow: hidden; }

  .tm-track {
    display: flex;
    gap: 18px;
    transition: transform 0.52s cubic-bezier(0.4,0,0.2,1);
    will-change: transform;
  }

  /* ── Card */
  .tm-card {
    flex-shrink: 0;
    /* width set via JS/inline style */
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.80);
    border-radius: 22px;
    padding: 28px 26px 24px;
    box-shadow:
      0 4px 24px rgba(0,0,0,0.06),
      0 1.5px 0 rgba(255,255,255,0.9) inset;
    display: flex; flex-direction: column;
    transition:
      transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
      box-shadow 0.3s ease;
    position: relative; overflow: hidden;
  }
  .tm-card:hover {
    transform: translateY(-5px);
    box-shadow:
      0 16px 40px rgba(26,110,247,0.12),
      0 4px 16px rgba(0,0,0,0.06),
      0 1.5px 0 rgba(255,255,255,0.9) inset;
  }
  .dark .tm-card {
    background: rgba(10,13,24,0.72);
    border-color: rgba(255,255,255,0.08);
    box-shadow:
      0 4px 24px rgba(0,0,0,0.4),
      0 1.5px 0 rgba(255,255,255,0.05) inset;
  }
  .dark .tm-card:hover {
    box-shadow:
      0 16px 40px rgba(77,155,255,0.10),
      0 4px 16px rgba(0,0,0,0.4),
      0 1.5px 0 rgba(255,255,255,0.05) inset;
  }

  /* accent bar top of card */
  .tm-card::before {
    content: '';
    position: absolute; top: 0; left: 24px; right: 24px; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(26,110,247,0.35), transparent);
    border-radius: 0 0 2px 2px;
  }

  /* Stars */
  .tm-stars { display: flex; gap: 3px; margin-bottom: 14px; }
  .tm-star { color: #f59e0b; font-size: 13px; }

  /* Quote mark */
  .tm-quote-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px; flex-shrink: 0;
  }
  .dark .tm-quote-icon {
    background: rgba(26,110,247,0.12);
    border-color: rgba(26,110,247,0.20);
  }

  /* Text */
  .tm-text {
    font-size: 14.5px; font-weight: 300; line-height: 1.65;
    color: #374151; flex: 1; margin-bottom: 22px;
  }
  .dark .tm-text { color: #94a3b8; }

  /* Divider */
  .tm-card-divider {
    height: 1px; margin-bottom: 16px;
    background: rgba(0,0,0,0.06);
  }
  .dark .tm-card-divider { background: rgba(255,255,255,0.06); }

  /* Author row */
  .tm-author { display: flex; align-items: center; gap: 12px; }
  .tm-avatar-wrap {
    position: relative; flex-shrink: 0;
  }
  .tm-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    object-fit: cover; object-position: top;
    border: 2px solid rgba(26,110,247,0.25);
    box-shadow: 0 2px 10px rgba(0,0,0,0.12);
    display: block;
  }
  .tm-avatar-ring {
    position: absolute; inset: -3px; border-radius: 50%;
    border: 1.5px solid rgba(26,110,247,0.18);
    pointer-events: none;
  }
  .tm-author-name {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13.5px; font-weight: 600; color: #111827; line-height: 1.2;
  }
  .dark .tm-author-name { color: #e8f0ff; }
  .tm-author-role {
    font-size: 12px; font-weight: 300; color: #9ca3af; margin-top: 1px;
  }
  .dark .tm-author-role { color: #4b5563; }

  /* verified badge */
  .tm-verified {
    margin-left: auto; flex-shrink: 0;
    width: 22px; height: 22px; border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(26,110,247,0.35);
  }

  /* ── Dot indicators */
  .tm-dots {
    display: flex; justify-content: center; gap: 7px; margin-top: 40px;
  }
  .tm-dot {
    height: 6px; border-radius: 999px;
    background: rgba(0,0,0,0.12);
    transition: width 0.3s ease, background 0.3s ease;
    cursor: pointer;
  }
  .tm-dot.active {
    background: linear-gradient(90deg, #3b82f6, #1e40af);
    width: 24px !important;
  }
  .dark .tm-dot { background: rgba(255,255,255,0.12); }
  .dark .tm-dot.active { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
`;

const testimonials = [
  {
    text: "This platform has completely transformed the way I learn. The courses are easy to follow and the instructors are world-class.",
    name: "Alice Johnson",
    role: "Business Administrator",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    stars: 5,
  },
  {
    text: "I love the variety of courses available. The instructors are knowledgeable, engaging, and genuinely invested in your growth.",
    name: "Maria Smith",
    role: "Hotel Manager",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80",
    stars: 5,
  },
  {
    text: "The support team is amazing! They helped me resolve an issue within minutes. Best learning investment I've ever made.",
    name: "Sophia Brown",
    role: "Healthcare Analyst",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    stars: 5,
  },
  {
    text: "The user interface is intuitive and beautiful. Navigating between courses feels effortless. Highly recommend this platform!",
    name: "James Wilson",
    role: "Finance Consultant",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    stars: 4,
  },
  {
    text: "The quality of the content is absolutely top-notch. I've learned more here in two months than in an entire year of self-study.",
    name: "Emily Davis",
    role: "Education Specialist",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80",
    stars: 5,
  },
  {
    text: "Affordable, effective, and well-designed. This platform is a genuine game-changer for anyone serious about online learning.",
    name: "Joan Martinez",
    role: "Project Coordinator",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    stars: 5,
  },
];

function useCardsPerView() {
  const [cpv, setCpv] = useState(() =>
    typeof window !== "undefined" ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1) : 3
  );
  useEffect(() => {
    const handler = () =>
      setCpv(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return cpv;
}

const Testimonial = () => {
  const [index, setIndex] = useState(0);
  const cpv = useCardsPerView();
  const maxIndex = testimonials.length - cpv;
  const GAP = 18; // px — must match CSS gap

  const prev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex(i => Math.min(i + 1, maxIndex)), [maxIndex]);

  // keep index in bounds when window resizes
  useEffect(() => { setIndex(i => Math.min(i, maxIndex)); }, [maxIndex]);

  // card width = (viewport - gaps) / cardsPerView — approximated via %
  // We translate by (index * (100/cpv + gap-offset))
  // Since gap is in px, we compute the offset per card
  const cardWidthPct = 100 / cpv;
  // translateX = index * (cardWidthPct% + GAP/viewport * 100%)
  // We use a CSS calc trick via inline style
  const translateX = `calc(-${index * cardWidthPct}% - ${index * GAP}px)`;

  return (
    <>
      <style>{CSS}</style>
      <section className="tm-section">
        <div className="tm-inner">

          {/* ── Header */}
          <div className="tm-header">
            <div>
              <span className="tm-eyebrow">
                <span className="tm-eyebrow-dot" />
                Student voices
              </span>
              <h2 className="tm-heading">
                What our <span className="accent">students</span><br />say about us
              </h2>
              <p className="tm-subtext">
                Real stories from real learners who've transformed their careers with GGECL.
              </p>
            </div>

            {/* Arrows */}
            <div className="tm-arrows">
              <button
                className="tm-arrow"
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous"
              >
                <ChevronLeft size={18} strokeWidth={2.2} />
              </button>
              <button
                className="tm-arrow"
                onClick={next}
                disabled={index >= maxIndex}
                aria-label="Next"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* ── Carousel */}
          <div className="tm-viewport">
            <div
              className="tm-track"
              style={{ transform: `translateX(${translateX})` }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="tm-card"
                  style={{ width: `calc(${cardWidthPct}% - ${(GAP * (cpv - 1)) / cpv}px)` }}
                >
                  {/* Stars */}
                  <div className="tm-stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="tm-star" style={{ opacity: s < t.stars ? 1 : 0.2 }}>★</span>
                    ))}
                  </div>

                  {/* Quote icon */}
                  <div className="tm-quote-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7.5C1 4.46 3.46 2 6.5 2v2C4.57 4 3 5.57 3 7.5H5V12H1V7.5ZM8 7.5C8 4.46 10.46 2 13.5 2v2C11.57 4 10 5.57 10 7.5H12V12H8V7.5Z" fill="#3b82f6"/>
                    </svg>
                  </div>

                  {/* Text */}
                  <p className="tm-text">"{t.text}"</p>

                  <div className="tm-card-divider" />

                  {/* Author */}
                  <div className="tm-author">
                    <div className="tm-avatar-wrap">
                      <img src={t.image} alt={t.name} className="tm-avatar" />
                      <div className="tm-avatar-ring" />
                    </div>
                    <div>
                      <div className="tm-author-name">{t.name}</div>
                      <div className="tm-author-role">{t.role}</div>
                    </div>
                    <div className="tm-verified">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dot indicators */}
          <div className="tm-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`tm-dot${i === index ? " active" : ""}`}
                style={{ width: i === index ? 24 : 6 }}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default Testimonial;