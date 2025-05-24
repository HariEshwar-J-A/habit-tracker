// Habit type definition
export interface Habit {
  id?: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number; // Number of times to complete in the frequency period
  daysOfWeek?: number[]; // For custom frequency (0 = Sunday, 6 = Saturday)
  reminderTime?: string; // Time for reminder notification (HH:MM format)
  reminderEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  currentStreak: number;
  longestStreak: number;
}

// Habit completion record
export interface HabitCompletion {
  id?: number;
  habitId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  value?: number; // For habits with quantity (e.g., drink 8 glasses of water)
  notes?: string;
  createdAt: Date;
}

// Theme preferences
export interface ThemePreference {
  id: number;
  themeMode: 'light' | 'dark';
  themeColor: string; // One of the predefined color options
  updatedAt: Date;
}

// Stats for a habit
export interface HabitStats {
  habitId: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // Percentage of days completed
  totalCompletions: number;
  bestMonth?: { month: number; year: number; count: number };
  bestWeek?: { weekStart: string; count: number };
}