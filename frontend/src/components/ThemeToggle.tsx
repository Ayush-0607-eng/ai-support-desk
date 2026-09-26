import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className="relative w-14 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400">
      <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-violet-600 shadow-md flex items-center justify-center transition-transform duration-300 ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}>
        {theme === "dark" ? <Moon size={14} className="text-violet-200" /> : <Sun size={14} className="text-violet-600" />}
      </span>
    </button>
  );
};

export default ThemeToggle;
