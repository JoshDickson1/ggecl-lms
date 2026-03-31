import { Moon, Sun } from "lucide-react"
import { Switch } from "../components/ui/switch"
import { useTheme } from "../hooks/useTheme"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="flex items-center gap-2">
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}

      <Switch
        checked={isDark}
        onCheckedChange={(checked) =>
          setTheme(checked ? "dark" : "light")
        }
      />
    </div>
  )
}