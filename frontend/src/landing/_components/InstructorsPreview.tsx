// InstructorsPreview.tsx — Windows 2000 Style
import { Link } from "react-router-dom";
import { instructors } from "@/data/Instructors";
import { InstructorCard, WIN2K_INSTRUCTOR_CSS } from "@/landing/_components/InstructorCard";

const CSS = `
  ${WIN2K_INSTRUCTOR_CSS}

  .ip-section {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    padding: 16px;
  }
  .ip-window {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    max-width: 1200px;
    margin: 0 auto;
  }
  .ip-title-bar {
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
  .ip-title-left { display: flex; align-items: center; gap: 6px; }
  .ip-wbtns { display: flex; gap: 2px; }
  .ip-wbtn {
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
  .ip-toolbar {
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ip-toolbar-left {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: bold; color: #000;
  }
  .ip-badge {
    background: #000080; color: #fff;
    font-size: 10px; padding: 1px 6px;
  }
  .ip-body {
    background: #d4d0c8;
    padding: 12px;
  }
  .ip-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 900px) { .ip-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .ip-grid { grid-template-columns: 1fr; } }
  .ip-statusbar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    padding: 2px 8px;
    font-size: 10px; color: #000;
    display: flex; gap: 12px;
    font-family: "Tahoma", Arial;
  }
  .ip-statusbar-panel {
    border-right: 1px solid #808080;
    padding-right: 8px;
  }
  .ip-toolbar-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 11px;
    padding: 3px 12px;
    background: #d4d0c8;
    border-top: 1.5px solid #ffffff;
    border-left: 1.5px solid #ffffff;
    border-right: 1.5px solid #404040;
    border-bottom: 1.5px solid #404040;
    cursor: pointer; color: #000;
    text-decoration: none; display: inline-block;
  }
  .ip-toolbar-btn:hover { background: #e8e8e8; }
`;

export default function InstructorsPreview() {
  const preview = instructors.slice(0, 4);

  return (
    <>
      <style>{CSS}</style>
      <section className="ip-section">
        <div className="ip-window">
          {/* Title bar */}
          <div className="ip-title-bar">
            <div className="ip-title-left">
              <span>👥</span>
              Top Instructors — GGECL LMS
            </div>
            <div className="ip-wbtns">
              <div className="ip-wbtn">_</div>
              <div className="ip-wbtn">&#9633;</div>
              <div className="ip-wbtn">&#215;</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="ip-toolbar">
            <div className="ip-toolbar-left">
              <span>Top Instructors</span>
              <span className="ip-badge">{preview.length} items</span>
            </div>
            <Link to="/instructors">
              <button className="ip-toolbar-btn">Meet All Instructors &gt;&gt;</button>
            </Link>
          </div>

          {/* Grid */}
          <div className="ip-body">
            <div className="ip-grid">
              {preview.map((inst, i) => (
                <InstructorCard key={inst.id} instructor={inst} index={i} />
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div className="ip-statusbar">
            <span className="ip-statusbar-panel">{preview.length} object(s)</span>
            <span className="ip-statusbar-panel">Ready</span>
            <span>My Computer</span>
          </div>
        </div>
      </section>
    </>
  );
}
