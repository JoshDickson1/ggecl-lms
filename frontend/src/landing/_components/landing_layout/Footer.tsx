// Footer.tsx — Windows 2000 Style
import lightImg from "@/assets/ggecl_logo.jpg";
import { MapPin } from "lucide-react";

const FOOTER_LINKS = {
  "Quick Links": [
    { name: "Home",     href: "https://ggecl.com/" },
    { name: "About us", href: "https://ggecl.com/about" },
    { name: "Services", href: "https://ggecl.com/services" },
    { name: "Apply",    href: "https://ggecl.com/apply/start" },
  ],
  "Support": [
    { name: "Contact",   href: "https://ggecl.com/contact" },
    { name: "GGECL LMS", href: "https://lms.ggecl.com" },
    { name: "Career",    href: "https://ggecl.com/career" },
  ],
  "Community": [
    { name: "FAQs",             href: "https://ggecl.com/faqs" },
    { name: "Terms & Services", href: "https://ggecl.com/terms" },
    { name: "Work hours",       href: "https://ggecl.com/work-hours" },
    { name: "Blogs",            href: "https://ggecl.com/blogs" },
  ],
};

const INSTAGRAM_POSTS = [
  "https://www.ggecl.com/foot-1.jpeg",
  "https://www.ggecl.com/foot-2.jpeg",
  "https://www.ggecl.com/foot-3.jpeg",
  "https://www.ggecl.com/foot-4.jpeg",
  "https://www.ggecl.com/foot-5.jpeg",
  "https://www.ggecl.com/foot-6.jpeg",
];

const CSS = `
  .ft-win {
    font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
  }

  /* IE-style status bar at very top of footer */
  .ft-ie-bar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    border-bottom: 1px solid #808080;
    padding: 3px 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 11px;
    color: #000;
  }
  .ft-ie-bar a {
    color: #000080;
    text-decoration: underline;
  }
  .ft-ie-bar a:hover { color: #cc0000; }

  .ft-body {
    padding: 16px 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1.2fr;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  @media (max-width: 900px) {
    .ft-body { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 540px) {
    .ft-body { grid-template-columns: 1fr; }
  }

  /* Brand col */
  .ft-brand {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ft-brand-row {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 4px;
  }
  .ft-logo-img {
    width: 32px; height: 32px;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    object-fit: cover;
  }
  .ft-brand-name {
    font-size: 14px;
    font-weight: bold;
    color: #000080;
    letter-spacing: 0.05em;
  }
  .ft-desc-box {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #fff;
    padding: 8px;
    font-size: 11px;
    color: #000;
    line-height: 1.6;
  }

  /* Link columns */
  .ft-col-title {
    font-size: 11px;
    font-weight: bold;
    color: #fff;
    background: #000080;
    padding: 2px 6px;
    margin-bottom: 6px;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .ft-link-list {
    list-style: none;
    padding: 0; margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ft-link-list li a {
    font-size: 11px;
    color: #000080;
    text-decoration: underline;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 1px 0;
  }
  .ft-link-list li a:hover { color: #cc0000; }
  .ft-link-arrow {
    font-size: 9px; color: #808080;
  }

  /* Location box */
  .ft-location-box {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    background: #fff;
    padding: 8px;
    font-size: 11px;
    color: #000;
    display: flex;
    gap: 4px;
    line-height: 1.5;
    margin-top: 6px;
  }

  /* Instagram grid */
  .ft-insta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    margin-top: 6px;
  }
  .ft-insta-img {
    aspect-ratio: 1;
    width: 100%;
    object-fit: cover;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    display: block;
  }
  .ft-insta-img:hover {
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
  }

  /* Bottom bar — like the IE status bar */
  .ft-bottom-bar {
    background: #d4d0c8;
    border-top: 2px solid #808080;
    box-shadow: 0 -1px 0 #fff;
    padding: 4px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 10px;
    color: #000;
  }
  .ft-bottom-right {
    display: flex; gap: 16px;
  }
  .ft-bottom-link {
    color: #000080;
    text-decoration: underline;
    font-size: 10px;
  }
  .ft-bottom-link:hover { color: #cc0000; }
  .ft-status-icon {
    display: flex; align-items: center; gap: 4px;
  }
  .ft-status-green {
    width: 10px; height: 10px;
    background: #00aa00;
    border-top: 1px solid #007700;
    border-left: 1px solid #007700;
    border-right: 1px solid #00dd00;
    border-bottom: 1px solid #00dd00;
  }
`;

function Footer() {
  return (
    <>
      <style>{CSS}</style>
      <footer className="ft-win">
        {/* IE toolbar-style top */}
        <div className="ft-ie-bar">
          <div className="ft-status-icon">
            <div className="ft-status-green" />
            <span>Portal Online</span>
          </div>
          <span>&#124;</span>
          <a href="https://ggecl.com" target="_blank" rel="noopener noreferrer">ggecl.com</a>
          <span>&#124;</span>
          <a href="https://lms.ggecl.com" target="_blank" rel="noopener noreferrer">LMS Portal</a>
          <span>&#124;</span>
          <span>Zone: Trusted Sites</span>
        </div>

        {/* Main body */}
        <div className="ft-body">
          {/* Brand */}
          <div className="ft-brand">
            <div className="ft-brand-row">
              <img src={lightImg} alt="GGECL LMS" className="ft-logo-img" />
              <span className="ft-brand-name">G.G.E.C.L</span>
            </div>
            <div className="ft-desc-box">
              GGECL is a smart learning platform designed to empower students,
              educators, and organizations with cutting-edge tools, seamless
              collaboration, and an engaging educational experience.
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <span className="ft-col-title">{title}</span>
              <ul className="ft-link-list">
                {links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      <span className="ft-link-arrow">&#9658;</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Location + Instagram */}
          <div>
            <span className="ft-col-title">Location</span>
            <div className="ft-location-box">
              <MapPin size={13} style={{ flexShrink: 0, marginTop: 1, color: "#000080" }} />
              <span>University Business Centre — Leeds,<br />148 Rose Bowl, LS1 3HB, UK.</span>
            </div>

            <span className="ft-col-title" style={{ display: "block", marginTop: 12 }}>Instagram</span>
            <div className="ft-insta-grid">
              {INSTAGRAM_POSTS.map((src, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/goldengosheneducation"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={src} alt={`Instagram post ${i + 1}`} className="ft-insta-img" loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="ft-bottom-bar">
          <span>
            &copy; {new Date().getFullYear()} G.G.E.C.L All Rights Reserved by{" "}
            <a href="tel:+2349130993464" className="ft-bottom-link">BiTech</a>
          </span>
          <div className="ft-bottom-right">
            <a href="https://ggecl.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="ft-bottom-link">
              Privacy Policy
            </a>
            <a href="https://ggecl.com/terms" target="_blank" rel="noopener noreferrer" className="ft-bottom-link">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
