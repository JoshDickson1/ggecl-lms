import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { ArrowRight } from "lucide-react";

/* ── Keyframe animations injected once ──────────────────────── */
const ANIM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

@keyframes il-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.il-1 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .05s both; }
.il-2 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .13s both; }
.il-3 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .21s both; }
.il-4 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .29s both; }
.il-5 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .37s both; }
.il-6 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .45s both; }
.il-7 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .53s both; }
.il-8 { animation: il-up .55s cubic-bezier(0.22,1,0.36,1) .61s both; }

@keyframes driftUp   { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
@keyframes driftDown { from { transform: translateY(-50%); } to { transform: translateY(0);    } }
@keyframes spin      { to { transform: rotate(360deg); } }

.il-col-0 { animation: driftUp   30s linear infinite; }
.il-col-1 { animation: driftDown 24s linear infinite; margin-top: 40px; }
.il-col-2 { animation: driftUp   36s linear infinite; margin-top: -30px; }

.il-col-0 .il-card:nth-child(3n+1) { height: 130px; }
.il-col-0 .il-card:nth-child(3n+2) { height: 100px; }
.il-col-0 .il-card:nth-child(3n+3) { height: 150px; }
.il-col-1 .il-card:nth-child(3n+1) { height: 115px; }
.il-col-1 .il-card:nth-child(3n+2) { height: 160px; }
.il-col-1 .il-card:nth-child(3n+3) { height:  95px; }
.il-col-2 .il-card:nth-child(3n+1) { height: 140px; }
.il-col-2 .il-card:nth-child(3n+2) { height: 105px; }
.il-col-2 .il-card:nth-child(3n+3) { height: 130px; }

.il-input:focus {
  border-color: rgba(245,158,11,0.5);
  background: rgba(245,158,11,0.03);
  box-shadow: 0 0 0 3px rgba(245,158,11,0.10);
  outline: none;
}

.il-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(245,158,11,0.52);
}
.il-submit:active:not(:disabled) { transform: scale(0.98); }
.il-submit:hover .il-submit-arrow { transform: translateX(2px); }
`;

/* ── Masonry images ──────────────────────────────────────────── */
const COL_IMAGES = [
  [
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=320&q=80", alt: "Lecture" },
    { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=320&q=80", alt: "Classroom" },
    { src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=320&q=80", alt: "Teaching" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=320&q=80", alt: "Video call" },
    { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=320&q=80", alt: "Group" },
    { src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=320&q=80", alt: "Studying" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=320&q=80", alt: "Online" },
    { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=320&q=80", alt: "Learning" },
    { src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=320&q=80", alt: "Coding" },
  ],
];

/* ── Left decorative panel ───────────────────────────────────── */
function LeftPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between w-[52%] flex-shrink-0 overflow-hidden"
      style={{
        background: "#06091a",
        padding: "160px 40px 36px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Orbs */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: -120, right: -100, width: 480, height: 480,
          background: "rgba(26,110,247,0.18)", filter: "blur(110px)",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: -80, left: -80, width: 360, height: 360,
          background: "rgba(77,155,255,0.10)", filter: "blur(90px)",
        }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px", opacity: 0.03,
        }}
      />

      {/* Brand chip */}
      <div
        className="relative z-10 inline-flex items-center gap-2 w-fit mb-6"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 999, padding: "6px 14px 6px 8px",
        }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1L6.2 3.8L9 4.2L7 6.2L7.5 9L5 7.6L2.5 9L3 6.2L1 4.2L3.8 3.8Z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
          GGECL · Instructor Portal
        </span>
      </div>

      {/* Drifting masonry */}
      <div
        className="relative z-10 flex-none h-[340px] flex items-stretch gap-[10px] overflow-hidden my-5"
        style={{
          borderRadius: 20,
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        {COL_IMAGES.map((images, colIdx) => (
          <div
            key={colIdx}
            className={`flex-1 flex flex-col gap-[10px] will-change-transform il-col-${colIdx}`}
          >
            {[...images, ...images].map((img, i) => (
              <div
                key={i}
                className="il-card rounded-[14px] overflow-hidden flex-shrink-0"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <img src={img.src} alt={img.alt} loading={i < 3 ? "eager" : "lazy"} className="w-full h-full object-cover block" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Copy */}
      <div className="relative z-10">
        <h2
          style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontSize: "clamp(2rem,2.6vw,2.8rem)",
            fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
            color: "#fff", margin: "0 0 12px",
          }}
        >
          Teach without<br /><span style={{ color: "#fbbf24" }}>limits.</span>
        </h2>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, color: "rgba(255,255,255,0.45)", maxWidth: 340, marginBottom: 24 }}>
          Share your expertise with thousands of eager learners. Build courses, track progress, and grow your impact on GGECL.
        </p>
        <div className="flex gap-7">
          {[["500+", "Students"], ["25+", "Courses"], ["94%", "Retention"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {n.replace(/[+%]/g, "")}<em style={{ color: "#fbbf24", fontStyle: "normal" }}>{n.match(/[+%]/)?.[0]}</em>
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div
        className="relative z-10 pt-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p style={{ fontSize: 13, fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          "The art of teaching is the art of assisting discovery."
        </p>
        <cite style={{ display: "block", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.2)", marginTop: 6, letterSpacing: ".06em", textTransform: "uppercase", fontStyle: "normal" }}>
          — Mark Van Doren
        </cite>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
const InstructorResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [email, _setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [_emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const validate = () => {
    let valid = true;
    if (!email) { setEmailErr("Email is required"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Invalid email address"); valid = false; }
    if (!password) { setPasswordErr("Password is required"); valid = false; }
    else setPasswordErr("");
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsPending(true);
    setTimeout(() => setIsPending(false), 2000); // Simulated pending
  };

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div
        className="flex min-h-svh w-full"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <LeftPanel />

        {/* ── Right panel ── */}
        <div
          className="flex-1 flex flex-col bg-background justify-start overflow-y-auto"
          style={{ padding: "clamp(100px,12vw,150px) clamp(20px,8vw,64px) 60px" }}
        >
          <div className="w-full max-w-[400px] mx-auto">

            {/* Header */}
            <div className="il-1 mb-7 mt-[25px] md:mt-0">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#b45309)",
                    boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM3 13c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-amber-800">
                    Instructor Access
                </span>
              </div>
              <h1
                className="text-gray-900 dark:text-gray-100 mb-2"
                style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  fontSize: "clamp(1.8rem,3vw,2.4rem)",
                  fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
                }}
              >
                Reset your <span className="text-amber-600">password</span>
              </h1>
              <p className="text-[14px] font-light text-slate-500 leading-relaxed">
                Enter your new password below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="">
                {/* Password */}
              <div className="il-3 flex flex-col gap-1.5">
                <label htmlFor="il-password" className="text-[13px] font-medium text-slate-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="il-input w-full py-[13px] pl-[44px] pr-[44px] rounded-xl border-[1.5px] border-black/10 bg-black/[0.025] text-[14px] dark:text-gray-300 text-slate-900 dark:placeholder:text-slate-400 placeholder:font-light transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-[13px] top-1/2 -translate-y-1/2 flex items-center bg-transparent border-none cursor-pointer p-[2px] text-slate-400 hover:text-slate-500 transition-colors duration-[180ms]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordErr && <p className="text-[12px] text-red-500">{passwordErr}</p>}
              </div>
              </div>
              <div className="">
                {/* Password */}
              <div className="il-3 flex flex-col gap-1.5">
                <label htmlFor="il-password" className="text-[13px] font-medium text-slate-700 dark:text-gray-300">
                    Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="il-input w-full py-[13px] pl-[44px] pr-[44px] rounded-xl border-[1.5px] border-black/10 bg-black/[0.025] text-[14px] dark:text-gray-300 text-slate-900 dark:placeholder:text-slate-400 placeholder:font-light transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-[13px] top-1/2 -translate-y-1/2 flex items-center bg-transparent border-none cursor-pointer p-[2px] text-slate-400 hover:text-slate-500 transition-colors duration-[180ms]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordErr && <p className="text-[12px] text-red-500">{passwordErr}</p>}
              </div>
              </div>

              {/* Submit */}
              <div className="il-5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="il-submit w-full flex items-center justify-center gap-[9px] px-6 py-[14px] rounded-xl border-none cursor-pointer text-[14.5px] font-semibold tracking-[-0.01em] text-white disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    background: "linear-gradient(135deg,#f59e0b 0%,#b45309 100%)",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.38)",
                  }}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    <>
                      Sign in to Instructor Portal
                      <span
                        className="il-submit-arrow w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                        style={{ background: "rgba(255,255,255,0.20)" }}
                      >
                        <ArrowRight size={9} />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {/* Footer note */}
            <p className="text-[11.5px] text-slate-400 text-center leading-relaxed mt-4">
              By signing in you agree to GGECL's{" "}
              <a href="https://ggecl.com/terms" target="_blank" rel="noopener noreferrer" className="text-amber-500 no-underline hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorResetPassword;