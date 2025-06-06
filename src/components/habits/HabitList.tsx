import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button, CircularProgress, useTheme } from '@mui/material';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import HabitItem from './HabitItem';
import AddHabitDialog from './AddHabitDialog';

const HabitList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { habitIds, habitEntities, isLoading, fetchHabits } = useHabitStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleHabitClick = (habitId: string) => {
    navigate(`/habit/${habitId}`);
  };

  // Animation variants for the list
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          My Habits
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

      {habitIds.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No habits yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start tracking your habits by adding your first one!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenDialog}
          >
            Add Your First Habit
          </Button>
        </Box>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <Grid container spacing={2}>
            {habitIds.map((habitId) => (
              <Grid item xs={12} sm={6} md={4} key={habitId}>
                <motion.div variants={item}>
                  <HabitItem 
                    habit={habitEntities[habitId]} 
                    onClick={() => handleHabitClick(habitId)} 
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      <AddHabitDialog open={dialogOpen} onClose={handleCloseDialog} />
    </Box>
  );
};

export default HabitList;