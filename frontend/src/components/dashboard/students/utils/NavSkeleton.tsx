import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Import default styles
import { FaBell, FaChevronDown } from "react-icons/fa";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/SearchBar"; // Assuming SearchBar doesn't need admin data
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme"; // Needed to show correct theme icon placeholder

const NavSkeleton = () => {
  // We still need theme for the static theme toggle button's icon
  const { darkMode } = useTheme();
  // We need sidebar state and mobile status for the trigger logic
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const shouldShowSidebarTrigger = state === "collapsed" || isMobile;

  // You might want to adjust baseColor/highlightColor based on your theme
  const skeletonBaseColor = darkMode ? "#2D3748" : "#E2E8F0"; // Dark: gray-700, Light: gray-200
  const skeletonHighlightColor = darkMode ? "#4A5568" : "#F7FAFC"; // Dark: gray-600, Light: gray-100

  return (
    <SkeletonTheme
      baseColor={skeletonBaseColor}
      highlightColor={skeletonHighlightColor}
    >
      <nav
        className={cn(
          "bg-background text-foreground flex items-center justify-between border-b px-6 py-4",
          "shadow-sm dark:border-gray-800",
        )}
      >
        {/* Left Side: Sidebar Trigger */}
        <div className="flex items-center gap-4">
          {shouldShowSidebarTrigger && (
            <>
              {/* Keep static parts */}
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          {/* Optional: Add a skeleton for a logo/title if you have one here */}
        </div>

        {/* Right Side: Search, Icons, User Menu */}
        <div className="flex items-center gap-4">
          {/* SearchBar (assuming it's static or handles its own loading) */}
          <SearchBar placeholderText="Search courses..." />

          {/* Notification Bell Skeleton */}
          <Button variant="ghost" size="icon" className="relative" disabled>
            <FaBell className="h-[1.2rem] w-[1.2rem]" />
            {/* Omit the notification count badge during loading */}
          </Button>

          {/* Theme Toggle Skeleton (shows correct icon based on theme) */}
          <Button
            variant="ghost"
            size="icon"
            className="border"
            aria-label="Toggle theme"
            disabled // Disable interaction while loading
          >
            {darkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {/* User Dropdown Skeleton */}
          <Button variant="ghost" className="gap-2 p-6" disabled>
            {/* Avatar Skeleton */}
            <Skeleton circle={true} height={32} width={32} />
            {/* Name and Email Skeleton */}
            <div className="hidden flex-col items-start md:flex">
              <span className="text-sm font-medium">
                <Skeleton width={100} height={14} /> {/* Approx Name height */}
              </span>
              <span className="text-muted-foreground mt-1 text-xs">
                {" "}
                {/* Added mt-1 for spacing */}
                <Skeleton width={150} height={10} /> {/* Approx Email height */}
              </span>
            </div>
            <FaChevronDown className="ml-2 h-4 w-4 text-gray-400" />{" "}
            {/* Static Icon */}
          </Button>
        </div>
      </nav>
    </SkeletonTheme>
  );
};

export default NavSkeleton;
