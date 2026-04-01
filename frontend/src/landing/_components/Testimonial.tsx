// Testimonial.tsx — Windows 2000 Style
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CSS = `
  .tm-win-section {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    padding: 16px;
  }
  .tm-win-window {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    max-width: 1100px;
    margin: 0 auto;
  }
  .tm-win-titlebar {
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
  .tm-win-title-left { display: flex; align-items: center; gap: 6px; }
  .tm-win-btns { display: flex; gap: 2px; }
  .tm-win-wbtn {
    width: 16px; height: 14px;
    background: #d4d0c8;
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
    border-right: 1px solid #404040;
    border-bottom: 1px solid #404040;
    font-size: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #000; font-weight: bold;
  }
  .tm-win-toolbar {
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tm-win-toolbar-left {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: bold; color: #000;
  }
  .tm-win-badge {
    background: #000080; color: #fff;
    font-size: 10px; padding: 1px 6px;
  }

  /* Nav buttons */
  .tm-nav-area { display: flex; align-items: center; gap: 4px; }
  .tm-nav-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 11px;
    padding: 3px 8px;
    background: #d4d0c8;
    border-top: 1.5px solid #ffffff;
    border-left: 1.5px solid #ffffff;
    border-right: 1.5px solid #404040;
    border-bottom: 1.5px solid #404040;
    cursor: pointer; color: #000;
    display: inline-flex; align-items: center; gap: 2px;
  }
  .tm-nav-btn:hover { background: #e8e8e8; }
  .tm-nav-btn:active {
    border-top: 1.5px solid #404040;
    border-left: 1.5px solid #404040;
    border-right: 1.5px solid #ffffff;
    border-bottom: 1.5px solid #ffffff;
  }
  .tm-nav-btn:disabled {
    color: #808080;
    cursor: default;
    background: #d4d0c8;
  }

  .tm-win-body {
    background: #d4d0c8;
    padding: 12px;
    overflow: hidden;
  }
  .tm-win-carousel {
    overflow: hidden;
  }
  .tm-win-track {
    display: flex;
    gap: 8px;
    transition: transform 0.4s ease;
    will-change: transform;
  }

  /* Each testimonial card looks like a dialog box */
  .tm-win-card {
    flex-shrink: 0;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
  .tm-card-header {
    background: linear-gradient(to right, #0a246a, #a6b5e7);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    font-weight: bold;
  }
  .tm-card-body {
    padding: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tm-stars {
    display: flex; gap: 2px; font-size: 12px; color: #f59e0b;
  }
  .tm-quote-mark {
    font-size: 28px;
    font-family: Georgia, serif;
    color: #000080;
    line-height: 1;
    margin-bottom: -6px;
  }
  .tm-text {
    font-size: 11px;
    color: #000;
    line-height: 1.6;
    flex: 1;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #f8f8f8;
    padding: 6px;
  }
  .tm-divider {
    height: 1px;
    background: #d4d0c8;
    border-top: 1px solid #808080;
    border-bottom: 1px solid #fff;
  }
  .tm-author-row {
    display: flex; align-items: center; gap: 8px;
    padding-top: 4px;
  }
  .tm-avatar {
    width: 36px; height: 36px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    object-fit: cover; object-position: top;
    flex-shrink: 0;
    display: block;
  }
  .tm-author-name {
    font-size: 11px; font-weight: bold; color: #000;
  }
  .tm-author-role {
    font-size: 10px; color: #555;
  }
  .tm-verified {
    margin-left: auto;
    background: #007700;
    color: #fff;
    font-size: 9px;
    padding: 1px 5px;
    font-weight: bold;
    flex-shrink: 0;
  }

  /* Dot pagination */
  .tm-dots {
    display: flex; justify-content: center; gap: 4px;
    margin-top: 10px;
  }
  .tm-dot {
    width: 12px; height: 12px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #d4d0c8;
    cursor: pointer;
  }
  .tm-dot.active {
    background: #000080;
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
  }

  .tm-win-statusbar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    padding: 2px 8px;
    font-size: 10px; color: #000;
    display: flex; gap: 12px;
    font-family: "Tahoma", Arial;
  }
  .tm-win-sb-panel {
    border-right: 1px solid #808080;
    padding-right: 8px;
  }
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
  const GAP = 8;

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, maxIndex)), [maxIndex]);

  useEffect(() => { setIndex((i) => Math.min(i, maxIndex)); }, [maxIndex]);

  const cardWidthPct = 100 / cpv;
  const translateX = `calc(-${index * cardWidthPct}% - ${index * GAP}px)`;

  return (
    <>
      <style>{CSS}</style>
      <section className="tm-win-section">
        <div className="tm-win-window">
          {/* Title bar */}
          <div className="tm-win-titlebar">
            <div className="tm-win-title-left">
              <span>💬</span>
              Student Feedback — GGECL LMS
            </div>
            <div className="tm-win-btns">
              <div className="tm-win-wbtn">_</div>
              <div className="tm-win-wbtn">&#9633;</div>
              <div className="tm-win-wbtn">&#215;</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="tm-win-toolbar">
            <div className="tm-win-toolbar-left">
              <span>What Our Students Say</span>
              <span className="tm-win-badge">{testimonials.length} reviews</span>
            </div>
            <div className="tm-nav-area">
              <button className="tm-nav-btn" onClick={prev} disabled={index === 0} aria-label="Previous">
                <ChevronLeft size={12} /> Prev
              </button>
              <span style={{ fontSize: 10, color: "#555" }}>{index + 1} / {maxIndex + 1}</span>
              <button className="tm-nav-btn" onClick={next} disabled={index >= maxIndex} aria-label="Next">
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div className="tm-win-body">
            <div className="tm-win-carousel">
              <div
                className="tm-win-track"
                style={{ transform: `translateX(${translateX})` }}
              >
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className="tm-win-card"
                    style={{ width: `calc(${cardWidthPct}% - ${(GAP * (cpv - 1)) / cpv}px)` }}
                  >
                    <div className="tm-card-header">
                      &#8220;{t.name}&#8221; — {t.role}
                    </div>
                    <div className="tm-card-body">
                      {/* Stars */}
                      <div className="tm-stars">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} style={{ opacity: s < t.stars ? 1 : 0.2 }}>&#9733;</span>
                        ))}
                      </div>
                      {/* Quote */}
                      <div className="tm-quote-mark">&#8220;</div>
                      <p className="tm-text">{t.text}&#8221;</p>
                      <div className="tm-divider" />
                      {/* Author */}
                      <div className="tm-author-row">
                        <img src={t.image} alt={t.name} className="tm-avatar" />
                        <div>
                          <div className="tm-author-name">{t.name}</div>
                          <div className="tm-author-role">{t.role}</div>
                        </div>
                        <span className="tm-verified">&#10003; Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="tm-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`tm-dot${i === index ? " active" : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div className="tm-win-statusbar">
            <span className="tm-win-sb-panel">{testimonials.length} reviews</span>
            <span className="tm-win-sb-panel">Ready</span>
            <span>My Computer</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonial;
