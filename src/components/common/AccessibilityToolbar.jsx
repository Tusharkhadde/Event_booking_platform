// src/components/common/AccessibilityToolbar.jsx
import { Type, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAccessibilityStore from '@/store/accessibilityStore';
import { cn } from '@/utils/cn';

function AccessibilityToolbar() {
  const { fontScale, highContrast, setFontScale, toggleHighContrast } =
    useAccessibilityStore();

  const normalClass = getFontButtonClass(fontScale === 'normal');
  const largeClass = getFontButtonClass(fontScale === 'large');
  const contrastClass = getContrastButtonClass(highContrast);

  const handleNormalFont = () => {
    setFontScale('normal');
  };

  const handleLargeFont = () => {
    setFontScale('large');
  };

  const handleToggleContrast = () => {
    toggleHighContrast();
  };

  return (
    <div className="flex items-center gap-1">
      {/* Font size buttons */}
      <div className="flex rounded-md border bg-muted/40">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={normalClass}
          onClick={handleNormalFont}
          aria-label="Normal font size"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={largeClass}
          onClick={handleLargeFont}
          aria-label="Large font size"
        >
          <span className="text-xs font-semibold">A+</span>
        </Button>
      </div>

      {/* High contrast toggle */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={contrastClass}
        onClick={handleToggleContrast}
        aria-label="Toggle high contrast mode"
      >
        <Contrast className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getFontButtonClass(isActive) {
  let baseClass =
    'h-8 w-8 rounded-none border-r last:border-r-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  if (isActive) {
    return cn(baseClass, 'bg-primary text-primary-foreground');
  }
  return cn(baseClass, 'text-muted-foreground');
}

function getContrastButtonClass(isActive) {
  let baseClass =
    'h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  if (isActive) {
    return cn(baseClass, 'bg-yellow-500 text-black');
  }
  return cn(baseClass, 'text-muted-foreground');
}

export default AccessibilityToolbar;