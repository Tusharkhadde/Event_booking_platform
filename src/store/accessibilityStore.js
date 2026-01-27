// src/store/accessibilityStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

function applyFontScale(scale) {
  if (scale === 'large') {
    document.documentElement.setAttribute('data-font-scale', 'large');
    return;
  }
  document.documentElement.setAttribute('data-font-scale', 'normal');
}

function applyHighContrast(enabled) {
  if (enabled) {
    document.documentElement.classList.add('high-contrast');
    return;
  }
  document.documentElement.classList.remove('high-contrast');
}

const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      fontScale: 'normal',      // 'normal' | 'large'
      highContrast: false,      // boolean

      setFontScale: (scale) => {
        set({ fontScale: scale });
        applyFontScale(scale);
      },

      toggleHighContrast: () => {
        const current = get().highContrast;
        const next = !current;
        set({ highContrast: next });
        applyHighContrast(next);
      },

      initAccessibility: () => {
        const { fontScale, highContrast } = get();
        applyFontScale(fontScale);
        applyHighContrast(highContrast);
      },
    }),
    {
      name: 'accessibility-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fontScale: state.fontScale,
        highContrast: state.highContrast,
      }),
    }
  )
);

export default useAccessibilityStore;