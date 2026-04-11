import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageNotifier from "../PageNotifier";
import { authClient } from "@/lib/auth-client";

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
const InstructorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [authErr, setAuthErr] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    if (!email) { setEmailErr("Email is required"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Invalid email address"); valid = false; }
    else setEmailErr("");
    if (!password) { setPasswordErr("Password is required"); valid = false; }
    else setPasswordErr("");
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setAuthErr("");
    setIsPending(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/instructor",
    });

    setIsPending(false);

    if (error) {
      setAuthErr(error.message ?? "Sign in failed. Please try again.");
      return;
    }

    navigate("/instructor");
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${import.meta.env.VITE_APP_URL}` + "/instructor",
    });
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
                  Instructor Portal
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
                Welcome back,<br />Instructor.
              </h1>
              <p className="text-[14px] font-light text-slate-500 leading-relaxed">
                Login to manage your courses and students.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="il-2 flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                    placeholder="you@example.com"
                    className="il-input w-full py-[13px] pr-[14px] pl-[44px] rounded-xl border-[1.5px] border-black/10 bg-black/[0.025] text-[14px] dark:text-gray-300 text-slate-900 dark:placeholder:text-slate-400 placeholder:font-light transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                  />
                </div>
                {emailErr && <p className="text-[12px] text-red-500">{emailErr}</p>}
              </div>

              {/* Password */}
              <div className="il-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-gray-700">Password</label>
                  <Link to="/instructor/forgotten-password" className="text-[12px] text-amber-500 font-medium no-underline hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordErr(""); }}
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

              {/* Auth-level error (wrong credentials etc.) */}
              {authErr && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-100">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                    <circle cx="7" cy="7" r="6.5" stroke="#ef4444" />
                    <path d="M7 4v3.5M7 9.5v.5" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <p className="text-[12.5px] text-red-600">{authErr}</p>
                </div>
              )}

              {/* Remember me */}
              <div className="il-4 flex items-center gap-2">
                <input type="checkbox" id="il-remember" className="w-4 h-4 cursor-pointer accent-amber-500" />
                <label htmlFor="il-remember" className="text-[13px] font-normal text-slate-500 cursor-pointer">
                  Remember me
                </label>
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

            {/* Divider */}
            <div className="il-6 mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[12px] text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google sign-in */}
            <div className="il-7 mt-3.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-[13px] px-5 rounded-xl border-[1.5px] border-slate-200 bg-white text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Student link */}
            <p className="il-8 text-center text-[13px] text-slate-500 mt-[22px]">
              Are you a student?{" "}
              <Link to="/login" className="text-amber-500 font-semibold no-underline hover:underline">
                Login here
              </Link>
            </p>

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
      <PageNotifier variant="instructor" />
    </>
  );
};

export default InstructorLogin;