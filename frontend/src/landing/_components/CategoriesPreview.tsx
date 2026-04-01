// CategoriesPreview.tsx — Windows 2000 Style
import { categories, type Category } from "@/data/categories";
import { Link } from "react-router-dom";

const CSS = `
  .cat-section {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    padding: 16px;
  }
  .cat-window {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    max-width: 1200px;
    margin: 0 auto;
  }
  .cat-title-bar {
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
  .cat-title-left { display: flex; align-items: center; gap: 6px; }
  .cat-wbtns { display: flex; gap: 2px; }
  .cat-wbtn {
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
  .cat-toolbar {
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cat-toolbar-left {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: bold; color: #000;
  }
  .cat-badge {
    background: #000080; color: #fff;
    font-size: 10px; padding: 1px 6px;
  }
  .cat-body {
    background: #d4d0c8;
    padding: 12px;
  }
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 1100px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 760px)  { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px)  { .cat-grid { grid-template-columns: 1fr; } }

  .cat-card {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    background: #fff;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }
  .cat-card:hover {
    border-top: 2px solid #404040;
    border-left: 2px solid #404040;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
  }
  .cat-card-titlebar {
    background: linear-gradient(to right, #0a246a, #a6b5e7);
    color: #fff; font-size: 10px;
    padding: 2px 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .cat-card-icon-wrap {
    height: 60px;
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
  }
  .cat-card-body {
    padding: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .cat-card-name {
    font-size: 12px;
    font-weight: bold;
    color: #000;
    margin: 0;
  }
  .cat-card-courses {
    font-size: 10px;
    color: #000080;
    font-weight: bold;
  }
  .cat-card-pop-wrap {
    margin-top: 2px;
  }
  .cat-pop-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #555;
    margin-bottom: 2px;
  }
  .cat-pop-track {
    height: 8px;
    background: #d4d0c8;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    overflow: hidden;
  }
  .cat-pop-fill {
    height: 100%;
    background: linear-gradient(to right, #000080, #3060c0);
  }
  .cat-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 4px;
  }
  .cat-tag {
    font-size: 9px;
    border: 1px solid #808080;
    padding: 0 4px;
    background: #d4d0c8;
    color: #000;
  }
  .cat-card-footer {
    border-top: 1px solid #d4d0c8;
    padding: 5px 8px;
    background: #f0eee8;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cat-students-count {
    font-size: 10px;
    color: #000080;
    font-weight: bold;
  }
  .cat-explore-btn {
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
    text-decoration: none;
    display: inline-block;
  }
  .cat-explore-btn:hover { background: #e8e8e8; }
  .cat-explore-btn:active {
    border-top: 1.5px solid #404040;
    border-left: 1.5px solid #404040;
    border-right: 1.5px solid #ffffff;
    border-bottom: 1.5px solid #ffffff;
  }
  .cat-statusbar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    padding: 2px 8px;
    font-size: 10px;
    color: #000;
    display: flex; gap: 12px;
    font-family: "Tahoma", Arial;
  }
  .cat-statusbar-panel {
    border-right: 1px solid #808080;
    padding-right: 8px;
  }
  .cat-toolbar-btn {
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
  .cat-toolbar-btn:hover { background: #e8e8e8; }
`;

const CATEGORY_ICON_MAP: Record<string, string> = {
  "Technology": "💻",
  "Business": "💼",
  "Design": "🎨",
  "Science": "🔬",
  "Math": "📐",
  "Language": "📝",
  "Music": "🎵",
  "Art": "🖼️",
  "Health": "❤️",
  "Finance": "💰",
  "Marketing": "📣",
  "Photography": "📷",
};

function getCatIcon(cat: Category) {
  const key = Object.keys(CATEGORY_ICON_MAP).find((k) =>
    cat.title.toLowerCase().includes(k.toLowerCase()) ||
    (cat.tags && cat.tags.some((t: string) => t.toLowerCase().includes(k.toLowerCase())))
  );
  return key ? CATEGORY_ICON_MAP[key] : "📁";
}

function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function CatCard({ cat }: { cat: Category }) {
  const icon = getCatIcon(cat);
  return (
    <div className="cat-card">
      <div className="cat-card-titlebar">
        <span>📁</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
          {cat.title}
        </span>
      </div>
      <div className="cat-card-icon-wrap">{icon}</div>
      <div className="cat-card-body">
        <p className="cat-card-name">{cat.title}</p>
        <p className="cat-card-courses">{cat.courses} courses available</p>
        <div className="cat-card-pop-wrap">
          <div className="cat-pop-label">
            <span>Popularity</span>
            <span>{cat.popularity}%</span>
          </div>
          <div className="cat-pop-track">
            <div className="cat-pop-fill" style={{ width: `${cat.popularity}%` }} />
          </div>
        </div>
        {cat.tags && (
          <div className="cat-tags">
            {cat.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="cat-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="cat-card-footer">
        <span className="cat-students-count">
          {formatStudents(cat.students)} students
        </span>
        <Link to={`/categories/${cat.id}`}>
          <button className="cat-explore-btn">Explore &gt;</button>
        </Link>
      </div>
    </div>
  );
}

export default function CategoriesPreview() {
  const preview = categories.slice(0, 8);

  return (
    <>
      <style>{CSS}</style>
      <section className="cat-section">
        <div className="cat-window">
          {/* Title bar */}
          <div className="cat-title-bar">
            <div className="cat-title-left">
              <span>📂</span>
              Top Categories — GGECL LMS
            </div>
            <div className="cat-wbtns">
              <div className="cat-wbtn">_</div>
              <div className="cat-wbtn">&#9633;</div>
              <div className="cat-wbtn">&#215;</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="cat-toolbar">
            <div className="cat-toolbar-left">
              <span>Top Categories</span>
              <span className="cat-badge">{preview.length} items</span>
            </div>
            <Link to="/categories">
              <button className="cat-toolbar-btn">Browse All Categories &gt;&gt;</button>
            </Link>
          </div>

          {/* Body */}
          <div className="cat-body">
            <div className="cat-grid">
              {preview.map((cat) => (
                <CatCard key={cat.id} cat={cat} />
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div className="cat-statusbar">
            <span className="cat-statusbar-panel">{preview.length} object(s)</span>
            <span className="cat-statusbar-panel">Ready</span>
            <span>My Computer</span>
          </div>
        </div>
      </section>
    </>
  );
}
