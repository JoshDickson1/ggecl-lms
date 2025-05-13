import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

function SearchBar({ show = false, placeholderText = "Search for anything..." }) {
  return (
    <section
      id="search"
      className={cn("relative hidden md:block", show && "block")}
    >
      <input
        type="text"
        placeholder={placeholderText}
        title="Press Enter to search"
        aria-label="Search courses"
        className="w-full lg:w-[34rem] max-w-xl px-4 md:py-2 py-3 pl-10 rounded-md  bg-transparent border border-gray-500/30 dark:border-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      />
      <Search
        size={18}
        className="absolute top-1/2 left-3 -translate-y-1/2 dark:text-blue-300/40 text-gray-500"
      />
    </section>
  );
}

export default SearchBar;
