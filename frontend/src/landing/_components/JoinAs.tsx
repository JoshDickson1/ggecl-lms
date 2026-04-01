// JoinAs.tsx — Windows 2000 Style
import React from "react";
import teacherImg from "@/assets/Asset3.png";
import studentImg from "@/assets/Asset2.png";

const CSS = `
  .ja-win-section {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    padding: 16px;
  }
  .ja-win-outer {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Each row is its own window */
  .ja-win-panel {
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
  }
  .ja-win-titlebar {
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
  .ja-win-titlebar-left { display: flex; align-items: center; gap: 6px; }
  .ja-win-btns { display: flex; gap: 2px; }
  .ja-win-btn {
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

  .ja-win-body {
    background: #d4d0c8;
    padding: 16px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  @media (max-width: 700px) {
    .ja-win-body { flex-direction: column; }
  }

  /* Image panel — looks like a picture frame / IE image viewer */
  .ja-img-frame {
    flex-shrink: 0;
    width: 240px;
  }
  .ja-img-inner {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #fff;
    padding: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 200px;
    overflow: hidden;
  }
  .ja-img-inner img {
    max-height: 190px;
    max-width: 100%;
    object-fit: contain;
    object-position: bottom;
    display: block;
  }
  .ja-img-caption {
    background: #000080;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    text-align: center;
    font-weight: bold;
  }

  /* Copy area */
  .ja-copy-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ja-section-title {
    font-size: 16px;
    font-weight: bold;
    color: #000080;
    margin: 0;
  }
  .ja-desc {
    font-size: 12px;
    color: #000;
    line-height: 1.6;
    margin: 0;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #fff;
    padding: 8px;
  }

  /* Checklist */
  .ja-checklist {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ja-check-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #000;
    padding: 2px 0;
  }
  .ja-check-icon {
    width: 14px; height: 14px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
    color: #007700;
    font-weight: bold;
  }

  /* Action button */
  .ja-action-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 12px;
    padding: 6px 20px;
    background: #000080;
    color: #fff;
    border-top: 2px solid #0000c0;
    border-left: 2px solid #0000c0;
    border-right: 2px solid #000040;
    border-bottom: 2px solid #000040;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    font-weight: bold;
    align-self: flex-start;
  }
  .ja-action-btn:hover { background: #0000a0; }
  .ja-action-btn:active {
    border-top: 2px solid #000040;
    border-left: 2px solid #000040;
    border-right: 2px solid #0000c0;
    border-bottom: 2px solid #0000c0;
  }
`;

function JoinPanel({
  img,
  imgAlt,
  title,
  titleIcon,
  desc,
  chips,
  btnLabel,
  onBtnClick,
  reverse,
}: {
  img: string;
  imgAlt: string;
  title: string;
  titleIcon: string;
  desc: string;
  chips: string[];
  btnLabel: string;
  onBtnClick: () => void;
  reverse?: boolean;
}) {
  const content = [
    /* Copy area */
    <div key="copy" className="ja-copy-area">
      <h2 className="ja-section-title">{title}</h2>
      <p className="ja-desc">{desc}</p>
      <div className="ja-checklist">
        {chips.map((c) => (
          <div key={c} className="ja-check-item">
            <div className="ja-check-icon">&#10003;</div>
            {c}
          </div>
        ))}
      </div>
      <button className="ja-action-btn" onClick={onBtnClick}>{btnLabel} &gt;&gt;</button>
    </div>,
    /* Image */
    <div key="img" className="ja-img-frame">
      <div className="ja-img-inner">
        <img src={img} alt={imgAlt} />
      </div>
      <div className="ja-img-caption">{imgAlt}</div>
    </div>,
  ];

  return (
    <div className="ja-win-panel">
      <div className="ja-win-titlebar">
        <div className="ja-win-titlebar-left">
          <span>{titleIcon}</span>
          {title}
        </div>
        <div className="ja-win-btns">
          <div className="ja-win-btn">_</div>
          <div className="ja-win-btn">&#9633;</div>
          <div className="ja-win-btn">&#215;</div>
        </div>
      </div>
      <div className="ja-win-body" style={{ flexDirection: reverse ? "row-reverse" : "row" }}>
        {content}
      </div>
    </div>
  );
}

function JoinAs() {
  function navigate(path: string) {
    window.location.href = path;
  }

  return (
    <>
      <style>{CSS}</style>
      <section className="ja-win-section">
        <div className="ja-win-outer">

          <JoinPanel
            img={teacherImg}
            imgAlt="Become an Instructor"
            title="Become an Instructor"
            titleIcon="🎓"
            desc="Empower learners globally by sharing your expertise. Access advanced teaching tools, track student progress, and build a reputation in a thriving educational community."
            chips={["Advanced teaching tools", "Revenue sharing", "Global reach", "Analytics dashboard"]}
            btnLabel="Start Teaching Today"
            onBtnClick={() => navigate("/instructor/login")}
          />

          <JoinPanel
            img={studentImg}
            imgAlt="Enroll as a Student"
            title="Enroll as a Student"
            titleIcon="📖"
            desc="Access insights from industry leaders and world-class educational content. Master essential skills, earn certificates, and advance your career — at your own pace."
            chips={["Expert instructors", "Lifetime access", "Certificates", "Community support"]}
            btnLabel="Begin Your Learning Journey"
            onBtnClick={() => navigate("/login")}
            reverse
          />

        </div>
      </section>
    </>
  );
}

export default JoinAs;
