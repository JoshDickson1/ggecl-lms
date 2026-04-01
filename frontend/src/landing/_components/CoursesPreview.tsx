// CoursesPreview.tsx — Windows 2000 Style
import { useState } from "react";
import { ShoppingCart, Star, Clock, BookOpen, Users } from "lucide-react";
import { courses, type Course } from "@/data/courses";
import { Link } from "react-router-dom";

const WIN2K_CSS = `
  .cp-section {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    padding: 16px;
  }
  .cp-window {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    max-width: 1200px;
    margin: 0 auto;
  }
  .cp-title-bar {
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
  .cp-title-left {
    display: flex; align-items: center; gap: 6px;
  }
  .cp-title-icon {
    font-size: 12px;
  }
  .cp-window-btns {
    display: flex; gap: 2px;
  }
  .cp-wbtn {
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
  .cp-toolbar {
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .cp-toolbar-left {
    display: flex; align-items: center; gap: 6px;
  }
  .cp-section-heading {
    font-size: 13px;
    font-weight: bold;
    color: #000;
  }
  .cp-count-badge {
    background: #000080;
    color: #fff;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 0;
  }
  .cp-view-all-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 11px;
    padding: 3px 12px;
    background: #d4d0c8;
    border-top: 1.5px solid #ffffff;
    border-left: 1.5px solid #ffffff;
    border-right: 1.5px solid #404040;
    border-bottom: 1.5px solid #404040;
    cursor: pointer;
    color: #000;
    text-decoration: none;
    display: inline-block;
  }
  .cp-view-all-btn:hover { background: #e8e8e8; }
  .cp-body {
    background: #d4d0c8;
    padding: 12px;
  }
  .cp-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 1100px) { .cp-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 760px)  { .cp-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px)  { .cp-grid { grid-template-columns: 1fr; } }

  /* Each course card looks like a Windows list item / small window */
  .cp-card {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: none;
  }
  .cp-card:hover {
    border-top: 2px solid #404040;
    border-left: 2px solid #404040;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
  }
  .cp-card-header {
    background: linear-gradient(to right, #0a246a, #a6b5e7);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cp-card-icon-wrap {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    font-size: 32px;
  }
  .cp-card-body {
    padding: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cp-card-title {
    font-size: 11px;
    font-weight: bold;
    color: #000;
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cp-card-instructor {
    font-size: 10px;
    color: #555;
  }
  .cp-card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #555;
    flex-wrap: wrap;
  }
  .cp-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: bold;
    padding: 1px 4px;
    background: #cc0000;
    color: #fff;
    margin-left: 4px;
  }
  .cp-badge-new  { background: #007700; }
  .cp-badge-hot  { background: #cc4400; }
  .cp-card-footer {
    border-top: 1px solid #d4d0c8;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f0eee8;
  }
  .cp-price {
    font-size: 12px;
    font-weight: bold;
    color: #000080;
  }
  .cp-price-old {
    font-size: 10px;
    color: #808080;
    text-decoration: line-through;
    margin-left: 4px;
  }
  .cp-add-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 10px;
    padding: 2px 8px;
    background: #d4d0c8;
    border-top: 1.5px solid #ffffff;
    border-left: 1.5px solid #ffffff;
    border-right: 1.5px solid #404040;
    border-bottom: 1.5px solid #404040;
    cursor: pointer;
    color: #000;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    text-decoration: none;
  }
  .cp-add-btn:hover { background: #e8e8e8; }
  .cp-add-btn:active {
    border-top: 1.5px solid #404040;
    border-left: 1.5px solid #404040;
    border-right: 1.5px solid #ffffff;
    border-bottom: 1.5px solid #ffffff;
  }
  .cp-statusbar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    padding: 2px 8px;
    font-size: 10px;
    color: #000;
    display: flex;
    gap: 12px;
    font-family: "Tahoma", Arial;
  }
  .cp-statusbar-panel {
    border-right: 1px solid #808080;
    padding-right: 8px;
  }
`;

const ICON_MAP: Record<string, string> = {
  "Web Dev": "🌐",
  "Data Science": "📊",
  "Design": "🎨",
  "Business": "💼",
  "Marketing": "📣",
  "Mobile Dev": "📱",
  "DevOps": "⚙️",
  "Security": "🔒",
};

function getCourseIcon(course: Course) {
  const key = Object.keys(ICON_MAP).find((k) =>
    course.title.toLowerCase().includes(k.toLowerCase()) ||
    course.tags.some((t) => t.toLowerCase().includes(k.toLowerCase()))
  );
  return key ? ICON_MAP[key] : "📁";
}

function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function BadgeLabel({ badge }: { badge: Course["badge"] }) {
  if (!badge) return null;
  const cls = badge === "Bestseller" ? "cp-badge" : badge === "New" ? "cp-badge cp-badge-new" : "cp-badge cp-badge-hot";
  return <span className={cls}>{badge}</span>;
}

function CourseCard({ course }: { course: Course }) {
  const icon = getCourseIcon(course);
  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <div className="cp-card">
      {/* Mini title bar */}
      <div className="cp-card-header">
        <span>📄</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
          {course.title}
        </span>
        <BadgeLabel badge={course.badge} />
      </div>

      {/* Icon area */}
      <div className="cp-card-icon-wrap">{icon}</div>

      {/* Body */}
      <div className="cp-card-body">
        <p className="cp-card-title">{course.title}</p>
        <p className="cp-card-instructor">by {course.instructor.name}</p>
        <div className="cp-card-meta">
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Star size={10} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
            {course.rating}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Clock size={9} />{course.duration}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <BookOpen size={9} />{course.lectures}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Users size={9} />{formatStudents(course.students)}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
          {course.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontSize: 9,
              border: "1px solid #808080",
              padding: "0 4px",
              background: "#d4d0c8",
              color: "#000"
            }}>{tag}</span>
          ))}
          <span style={{ fontSize: 9, color: "#777" }}>-{discount}% OFF</span>
        </div>
      </div>

      {/* Footer: price + add */}
      <div className="cp-card-footer">
        <div>
          <span className="cp-price">${course.price.toFixed(2)}</span>
          <span className="cp-price-old">${course.originalPrice.toFixed(2)}</span>
        </div>
        <Link to={`/courses/${course.id}`}>
          <button className="cp-add-btn">
            <ShoppingCart size={10} /> Add
          </button>
        </Link>
      </div>
    </div>
  );
}

const PREVIEW_COUNT = 8;

export default function CoursesPreview() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const preview = courses.slice(0, PREVIEW_COUNT);

  return (
    <>
      <style>{WIN2K_CSS}</style>
      <section className="cp-section">
        <div className="cp-window">
          {/* Title bar */}
          <div className="cp-title-bar">
            <div className="cp-title-left">
              <span className="cp-title-icon">📚</span>
              Top Courses — GGECL LMS
            </div>
            <div className="cp-window-btns">
              <div className="cp-wbtn">_</div>
              <div className="cp-wbtn">&#9633;</div>
              <div className="cp-wbtn">&#215;</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="cp-toolbar">
            <div className="cp-toolbar-left">
              <span className="cp-section-heading">Top Courses</span>
              <span className="cp-count-badge">{preview.length} items</span>
              <span style={{ width: 1, height: 16, background: "#808080", margin: "0 4px", boxShadow: "1px 0 0 #fff" }} />
              <button className="cp-view-all-btn" onClick={() => setView("grid")}
                style={view === "grid" ? { borderTop: "1.5px solid #404040", borderLeft: "1.5px solid #404040", borderRight: "1.5px solid #fff", borderBottom: "1.5px solid #fff" } : {}}>
                &#9632;&#9632; Icons
              </button>
              <button className="cp-view-all-btn" onClick={() => setView("list")}
                style={view === "list" ? { borderTop: "1.5px solid #404040", borderLeft: "1.5px solid #404040", borderRight: "1.5px solid #fff", borderBottom: "1.5px solid #fff" } : {}}>
                &#9776; List
              </button>
            </div>
            <Link to="/courses">
              <button className="cp-view-all-btn">View All Courses &gt;&gt;</button>
            </Link>
          </div>

          {/* Body */}
          <div className="cp-body">
            {view === "grid" ? (
              <div className="cp-grid">
                {preview.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Tahoma, Arial", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#000080", color: "#fff" }}>
                    <th style={{ padding: "4px 8px", textAlign: "left", border: "1px solid #404040" }}>Name</th>
                    <th style={{ padding: "4px 8px", textAlign: "left", border: "1px solid #404040" }}>Instructor</th>
                    <th style={{ padding: "4px 8px", textAlign: "center", border: "1px solid #404040" }}>Rating</th>
                    <th style={{ padding: "4px 8px", textAlign: "center", border: "1px solid #404040" }}>Duration</th>
                    <th style={{ padding: "4px 8px", textAlign: "right", border: "1px solid #404040" }}>Price</th>
                    <th style={{ padding: "4px 8px", textAlign: "center", border: "1px solid #404040" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#f0eee8" }}>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8" }}>{c.title}</td>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8" }}>{c.instructor.name}</td>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8", textAlign: "center" }}>{c.rating} ★</td>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8", textAlign: "center" }}>{c.duration}</td>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8", textAlign: "right", fontWeight: "bold", color: "#000080" }}>${c.price.toFixed(2)}</td>
                      <td style={{ padding: "3px 8px", border: "1px solid #d4d0c8", textAlign: "center" }}>
                        <Link to={`/courses/${c.id}`}>
                          <button className="cp-add-btn"><ShoppingCart size={10} /> Add</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Status bar */}
          <div className="cp-statusbar">
            <span className="cp-statusbar-panel">{PREVIEW_COUNT} object(s)</span>
            <span className="cp-statusbar-panel">Ready</span>
            <span>My Computer</span>
          </div>
        </div>
      </section>
    </>
  );
}
