import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InstructorCardSkeleton = () => {
  return (
    <div className="w-[280px] rounded-2xl p-4 shadow-md">
      {/* Image */}
      <Skeleton height={180} borderRadius="0.75rem" />

      <div className="mt-4 space-y-2">
        {/* Name */}
        <Skeleton width="70%" height={20} />

        {/* Title */}
        <Skeleton width="50%" height={16} />
      </div>

      <hr className="my-4 border-[#2A2F45]" />

      {/* Rating & students */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width={20} height={20} borderRadius="50%" />
          <Skeleton width={40} height={16} />
        </div>
        <Skeleton width={80} height={16} />
      </div>
    </div>
  );
};

export default InstructorCardSkeleton;
