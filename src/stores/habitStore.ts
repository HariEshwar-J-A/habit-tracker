import { create } from 'zustand';
import { db } from '../db/db';
import { Habit, HabitCompletion } from '../types';

// Mock data for initial state
const mockHabits: Habit[] = [
  {
    id: 1,
    name: 'Morning Meditation',
    description: 'Start the day with 10 minutes of mindfulness',
    frequency: 'daily',
    color: '#1976d2',
    reminderEnabled: true,
    reminderTime: '08:00',
    target: 1,
    currentStreak: 5,
    longestStreak: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Exercise',
    description: 'At least 30 minutes of physical activity',
    frequency: 'daily',
    color: '#4caf50',
    reminderEnabled: true,
    reminderTime: '17:00',
    target: 1,
    currentStreak: 3,
    longestStreak: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

const mockCompletions: HabitCompletion[] = [
  {
    id: 1,
    habitId: 1,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date()
  },
  {
    id: 2,
    habitId: 2,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date()
  }
];

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak'>) => Promise<number>;
  updateHabit: (id: number, habitData: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  toggleHabitCompletion: (habitId: number, date: string) => Promise<void>;
  getHabitCompletions: (habitId: number, startDate: Date, endDate: Date) => Promise<HabitCompletion[]>;
  calculateStreak: (habitId: number) => Promise<{ currentStreak: number, longestStreak: number }>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: mockHabits,
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use mock data instead of DB call
      set({ habits: mockHabits, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      set({ error: 'Failed to fetch habits', isLoading: false });
    }
  },

  addHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date();
      const newId = Math.max(...mockHabits.map(h => h.id || 0)) + 1;
      
      const habit: Habit = {
        ...habitData,
        id: newId,
        createdAt: now,
        updatedAt: now,
        currentStreak: 0,
        longestStreak: 0
      };
      
      mockHabits.push(habit);
      await get().fetchHabits();
      
      return newId;
    } catch (error) {
      console.error('Failed to add habit:', error);
      set({ error: 'Failed to add habit', isLoading: false });
      throw error;
    }
  },

  updateHabit: async (id, habitData) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockHabits.findIndex(h => h.id === id);
      if (index !== -1) {
        mockHabits[index] = {
          ...mockHabits[index],
          ...habitData,
          updatedAt: new Date()
        };
      }
      await get().fetchHabits();
    } catch (error) {
      console.error('Failed to update habit:', error);
      set({ error: 'Failed to update habit', isLoading: false });
    }
  },

  deleteHabit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const index = mockHabits.findIndex(h => h.id === id);
      if (index !== -1) {
        mockHabits.splice(index, 1);
      }
      await get().fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      set({ error: 'Failed to delete habit', isLoading: false });
    }
  },

  toggleHabitCompletion: async (habitId, date) => {
    try {
      const existingIndex = mockCompletions.findIndex(
        c => c.habitId === habitId && c.date === date
      );
      
      if (existingIndex !== -1) {
        mockCompletions.splice(existingIndex, 1);
      } else {
        const newId = Math.max(...mockCompletions.map(c => c.id || 0)) + 1;
        mockCompletions.push({
          id: newId,
          habitId,
          date,
          createdAt: new Date()
        });
      }
      
      const { currentStreak, longestStreak } = await get().calculateStreak(habitId);
      await get().updateHabit(habitId, { currentStreak, longestStreak });
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
      set({ error: 'Failed to toggle habit completion' });
    }
  },

  getHabitCompletions: async (habitId, startDate, endDate) => {
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      return mockCompletions.filter(completion => 
        completion.habitId === habitId &&
        completion.date >= startDateStr &&
        completion.date <= endDateStr
      );
    } catch (error) {
      console.error('Failed to get habit completions:', error);
      throw error;
    }
  },

  calculateStreak: async (habitId) => {
    try {
      const allCompletions = mockCompletions
        .filter(c => c.habitId === habitId)
        .map(c => c.date);
      
      const completionDates = new Set(allCompletions);
      const today = new Date().toISOString().split('T')[0];
      const isTodayCompleted = completionDates.has(today);
      
      let currentStreak = 0;
      let date = new Date();
      
      if (!isTodayCompleted) {
        date.setDate(date.getDate() - 1);
      }
      
      while (true) {
        const dateStr = date.toISOString().split('T')[0];
        
        if (completionDates.has(dateStr)) {
          currentStreak++;
          date.setDate(date.getDate() - 1);
        } else {
          break;
        }
      }
      
      let longestStreak = 0;
      let currentRun = 0;
      const sortedDates = [...completionDates].sort();
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          currentRun = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          
          prevDate.setDate(prevDate.getDate() + 1);
          
          if (
            prevDate.getFullYear() === currDate.getFullYear() &&
            prevDate.getMonth() === currDate.getMonth() &&
            prevDate.getDate() === currDate.getDate()
          ) {
            currentRun++;
          } else {
            currentRun = 1;
          }
        }
        
        if (currentRun > longestStreak) {
          longestStreak = currentRun;
        }
      }
      
      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('Failed to calculate streak:', error);
      throw error;
    }
  }
}));