import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const CourseCardSkeleton = () => {
  return (
    <div className="w-[280px] space-y-3 rounded-2xl p-4 shadow-md">
      {/* Image Skeleton */}
      <Skeleton height={130} borderRadius="0.5rem" />

      {/* Title */}
      <Skeleton width="80%" height={20} />

      {/* Instructor */}
      <Skeleton width="60%" height={16} />

      {/* Rating */}
      <div className="flex items-center gap-2">
        <Skeleton width={60} height={14} />
      </div>

      {/* Course info */}
      <Skeleton width="90%" height={16} />
    </div>
  );
};
