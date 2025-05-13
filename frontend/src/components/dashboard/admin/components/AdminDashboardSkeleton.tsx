import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";

const AdminDashboardSkeleton: React.FC = () => {
  const skeletonCards = Array.from({ length: 3 });

  return (
    <div className="min-h-screen bg-gray-100 p-6 transition-all dark:bg-gray-900">
      {/* Skeleton Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {skeletonCards.map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            {/* Icon placeholder */}
            <div>
              <Skeleton
                circle
                height={32}
                width={32}
                baseColor="#e2e8f0"
                highlightColor="#cbd5e1"
              />
            </div>
            {/* Text placeholders */}
            <div className="flex flex-col space-y-2">
              {/* Value placeholder */}
              <Skeleton
                height={24}
                width={64}
                baseColor="#e2e8f0"
                highlightColor="#cbd5e1"
              />
              {/* Title placeholder */}
              <Skeleton
                height={16}
                width={96}
                baseColor="#e2e8f0"
                highlightColor="#cbd5e1"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
