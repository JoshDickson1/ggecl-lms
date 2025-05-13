import signupImg from "@/assets/images/signup-img.png";
import loginImg from "@/assets/images/logoforsignup.png";
import AuthPageLoading from "./AuthPageLoading";
import { useLocation } from "react-router";

function AuthContainer({
  children,
  isPending,
}: {
  children: React.ReactNode;
  isPending: boolean;
}) {
  const { pathname } = useLocation();
  const authImg = pathname.startsWith("/login") ? loginImg : signupImg;
  return (
    <>
      {isPending && <AuthPageLoading />}
      <section className="relative grid min-h-max overflow-hidden py-10 md:py-0 lg:grid-cols-2 dark:bg-gray-900">
        {/* Background Blur Effects */}
        <div className="pointer-events-none absolute top-10 left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"></div>

        {/* Auth Form Section */}
        <div className="z-10 flex flex-col items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md space-y-5">{children}</div>
        </div>

        {/* Image Section (Hidden on Small Screens) */}
        <div className="hidden w-full items-center justify-center p-4 lg:flex">
          <img
            src={authImg}
            alt="Authentication"
            className="h-auto w-full max-w-md object-contain"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}

export default AuthContainer;
