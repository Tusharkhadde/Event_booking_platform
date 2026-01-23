import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useThemeStore from '@/store/themeStore';

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'dark' && <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default ThemeToggle;