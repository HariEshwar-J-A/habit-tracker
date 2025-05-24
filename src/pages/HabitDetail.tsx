import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  useTheme
} from '@mui/material';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../stores/habitStore';
import StreakCalendarHeatmap from '../components/habits/StreakCalendarHeatmap';
import StatsDashboard from '../components/habits/StatsDashboard';
import EditHabitDialog from '../components/habits/EditHabitDialog';

const HabitDetail = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, fetchHabits, deleteHabit } = useHabitStore();
  
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const loadHabit = async () => {
      setLoading(true);
      try {
        await fetchHabits();
        
        // Find the habit with the matching ID
        const habitId = parseInt(id || '0');
        const foundHabit = habits.find(h => h.id === habitId);
        
        if (foundHabit) {
          setHabit(foundHabit);
        } else {
          // Habit not found, redirect to dashboard
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Failed to load habit:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHabit();
  }, [id, fetchHabits, habits, navigate]);
  
  const handleEditClick = () => {
    setEditDialogOpen(true);
  };
  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleConfirmDelete = async () => {
    if (!habit) return;
    
    setDeleting(true);
    try {
      await deleteHabit(habit.id);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete habit:', error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!habit) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Habit not found</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h5" component="h1">
            {habit.name}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <IconButton onClick={handleEditClick} color="primary">
              <Edit2 size={20} />
            </IconButton>
            <IconButton onClick={handleDeleteClick} color="error">
              <Trash2 size={20} />
            </IconButton>
          </Box>
        </Box>
        
        {habit.description && (
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            {habit.description}
          </Typography>
        )}
        
        <Box 
          sx={{ 
            display: 'inline-block', 
            px: 2, 
            py: 1, 
            borderRadius: 1, 
            bgcolor: habit.color, 
            color: 'white',
            mb: 3
          }}
        >
          <Typography variant="body2">
            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} habit
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Stats
          </Typography>
          <StatsDashboard habit={habit} />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            History
          </Typography>
          <StreakCalendarHeatmap habitId={habit.id} />
        </Box>
      </Box>
      
      {/* Edit Dialog */}
      <EditHabitDialog
        open={editDialogOpen}
        habit={habit}
        onClose={handleEditDialogClose}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Habit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the habit "{habit.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default HabitDetail;