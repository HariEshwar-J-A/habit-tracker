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
  useTheme,
  useMediaQuery
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
  const { habits, fetchHabits, deleteHabit } = useHabitStore();
  
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const loadHabit = async () => {
      if (!id) {
        navigate('/', { replace: true });
        return;
      }

      setLoading(true);
      try {
        await fetchHabits();
        const foundHabit = habits.find(h => h.id === id);
        
        if (foundHabit) {
          setHabit(foundHabit);
        } else {
          navigate('/', { replace: true });
          toast.error('Habit not found');
        }
      } catch (error) {
        console.error('Failed to load habit:', error);
        toast.error('Failed to load habit');
        navigate('/', { replace: true });
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto'
          }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ mr: 1 }}
              edge={isMobile ? 'start' : false}
            >
              <ArrowLeft />
            </IconButton>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
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
            justifyContent: isMobile ? 'flex-end' : 'flex-start'
          }}>
            <IconButton onClick={handleEditClick} color="primary">
              <Edit2 size={20} />
            </IconButton>
            <IconButton onClick={handleDeleteClick} color="error">
              <Trash2 size={20} />
            </IconButton>
          </Box>
        </Box>
        
        {habit.description && (
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: theme.palette.text.secondary,
              px: isMobile ? 1 : 0
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
            mb: 3,
            mx: isMobile ? 1 : 0
          }}
        >
          <Typography variant="body2">
            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} habit
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4, px: isMobile ? 1 : 0 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Stats
          </Typography>
          <StatsDashboard habit={habit} />
        </Box>
        
        <Box sx={{ mb: 4, px: isMobile ? 1 : 0 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            History
          </Typography>
          <Box sx={{ 
            overflowX: 'auto',
            mx: isMobile ? -2 : 0,
            px: isMobile ? 2 : 0
          }}>
            <StreakCalendarHeatmap habitId={habit.id} />
          </Box>
        </Box>
      </Box>
      
      {/* Edit Dialog */}
      <EditHabitDialog
        open={editDialogOpen}
        habit={habit}
        onClose={handleEditDialogClose}
      />
      
      {/* Delete Confirmation Dialog */}
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