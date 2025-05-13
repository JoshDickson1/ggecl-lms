import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";

const InstructorHomeSkeleton: React.FC = () => {
  return (
    <div className="p-4 whitespace-nowrap">
      {/* Stats Section Skeleton */}
      <div className="p-4">
        {/* First Row Skeleton */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              className="flex flex-row items-center gap-4 border shadow-md rounded-md p-3"
              whileHover={{ scale: 1.05 }}
            >
              <div>
                <Skeleton circle height={40} width={40} />
              </div>
              <div className="whitespace-normal text-gray-700 dark:text-gray-300">
                <Skeleton height={24} width={50} />
                <Skeleton height={16} width={80} className="mt-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Second Row Skeleton */}
        <div className="mt-4 grid grid-cols-1 gap-4 whitespace-normal sm:grid-cols-2 md:grid-cols-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              className="flex flex-row items-center gap-4 border shadow-md rounded-md p-3 whitespace-normal"
              whileHover={{ scale: 1.05 }}
            >
              <div>
                <Skeleton circle height={40} width={40} />
              </div>
              <div className="whitespace-normal text-gray-700 dark:text-gray-300">
                <Skeleton height={24} width={50} />
                <Skeleton height={16} width={80} className="mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile Section Skeleton */}
      <div className="mt-10 flex min-h-32 w-full flex-col items-center justify-start gap-6 bg-gray-800 px-6 py-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton circle height={64} width={64} />
          <div>
            <Skeleton height={24} width={150} />
            <Skeleton height={16} width={200} className="mt-1" />
          </div>
        </div>
        <Skeleton height={40} width={100} className="btn rounded-md" />
      </div>
    </div>
  );
};

export default InstructorHomeSkeleton;
