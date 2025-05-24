import { FaStar } from "react-icons/fa";

interface RatingProps {
  overallRating: number;
  ratingsDistribution: { stars: number; percentage: number }[];
}

const CourseRating: React.FC<RatingProps> = ({
  overallRating,
  ratingsDistribution,
}) => {
  return (
    <div className="mt-6 bg-white dark:bg-gray-900 shadow-md p-4 rounded-md w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Overall Course Rating
        </h3>
        <span className="text-gray-500 text-sm">This week</span>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mt-3 flex flex-col items-center">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {overallRating}
        </p>
        <div className="flex text-yellow-500 mt-1">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <FaStar
                key={index}
                className={index < Math.round(overallRating) ? "text-yellow-500" : "text-gray-400"}
              />
            ))}
        </div>
        <p className="text-gray-500 text-sm">Overall Rating</p>
      </div>

      <div className="mt-4 space-y-2">
        {ratingsDistribution.map(({ stars, percentage }) => (
          <div key={stars} className="flex items-center gap-2">
            <div className="flex text-yellow-500">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < stars ? "text-yellow-500" : "text-gray-400"}
                  />
                ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRating;
