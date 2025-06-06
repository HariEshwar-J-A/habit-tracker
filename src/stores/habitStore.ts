import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Habit, HabitCompletion } from '../types';

interface HabitState {
  habitIds: string[];
  habitEntities: Record<string, Habit>;
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'current_streak' | 'longest_streak'>) => Promise<string>;
  updateHabit: (id: string, habitData: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  getHabitCompletions: (habitId: string, startDate: Date, endDate: Date) => Promise<HabitCompletion[]>;
  calculateStreak: (habitId: string) => Promise<{ currentStreak: number; longestStreak: number }>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habitIds: [],
  habitEntities: {},
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: habits, error } = await supabase
        .from('habits')
        .select(`
          id,
          user_id,
          name,
          description,
          frequency,
          color,
          reminder_enabled,
          reminder_time,
          target,
          current_streak,
          longest_streak,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const habitIds = habits?.map(habit => habit.id) || [];
      const habitEntities = habits?.reduce((acc, habit) => {
        acc[habit.id] = habit;
        return acc;
      }, {} as Record<string, Habit>) || {};

      set({ habitIds, habitEntities, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      set({ error: 'Failed to fetch habits', isLoading: false });
      throw error;
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      const { habitIds, habitEntities } = get();
      set({
        habitIds: [data.id, ...habitIds],
        habitEntities: {
          ...habitEntities,
          [data.id]: data
        },
        isLoading: false
      });

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
      const { data, error } = await supabase
        .from('habits')
        .update({
          ...habitData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update');

      const { habitEntities } = get();
      set({
        habitEntities: {
          ...habitEntities,
          [id]: data
        },
        isLoading: false
      });
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

      const { habitIds, habitEntities } = get();
      const newEntities = { ...habitEntities };
      delete newEntities[id];

      set({
        habitIds: habitIds.filter(habitId => habitId !== id),
        habitEntities: newEntities,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      set({ error: 'Failed to delete habit', isLoading: false });
      throw error;
    }
  },

  toggleHabitCompletion: async (habitId, date) => {
    const { habitEntities } = get();
    const originalHabit = { ...habitEntities[habitId] };
    let optimisticComplete = true;

    try {
      const { data: existing, error: checkError } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', date)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        optimisticComplete = false;
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('habit_completions')
          .insert([{
            habit_id: habitId,
            date,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      // Calculate new streak values
      const { currentStreak, longestStreak } = await get().calculateStreak(habitId);

      // Update the habit with new streak values
      const { data: updatedHabit, error: updateError } = await supabase
        .from('habits')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updatedHabit) throw new Error('No data returned from update');

      // Update only the specific habit in the store
      set(state => ({
        habitEntities: {
          ...state.habitEntities,
          [habitId]: updatedHabit
        }
      }));
    } catch (error) {
      // Revert to original habit state on error
      set(state => ({
        habitEntities: {
          ...state.habitEntities,
          [habitId]: originalHabit
        }
      }));
      console.error('Failed to toggle habit completion:', error);
      throw error;
    }
  },

  getHabitCompletions: async (habitId, startDate, endDate) => {
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_completions')
        .select('id, habit_id, date, created_at')
        .eq('habit_id', habitId)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate)
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