import { useState } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import HabitList from '../components/habits/HabitList';
import StatsDashboard from '../components/habits/StatsDashboard';
import AddHabitDialog from '../components/habits/AddHabitDialog';

const Dashboard = () => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

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
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenDialog}
          >
            Add Habit
          </Button>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Overall Stats
          </Typography>
          <StatsDashboard allHabits={true} />
        </Box>
        
        <HabitList />
      </Box>
      
      <AddHabitDialog open={dialogOpen} onClose={handleCloseDialog} />
    </motion.div>
  );
};

export default Dashboard;