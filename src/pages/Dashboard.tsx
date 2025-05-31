import { Box, useTheme } from '@mui/material';
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
        <Box sx={{ mb: 4 }}>
          <StatsDashboard allHabits={true} />
        </Box>
        
        <HabitList />
      </Box>
    </motion.div>
  );
};

export default Dashboard;