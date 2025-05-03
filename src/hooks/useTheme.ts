import { useEffect, useState } from 'react';
import { applyTheme, getCurrentTheme, Theme } from '../theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  useEffect(() => {
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return [theme, setTheme] as const;
};
