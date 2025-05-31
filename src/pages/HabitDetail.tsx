import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../stores/habitStore';
import StreakCalendarHeatmap from '../components/habits/StreakCalendarHeatmap';
import StatsDashboard from '../components/habits/StatsDashboard';
import EditHabitDialog from '../components/habits/EditHabitDialog';
import { toast } from 'react-toastify';

const HabitDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habitEntities, deleteHabit } = useHabitStore();
  
  const [habit, setHabit] = useState(id ? habitEntities[id] : null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true });
      return;
    }

    const currentHabit = habitEntities[id];
    if (currentHabit) {
      setHabit(currentHabit);
    } else {
      navigate('/', { replace: true });
      toast.error('Habit not found');
    }
  }, [id, habitEntities, navigate]);
  
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
      toast.success('Habit deleted successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
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
      <Box sx={{ 
        mb: 4,
        mx: isMobile ? -2 : 0
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: isMobile ? 2 : 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: isMobile ? 0 : 2
          }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 2,
            mb: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%'
            }}>
              <IconButton 
                onClick={() => navigate('/')} 
                sx={{ mr: 1 }}
                edge="start"
              >
                <ArrowLeft />
              </IconButton>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                component="h1"
                sx={{ 
                  flex: 1,
                  wordBreak: 'break-word'
                }}
              >
                {habit.name}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex',
              gap: 1,
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'flex-end'
            }}>
              <Button
                startIcon={<Edit2 size={18} />}
                onClick={handleEditClick}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
              >
                Edit
              </Button>
              <Button
                startIcon={<Trash2 size={18} />}
                onClick={handleDeleteClick}
                variant="outlined"
                color="error"
                size={isMobile ? 'small' : 'medium'}
              >
                Delete
              </Button>
            </Box>
          </Box>

          {habit.description && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: theme.palette.text.secondary
              }}
            >
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
        </Paper>
      </Box>
      
      <EditHabitDialog
        open={editDialogOpen}
        habit={habit}
        onClose={handleEditDialogClose}
      />
      
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteDialogClose}
        fullWidth
        maxWidth="xs"
      >
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