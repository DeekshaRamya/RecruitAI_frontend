import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer ${className || ''}`}
        aria-label="Toggle theme"
      >
        <Sun size={15} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer outline-none transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className || ''}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Moon size={15} className="text-indigo-400 transition-transform" />
        ) : theme === 'light' ? (
          <Sun size={15} className="text-amber-500 transition-transform" />
        ) : (
          <Monitor size={15} className="text-slate-500 dark:text-slate-400" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-amber-500" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-indigo-500" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-slate-500" />
            <span>System</span>
          </div>
          {theme === "system" && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
