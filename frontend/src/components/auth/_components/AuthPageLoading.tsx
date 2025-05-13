import logo from "@/assets/images/LOGO-dark.png";
import logoWhite from "@/assets/images/LOGO.png";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

function AuthPageLoading({ className }: { className?: string }) {
  const { darkMode } = useTheme();
  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm",
        className,
      )}
    >
      <img
        src={darkMode ? logoWhite : logo}
        alt="GGECL"
        className="h-12 w-12 animate-spin"
      />
    </div>
  );
}

export default AuthPageLoading;
