import Dexie, { Table } from 'dexie';
import { Habit, HabitCompletion, ThemePreference } from '../types';

// Define the database schema
class HabitTrackerDB extends Dexie {
  habits!: Table<Habit>;
  completions!: Table<HabitCompletion>;
  settings!: Table<ThemePreference>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits: '++id, name, createdAt, updatedAt',
      completions: '++id, habitId, date, [habitId+date]',
      settings: 'id, themeMode, themeColor, updatedAt'
    });
  }
}

// Initialize the database
export const db = new HabitTrackerDB();

// Create a default theme preference if none exists
export const initializeDefaultSettings = async () => {
  const settingsCount = await db.settings.count();
  
  if (settingsCount === 0) {
    await db.settings.add({
      id: 1,
      themeMode: 'light',
      themeColor: 'blue',
      updatedAt: new Date()
    });
  }
};