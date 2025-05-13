import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link } from "react-router";
import { FaGoogle, FaArrowRight } from "react-icons/fa";
import uiImg from "@/assets/images/logoforsignup.png";
import LoginPopup from "@/components/ui/LoginPopup";

const StudentLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden dark:bg-gray-900">
      <div className="absolute top-10 left-20 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-green-400/20 rounded-full blur-2xl"></div>

      <div className="flex flex-col justify-center items-center p-6 sm:p- z-10 mt-8">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold mt-2">Login</h1>
            <p className="text-base-content/60">
              Login to your Instructor account
            </p>
          </div>

          <form className="space-y-5">
            {/* Email Input */}
            <div className="form-control">
              <label htmlFor="email" className="label mb-2">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative  mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 py-2 rounded-md dark:bg-gray-800 outline-none shadow-md"
                  placeholder="joshdickon@gmail.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  id="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label htmlFor="password" className="label mb-2">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 py-2 rounded-md dark:bg-gray-800 outline-none shadow-md"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  id="password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                  />
                  <span className="text-sm text-base-content">Remember me</span>
                </label>
                <p className="text-sm text-primary cursor-pointer hover:underline">
                  Forgot password?
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4 py-2 px-4 w-full justify-center rounded-md text-white flex gap-2 items-center"
            >
              <span>Sign in</span> <FaArrowRight />
            </button>
          </form>

          <div className="flex items-center gap-2 my-4">
            <hr className="flex-grow border-t border-base-content/20 boder border-gray-500 dark:border-gray-300" />
            <span className="text-sm text-base-content/60">Or</span>
            <hr className="flex-grow border-t border-base-content/20 border border-gray-500 dark:border-gray-300" />
          </div>

          {/* Google Login */}
          <div className="mt-6 flex justify-center w-full">
            <button className="btn btn-outline btn-google flex items-center justify-center w-full py-2 rounded-md text-white flex-row gap-2">
              <FaGoogle className="text-xl" />
              <span>Google</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-4">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="h-screen max-w-7xl md:block hidden">
        <img src={uiImg} alt="" />
      </div>

      {/* <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden dark:bg-gray-900"> */}
      <LoginPopup />
      {/* </div> */}
    </div>
  );
};

export default StudentLogin;
