const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0f1d]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;