// Habit type definition
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number;
  daysOfWeek?: number[];
  reminder_time?: string | null;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
}

// Habit completion record
export interface HabitCompletion {
  id: string;
  habit_id: string;
  date: string;
  value?: number;
  notes?: string;
  created_at: string;
}

// Theme preferences
export interface ThemePreference {
  id: number;
  themeMode: 'light' | 'dark';
  themeColor: string;
  updatedAt: Date;
}

// Stats for a habit
export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
}