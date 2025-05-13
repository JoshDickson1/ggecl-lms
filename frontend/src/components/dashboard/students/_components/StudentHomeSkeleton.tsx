import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const StudentHomeSkeleton: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      {/* Header */}
      <header className="space-y-1">
        <Skeleton height={36} width={300} />
        <Skeleton height={20} width={400} />
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Learning Progress Card */}
        <div className="rounded border shadow md:col-span-2">
          <div className="border-b p-4">
            <Skeleton height={24} width={150} />
          </div>
          <div className="space-y-6 p-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton height={16} width={150} />
                <Skeleton height={16} width={40} />
              </div>
              <Skeleton height={8} width="100%" />
            </div>

            <div className="my-2">
              <Skeleton height={1} width="100%" />
            </div>

            {/* Enrolled Courses Section */}
            <div className="space-y-4">
              <Skeleton height={20} width={120} />
              {Array.from({ length: 1 }).map((_, index) => (
                <div key={index} className="rounded border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton height={20} width={200} />
                      <div className="mt-1 flex gap-4">
                        <Skeleton height={16} width={80} />
                        <Skeleton height={16} width={80} />
                      </div>
                    </div>
                    <Skeleton height={20} width={50} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Schedule Card */}
          <div className="rounded border shadow">
            <div className="border-b p-4">
              <Skeleton height={24} width={100} />
            </div>
            <div className="p-4">
              {/* Placeholder for Calendar */}
              <Skeleton height={200} width="100%" />
            </div>
          </div>

          {/* Upcoming Lessons Card */}
          <div className="rounded border shadow">
            <div className="border-b p-4">
              <Skeleton height={24} width={150} />
            </div>
            <div className="space-y-4 p-4">
              {Array.from({ length: 1 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded p-2"
                >
                  <div>
                    <Skeleton height={16} width={120} />
                    <Skeleton height={12} width={100} className="mt-1" />
                  </div>
                  <Skeleton height={30} width={60} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Overview Card */}
      <div className="rounded border shadow">
        <div className="border-b p-4">
          <Skeleton height={24} width={120} />
        </div>
        <div className="grid gap-6 p-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton height={20} width={100} />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded p-2"
                >
                  <Skeleton height={16} width={150} />
                  <Skeleton height={16} width={80} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomeSkeleton;
