export function UploadOverlay({
  progress,
  showSuccess,
}: {
  progress: number;
  showSuccess: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-11/12 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {showSuccess ? (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-green-600">
              Upload Successful!
            </h2>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-center text-xl font-semibold">
              Uploading
            </h2>
            <div className="mb-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-4 rounded-full bg-blue-600 transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm font-medium">{progress}%</p>
          </>
        )}
      </div>
    </div>
  );
}
