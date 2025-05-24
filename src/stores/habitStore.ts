import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Habit, HabitCompletion } from '../types';

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak'>) => Promise<string>;
  updateHabit: (id: string, habitData: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  getHabitCompletions: (habitId: string, startDate: Date, endDate: Date) => Promise<HabitCompletion[]>;
  calculateStreak: (habitId: string) => Promise<{ currentStreak: number; longestStreak: number }>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ habits: habits || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      set({ error: 'Failed to fetch habits', isLoading: false });
    }
  },

  addHabit: async (habitData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{
          ...habitData,
          current_streak: 0,
          longest_streak: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      await get().fetchHabits();
      return data.id;
    } catch (error) {
      console.error('Failed to add habit:', error);
      set({ error: 'Failed to add habit', isLoading: false });
      throw error;
    }
  },

  updateHabit: async (id, habitData) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', id);

      if (error) throw error;

      await get().fetchHabits();
    } catch (error) {
      console.error('Failed to update habit:', error);
      set({ error: 'Failed to update habit', isLoading: false });
      throw error;
    }
  },

  deleteHabit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      set({ error: 'Failed to delete habit', isLoading: false });
      throw error;
    }
  },

  toggleHabitCompletion: async (habitId, date) => {
    try {
      // Check if completion exists
      const { data: existing, error: checkError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', date)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Delete existing completion
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;
      } else {
        // Add new completion
        const { error: insertError } = await supabase
          .from('habit_completions')
          .insert([{ habit_id: habitId, date }]);

        if (insertError) throw insertError;
      }

      // Update streaks
      const { currentStreak, longestStreak } = await get().calculateStreak(habitId);
      await get().updateHabit(habitId, { current_streak: currentStreak, longest_streak: longestStreak });
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
      set({ error: 'Failed to toggle habit completion' });
      throw error;
    }
  },

  getHabitCompletions: async (habitId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get habit completions:', error);
      throw error;
    }
  },

  calculateStreak: async (habitId) => {
    try {
      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('date')
        .eq('habit_id', habitId)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!completions || completions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
      }

      const dates = completions.map(c => new Date(c.date));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = 0;
      let longestStreak = 0;
      let currentRun = 0;

      // Calculate current streak
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (date.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      dates.sort((a, b) => a.getTime() - b.getTime());
      
      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          currentRun = 1;
        } else {
          const prevDate = dates[i - 1];
          const currDate = dates[i];
          
          const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
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