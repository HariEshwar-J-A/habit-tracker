import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl,
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  FormControlLabel, 
  Switch, 
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useHabitStore } from '../../stores/habitStore';
import { Habit } from '../../types';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

const colorOptions = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Orange', value: '#ff9800' },
  { name: 'Red', value: '#f44336' },
  { name: 'Teal', value: '#009688' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Amber', value: '#ffc107' },
  { name: 'Indigo', value: '#3f51b5' },
  { name: 'Cyan', value: '#00bcd4' },
];

interface EditHabitDialogProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  color: string;
  reminder_enabled: boolean;
  reminder_time: string;
  target: number;
}

const initialFormState: FormState = {
  name: '',
  description: '',
  frequency: 'daily',
  color: '#1976d2',
  reminder_enabled: false,
  reminder_time: '',
  target: 1
};

const EditHabitDialog = ({ open, habit, onClose }: EditHabitDialogProps) => {
  const theme = useTheme();
  const { updateHabit } = useHabitStore();
  
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5 });
  const [playError] = useSound('/sounds/error.mp3', { volume: 0.5 });
  
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFormState(initialFormState);
      setError('');
      return;
    }

    if (habit) {
      setFormState({
        name: habit.name,
        description: habit.description || '',
        frequency: habit.frequency,
        color: habit.color,
        reminder_enabled: habit.reminder_enabled,
        reminder_time: habit.reminder_time || '',
        target: habit.target
      });
      setError('');
    }
  }, [habit, open]);

  const handleInputChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent
  ) => {
    const value = event.target.value;

    console.log("Inside handle input change function", {[field]: field === 'target' ? Math.max(1, Number(value)) : value});
    
    setFormState(prev => ({
      ...prev,
      [field]: field === 'target' ? Math.max(1, Number(value)) : value
    }));
  };

  const handleReminderToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setFormState(prev => ({
      ...prev,
      "reminder_enabled": checked,
      "reminder_time": checked ? prev.reminder_time || '12:00' : ''
    }));
  };

  const handleSubmit = async () => {
    if (!habit) return;
    
    if (!formState.name.trim()) {
      setError('Please enter a habit name');
      playError();
      return;
    }

    if (formState.reminder_enabled && !formState.reminder_time) {
      setError('Please set a reminder time');
      playError();
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await updateHabit(habit.id, {
        name: formState.name.trim(),
        description: formState.description.trim(),
        frequency: formState.frequency,
        color: formState.color,
        reminder_enabled: formState.reminder_enabled,
        reminder_time: formState.reminder_enabled ? formState.reminder_time : null,
        target: formState.target
      });
      
      playSuccess();
      toast.success('Habit updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update habit:', error);
      setError('Failed to update habit. Please try again.');
      playError();
      toast.error('Failed to update habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormState(initialFormState);
    setError('');
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Habit</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Habit Name"
            value={formState.name}
            onChange={handleInputChange('name')}
            fullWidth
            required
            error={error.includes('name')}
          />
          
          <TextField
            label="Description (optional)"
            value={formState.description}
            onChange={handleInputChange('description')}
            fullWidth
            multiline
            rows={2}
          />
          
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={formState.frequency}
              label="Frequency"
              onChange={handleInputChange('frequency')}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Target (times per period)"
            type="number"
            value={formState.target}
            onChange={handleInputChange('target')}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={formState.color}
              label="Color"
              onChange={handleInputChange('color')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: selected }} />
                  <Typography>
                    {colorOptions.find(option => option.value === selected)?.name || 'Custom'}
                  </Typography>
                </Box>
              )}
            >
              {colorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: option.value }} />
                    <Typography>{option.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ 
            p: 3, 
            bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.reminder_enabled}
                  onChange={handleReminderToggle}
                  color="primary"
                />
              }
              label="Enable reminder"
              sx={{ mb: formState.reminder_enabled ? 2 : 0 }}
            />
            
            {formState.reminder_enabled && (
              <TextField
                label="Reminder Time"
                type="time"
                value={formState.reminder_time}
                onChange={handleInputChange('reminder_time')}
                fullWidth
                required
                error={!formState.reminder_time}
                helperText={!formState.reminder_time ? 'Please set a reminder time' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHabitDialog;