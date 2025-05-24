import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, useTheme } from '@mui/material';
import { Award, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { Habit, HabitStats } from '../../types';

interface StatsDashboardProps {
  habit?: Habit;
  allHabits?: boolean;
}

const StatsDashboard = ({ habit, allHabits = false }: StatsDashboardProps) => {
  const theme = useTheme();
  const { habits, getHabitCompletions } = useHabitStore();
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      setLoading(true);
      try {
        if (allHabits) {
          // Calculate aggregate stats for all habits
          let totalCompletions = 0;
          let bestStreak = 0;
          let totalCurrentStreak = 0;
          
          // End date is today
          const endDate = new Date();
          // Start date is 1 year ago
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          
          for (const habit of habits) {
            const completions = await getHabitCompletions(habit.id as number, startDate, endDate);
            totalCompletions += completions.length;
            
            if (habit.longestStreak > bestStreak) {
              bestStreak = habit.longestStreak;
            }
            
            totalCurrentStreak += habit.currentStreak;
          }
          
          // Create aggregate stats
          setStats({
            habitId: 0,
            totalCompletions,
            currentStreak: Math.round(totalCurrentStreak / Math.max(1, habits.length)),
            longestStreak: bestStreak,
            completionRate: habits.length > 0 
              ? (totalCompletions / (365 * habits.length)) * 100 
              : 0,
          });
        } else if (habit) {
          // Calculate stats for a single habit
          const endDate = new Date();
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          
          const completions = await getHabitCompletions(habit.id as number, startDate, endDate);
          
          // Group by month
          const monthCounts: Record<string, number> = {};
          let bestMonth = { month: 0, year: 0, count: 0 };
          
          completions.forEach(completion => {
            const date = new Date(completion.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            
            if (!monthCounts[monthKey]) {
              monthCounts[monthKey] = 0;
            }
            
            monthCounts[monthKey]++;
            
            if (monthCounts[monthKey] > bestMonth.count) {
              bestMonth = {
                month: date.getMonth(),
                year: date.getFullYear(),
                count: monthCounts[monthKey]
              };
            }
          });
          
          // Create habit stats
          setStats({
            habitId: habit.id as number,
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak,
            totalCompletions: completions.length,
            completionRate: (completions.length / 365) * 100,
            bestMonth: bestMonth.count > 0 ? bestMonth : undefined
          });
        }
      } catch (error) {
        console.error('Failed to calculate stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateStats();
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

  // Animation variants
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

      {stats.bestMonth && (
        <motion.div variants={item}>
          <Box sx={{ mt: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Best Month
              </Typography>
              <Typography variant="h6">
                {new Date(stats.bestMonth.year, stats.bestMonth.month).toLocaleString('default', { month: 'long' })} {stats.bestMonth.year} 
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  with {stats.bestMonth.count} completions
                </Typography>
              </Typography>
            </Paper>
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatsDashboard;