export type Theme = 'light' | 'dark' | 'system';

export const applyTheme = (theme: Theme) => {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  document.documentElement.classList.toggle('dark', isDark);
  
  if (theme === 'system') {
    localStorage.removeItem('theme');
  } else {
    localStorage.setItem('theme', theme);
  }
};

export const getCurrentTheme = (): Theme => {
  if (typeof localStorage === 'undefined') return 'system';
  return localStorage.getItem('theme') as Theme || 'system';
};
