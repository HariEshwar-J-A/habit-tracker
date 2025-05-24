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
  useTheme
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useHabitStore } from '../../stores/habitStore';
import { Habit } from '../../types';

// Color options
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

const EditHabitDialog = ({ open, habit, onClose }: EditHabitDialogProps) => {
  const theme = useTheme();
  const { updateHabit } = useHabitStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [color, setColor] = useState('#1976d2');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [target, setTarget] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Load habit data when the dialog opens
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setFrequency(habit.frequency);
      setColor(habit.color);
      setReminderEnabled(habit.reminderEnabled);
      setReminderTime(habit.reminderTime || '');
      setTarget(habit.target);
      setError('');
    }
  }, [habit]);
  
  const handleFrequencyChange = (event: SelectChangeEvent) => {
    setFrequency(event.target.value as 'daily' | 'weekly' | 'monthly' | 'custom');
  };
  
  const handleColorChange = (event: SelectChangeEvent) => {
    setColor(event.target.value);
  };
  
  const handleReminderToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReminderEnabled(event.target.checked);
  };
  
  const handleSubmit = async () => {
    if (!habit) return;
    
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await updateHabit(habit.id as number, {
        name,
        description,
        frequency,
        color,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        target
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update habit:', error);
      setError('Failed to update habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Habit</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Habit Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={error.includes('name')}
          />
          
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={frequency}
              label="Frequency"
              onChange={handleFrequencyChange}
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
            value={target}
            onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={color}
              label="Color"
              onChange={handleColorChange}
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
          
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminderEnabled}
                  onChange={handleReminderToggle}
                />
              }
              label="Enable reminder"
            />
            
            {reminderEnabled && (
              <TextField
                label="Reminder Time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
                InputLabelProps={{ shrink: true }}
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
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHabitDialog;