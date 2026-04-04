import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import lightImg from "@/assets/ggecl_logo.jpg";
// import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
// import { ModeToggle } from "@/mode-toggle";

// const socialNavs = [
//   {
//     name: "Instagram",
//     url: "https://www.instagram.com/goldengosheneducation",
//     icon: <FaInstagram size={18} />,
//   },
//   {
//     name: "Facebook",
//     url: "https://www.facebook.com/ggeclofficial",
//     icon: <FaFacebookF size={18} />,
//   },
//   {
//     name: "LinkedIn",
//     url: "https://www.linkedin.com/company/ggecl",
//     icon: <FaLinkedinIn size={18} />,
//   },
//   {
//     name: "Twitter",
//     url: "https://twitter.com/ggeclofficial",
//     icon: <FaTwitter size={18} />,
//   },
// ];

/* ── Exact ggecl.com links, open in _blank */
const FOOTER_LINKS = {
  "Quick Links": [
    { name: "Home",     href: "https://ggecl.com/" },
    { name: "About us", href: "https://ggecl.com/about" },
    { name: "Services", href: "https://ggecl.com/services" },
    { name: "Apply",    href: "https://ggecl.com/apply/start" },
  ],
  "Support": [
    { name: "Contact",  href: "https://ggecl.com/contact" },
    { name: "GGECL LMS",href: "https://lms.ggecl.com" },
    { name: "Career",   href: "https://ggecl.com/career" },
  ],
  "Community": [
    { name: "FAQs",             href: "https://ggecl.com/faqs" },
    { name: "Terms & Services", href: "https://ggecl.com/terms" },
    { name: "Work hours",       href: "https://ggecl.com/work-hours" },
    { name: "Blogs",            href: "https://ggecl.com/blogs" },
  ],
};

/* ── Same Instagram posts as ggecl.com */
const INSTAGRAM_POSTS = [
  "https://www.ggecl.com/foot-1.jpeg",
  "https://www.ggecl.com/foot-2.jpeg",
  "https://www.ggecl.com/foot-3.jpeg",
  "https://www.ggecl.com/foot-4.jpeg",
  "https://www.ggecl.com/foot-5.jpeg",
  "https://www.ggecl.com/foot-6.jpeg",
];

function Footer() {
  return (
    <footer className="relative bg-white dark:bg-slate-950 pt-20 pb-10 overflow-hidden transition-colors duration-300">

      {/* ── Subtle gradient wash — the lil extra */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* top-right glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-400/6 blur-[130px] rounded-full" />
        {/* bottom-left accent */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/4 dark:bg-indigo-400/5 blur-[110px] rounded-full" />
        {/* very subtle top gradient band */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">

          {/* ── Brand col */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 overflow-hidden flex-shrink-0 ring-1 ring-slate-100 dark:ring-slate-800">
                <img src={lightImg} alt="GGECL LMS" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                G.G.E.C.L
              </h2>
            </div>

            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">
              GGECL is a smart learning platform designed to empower students, educators,
              and organizations with cutting-edge tools, seamless collaboration, and an
              engaging educational experience.
            </p>

            {/* Socials */}
            {/* <div className="flex gap-3 flex-wrap">
              {socialNavs.map((link) => (
                <motion.a
                  key={link.name}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#1e3a5f] dark:hover:bg-blue-700 hover:text-white hover:border-[#1e3a5f] transition-all shadow-sm"
                >
                  {link.icon}
                </motion.a>
              ))}
            </div> */}
          </div>

          {/* ── Nav cols */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {title}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center text-slate-500 dark:text-slate-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 transition-colors font-semibold text-sm"
                      >
                        <ArrowUpRight
                          size={14}
                          className="mr-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0"
                        />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Location + Instagram */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Location
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                <MapPin size={16} className="shrink-0 text-blue-500 mt-0.5" />
                University Business Centre — Leeds,<br />148 Rose Bowl, LS1 3HB, UK.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Instagram Post
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {INSTAGRAM_POSTS.map((src, i) => (
                  <motion.a
                    key={i}
                    href="https://www.instagram.com/goldengosheneducation"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.06 }}
                    className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 block ring-0 hover:ring-2 hover:ring-blue-400/40 transition-all"
                  >
                    <img
                      src={src}
                      alt={`Instagram post ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} G.G.E.C.L All Rights Reserved by{" "}
            <a
              href="tel:+2349130993464"
              className="text-[#1e3a5f] dark:text-blue-400 hover:underline"
            >
              BiTech
            </a>
          </p>

          <div className="flex items-center gap-8">
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter text-slate-400">
              <a
                href="https://ggecl.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://ggecl.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;