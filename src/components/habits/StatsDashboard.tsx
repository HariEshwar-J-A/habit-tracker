import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, useTheme } from '@mui/material';
import { Award, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { Habit } from '../../types';

interface StatsDashboardProps {
  habit?: Habit;
  allHabits?: boolean;
}

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

const StatsDashboard = ({ habit, allHabits = false }: StatsDashboardProps) => {
  const theme = useTheme();
  const { habits, getHabitCompletions } = useHabitStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const calculateStats = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        let calculatedStats: Stats;

        if (allHabits) {
          let totalCompletions = 0;
          let bestStreak = 0;
          let totalCurrentStreak = 0;
          
          const endDate = new Date();
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          
          await Promise.all(habits.map(async (habit) => {
            const completions = await getHabitCompletions(habit.id, startDate, endDate);
            if (mounted) {
              totalCompletions += completions.length;
              bestStreak = Math.max(bestStreak, habit.longest_streak);
              totalCurrentStreak += habit.current_streak;
            }
          }));

          if (!mounted) return;
          
          calculatedStats = {
            totalCompletions,
            currentStreak: Math.round(totalCurrentStreak / Math.max(1, habits.length)),
            longestStreak: bestStreak,
            completionRate: habits.length > 0 
              ? (totalCompletions / (365 * habits.length)) * 100 
              : 0,
          };
        } else if (habit) {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          
          const completions = await getHabitCompletions(habit.id, startDate, endDate);
          
          if (!mounted) return;

          calculatedStats = {
            currentStreak: habit.current_streak,
            longestStreak: habit.longest_streak,
            totalCompletions: completions.length,
            completionRate: (completions.length / 365) * 100,
          };
        } else {
          calculatedStats = {
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            completionRate: 0,
          };
        }

        if (mounted) {
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error('Failed to calculate stats:', error);
        if (mounted) {
          setStats({
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            completionRate: 0,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    calculateStats();

    return () => {
      mounted = false;
    };
  }, [habit, allHabits, habits, getHabitCompletions]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>No stats available</Typography>
      </Box>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color, mr: 1 }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" component="div" fontWeight="medium">
        {value}
      </Typography>
    </Paper>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <motion.div variants={item}>
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              icon={<TrendingUp size={20} />}
              color={theme.palette.primary.main}
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <motion.div variants={item}>
            <StatCard
              title="Longest Streak"
              value={`${stats.longestStreak} days`}
              icon={<Award size={20} />}
              color={theme.palette.secondary.main}
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <motion.div variants={item}>
            <StatCard
              title="Total Completions"
              value={stats.totalCompletions.toString()}
              icon={<CheckCircle size={20} />}
              color={theme.palette.success.main}
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <motion.div variants={item}>
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate.toFixed(1)}%`}
              icon={<Calendar size={20} />}
              color={theme.palette.info.main}
            />
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default StatsDashboard;