import { create } from 'zustand';
import { Theme } from '@mui/material/styles';
import { db } from '../db/db';
import { themes, getDefaultTheme } from '../theme';
import { ThemePreference } from '../types';

interface ThemeState {
  theme: Theme;
  themeMode: 'light' | 'dark';
  themeColor: string;
  setTheme: (mode: 'light' | 'dark', color: string) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getDefaultTheme(),
  themeMode: 'light',
  themeColor: 'blue',

  setTheme: async (mode: 'light' | 'dark', color: string) => {
    // Update the theme in IndexedDB
    await db.settings.update(1, {
      themeMode: mode,
      themeColor: color,
      updatedAt: new Date()
    });

    // Update the theme in the store
    const newTheme = themes[mode][color as keyof typeof themes.light] || getDefaultTheme();
    
    set({
      theme: newTheme,
      themeMode: mode,
      themeColor: color
    });
  },

  initializeTheme: async () => {
    try {
      // Try to get the theme from IndexedDB
      const storedTheme = await db.settings.get(1);
      
      // If no theme is stored, create a default one
      if (!storedTheme) {
        const defaultTheme: ThemePreference = {
          id: 1,
          themeMode: 'light',
          themeColor: 'blue',
          updatedAt: new Date()
        };
        
        await db.settings.add(defaultTheme);
        
        set({
          theme: getDefaultTheme(),
          themeMode: 'light',
          themeColor: 'blue'
        });
        
        return;
      }
      
      // Set the theme from the stored preference
      const mode = storedTheme.themeMode;
      const color = storedTheme.themeColor;
      const themeToUse = themes[mode][color as keyof typeof themes.light] || getDefaultTheme();
      
      set({
        theme: themeToUse,
        themeMode: mode,
        themeColor: color
      });
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      set({
        theme: getDefaultTheme(),
        themeMode: 'light',
        themeColor: 'blue'
      });
    }
  }
}));