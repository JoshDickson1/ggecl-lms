import { Moon, Sun } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useTheme } from "../hooks/useTheme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">

      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        thumbIcon={isDark ? <Moon size={12} color="#6b8cff" /> : <Sun size={12} color="#f59e0b" />}
      />
    </div>
  );
}