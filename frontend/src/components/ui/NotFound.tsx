import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen w-full transition duration-300 
      ${darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-900"}`}
    >
        <div className="h-72 w-72 bg-pink-900 rounded-full absolute -top-10 blur-3xl -left-10"></div>
        <div className="h-72 w-72 bg-green-900 rounded-full absolute bottom-0 blur-3xl right-0 z-1"></div>
      <div className="absolute top-5 right-5">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full shadow-md transition duration-300 
          bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-500" />}
        </button>
      </div>

      <h1 className="text-8xl font-bold animate-bounce z-10">404</h1>
      <p className="text-xl mt-4 z-10">Oops! The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 z-10"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
