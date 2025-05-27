import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import HabitList from '../components/habits/HabitList';
import StatsDashboard from '../components/habits/StatsDashboard';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Overall Stats
          </Typography>
          <StatsDashboard allHabits={true} />
        </Box>
        
        <HabitList />
      </Box>
    </motion.div>
  );
};

export default Dashboard;