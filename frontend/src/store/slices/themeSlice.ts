import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('theme') as Theme;
  return saved || 'system';
};

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

const applyThemeToDocument = (resolvedTheme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
};

const initialState: ThemeState = {
  theme: getStoredTheme(),
  resolvedTheme: resolveTheme(getStoredTheme()),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme = resolveTheme(action.payload);
      localStorage.setItem('theme', action.payload);
      applyThemeToDocument(state.resolvedTheme);
    },
    syncSystemTheme: (state) => {
      if (state.theme === 'system') {
        state.resolvedTheme = resolveTheme('system');
        applyThemeToDocument(state.resolvedTheme);
      }
    },
  },
});

// Apply theme on initial load
if (typeof window !== 'undefined') {
  applyThemeToDocument(initialState.resolvedTheme);
}

export const { setTheme, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
