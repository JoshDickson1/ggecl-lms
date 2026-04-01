// InstructorCard.tsx — Windows 2000 Style
import { Link } from "react-router-dom";
import { Star, Users, BookOpen } from "lucide-react";
import { type Instructor, fmt } from "@/data/Instructors";

const PHOTO_MAP: Record<string, string> = {
  "inst-1": "https://i.pinimg.com/736x/b5/ca/9b/b5ca9b6c98616c7d8465aae596917c76.jpg",
  "inst-2": "https://i.pinimg.com/736x/49/c3/65/49c365435c2566ef0c937d8290a8c034.jpg",
  "inst-3": "https://i.pinimg.com/736x/c2/4d/0d/c24d0d7542ee6be66bf4270123c15df4.jpg",
  "inst-4": "https://i.pinimg.com/736x/35/03/f5/3503f5aa64cbfa3b093dfef99fc9cd4a.jpg",
  "inst-5": "https://i.pinimg.com/736x/a7/95/a9/a795a9be9eb35aebaee821eb1acc653f.jpg",
  "inst-6": "https://i.pinimg.com/1200x/0e/db/f3/0edbf38c0d27da9b9dd4cf8a95c850b7.jpg",
  "inst-7": "https://i.pinimg.com/736x/35/41/ea/3541ea71d49833e5d8f5cb9647348342.jpg",
  "inst-8": "https://i.pinimg.com/1200x/66/c3/31/66c331a7757b9d87397a05c46a678527.jpg",
};

export const WIN2K_INSTRUCTOR_CSS = `
  .ic-card {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #404040;
    border-bottom: 2px solid #404040;
    background: #fff;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }
  .ic-card:hover {
    border-top: 2px solid #404040;
    border-left: 2px solid #404040;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
  }
  .ic-card-titlebar {
    background: linear-gradient(to right, #0a246a, #a6b5e7);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    display: flex; align-items: center; gap: 4px;
  }
  .ic-photo-wrap {
    height: 140px;
    background: #d4d0c8;
    border-bottom: 1px solid #808080;
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .ic-photo-wrap img {
    width: 100%; height: 100%; object-fit: cover; object-position: top;
  }
  .ic-avatar-fallback {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%;
  }
  .ic-available-badge {
    position: absolute;
    top: 6px; left: 6px;
    background: #007700;
    color: #fff;
    font-size: 9px;
    font-weight: bold;
    padding: 1px 6px;
  }
  .ic-card-body {
    padding: 8px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ic-name {
    font-size: 12px;
    font-weight: bold;
    color: #000;
    margin: 0;
  }
  .ic-title {
    font-size: 10px;
    color: #555;
    margin: 0;
  }
  .ic-stats {
    display: flex;
    gap: 8px;
    font-size: 10px;
    color: #000;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .ic-stat {
    display: flex; align-items: center; gap: 3px;
  }
  .ic-badges {
    display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px;
  }
  .ic-badge {
    font-size: 9px;
    background: #000080;
    color: #fff;
    padding: 1px 5px;
    font-weight: bold;
  }
  .ic-card-footer {
    border-top: 1px solid #d4d0c8;
    padding: 5px 8px;
    background: #f0eee8;
  }
  .ic-view-btn {
    font-family: "Tahoma", Arial, sans-serif;
    font-size: 10px;
    padding: 3px 0;
    background: #d4d0c8;
    border-top: 1.5px solid #ffffff;
    border-left: 1.5px solid #ffffff;
    border-right: 1.5px solid #404040;
    border-bottom: 1.5px solid #404040;
    cursor: pointer;
    color: #000;
    text-decoration: none;
    display: block;
    text-align: center;
    width: 100%;
  }
  .ic-view-btn:hover { background: #e8e8e8; }
  .ic-view-btn:active {
    border-top: 1.5px solid #404040;
    border-left: 1.5px solid #404040;
    border-right: 1.5px solid #ffffff;
    border-bottom: 1.5px solid #ffffff;
  }
`;

export function InstructorCard({
  instructor,
  index = 0,
}: {
  instructor: Instructor;
  index?: number;
}) {
  const photo = instructor.photo ?? PHOTO_MAP[instructor.id];

  return (
    <div className="ic-card">
      {/* Title bar */}
      <div className="ic-card-titlebar">
        <span>👤</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
          {instructor.name}
        </span>
      </div>

      {/* Photo */}
      <div className="ic-photo-wrap">
        {photo ? (
          <img
            src={photo}
            alt={instructor.name}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : null}
        {!photo && (
          <div className={`ic-avatar-fallback ${instructor.avatarBg}`}>
            {instructor.avatar}
          </div>
        )}
        <div className="ic-available-badge">&#9679; Available</div>
      </div>

      {/* Body */}
      <div className="ic-card-body">
        <p className="ic-name">{instructor.name}</p>
        <p className="ic-title">{instructor.title}</p>

        <div className="ic-stats">
          <span className="ic-stat">
            <Star size={10} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
            {instructor.rating}
          </span>
          <span className="ic-stat">
            <Users size={9} />
            {fmt(instructor.students)}
          </span>
          <span className="ic-stat">
            <BookOpen size={9} />
            {instructor.courses} courses
          </span>
        </div>

        <div className="ic-badges">
          {instructor.badges.slice(0, 2).map((b) => (
            <span key={b} className="ic-badge">{b}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="ic-card-footer">
        <Link to={`/instructors/${instructor.id}`}>
          <button className="ic-view-btn">View Profile &gt;&gt;</button>
        </Link>
      </div>
    </div>
  );
}
