import { Box, Typography, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import StatsDashboard from '../components/habits/StatsDashboard';

const Statistics = () => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Statistics
        </Typography>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            mb: 4
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Overall Performance
          </Typography>
          <StatsDashboard allHabits={true} />
        </Paper>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Habit Streaks
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Maintaining a streak helps build habits faster. Your longest streaks indicate your most consistent habits.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              Tips for maintaining streaks:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Set a specific time of day for your habit
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Stack new habits onto existing routines
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Start with small, achievable targets
              </Typography>
              <Typography component="li" variant="body2">
                Enable reminders for important habits
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Statistics;