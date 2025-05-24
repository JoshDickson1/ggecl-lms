import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const LoginPopup = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let interval: NodeJS.Timeout;

    if (!isPaused) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            setVisible(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 200);
    }

    return () => clearInterval(interval);
  }, [isPaused, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-5 md:right-5 right-2 md:left-[70%] md:w-max w-[97%] bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Student Login Page:</h2>
            <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-red-500">
              <FaTimes />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Please proceed to login with your student credentials.
          </p>

          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-gray-300 rounded-md overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
              className="h-full bg-blue-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPopup;
