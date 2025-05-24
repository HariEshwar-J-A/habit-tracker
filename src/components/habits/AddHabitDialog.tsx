import { useState } from 'react';
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
  Stack,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useHabitStore } from '../../stores/habitStore';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

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

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddHabitDialog = ({ open, onClose }: AddHabitDialogProps) => {
  const theme = useTheme();
  const { addHabit } = useHabitStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [color, setColor] = useState('#1976d2');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('12:00');
  const [target, setTarget] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sound effects
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5 });
  const [playError] = useSound('/sounds/error.mp3', { volume: 0.5 });
  
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
    setError('');
    
    if (!name.trim()) {
      setError('Please enter a habit name');
      playError();
      return;
    }

    if (reminderEnabled && !reminderTime) {
      setError('Please set a reminder time');
      playError();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addHabit({
        name,
        description,
        frequency,
        color,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        target
      });
      
      playSuccess();
      toast.success('Habit created successfully!');
      
      // Reset form and close dialog
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add habit:', error);
      setError('Failed to add habit. Please try again.');
      playError();
      toast.error('Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setFrequency('daily');
    setColor('#1976d2');
    setReminderEnabled(false);
    setReminderTime('12:00');
    setTarget(1);
    setError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Habit</DialogTitle>
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
          
          <Box sx={{ 
            p: 3, 
            bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminderEnabled}
                  onChange={handleReminderToggle}
                  color="primary"
                />
              }
              label="Enable reminder"
              sx={{ mb: reminderEnabled ? 2 : 0 }}
            />
            
            {reminderEnabled && (
              <TextField
                label="Reminder Time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                fullWidth
                required
                error={!reminderTime}
                helperText={!reminderTime ? 'Please set a reminder time' : ''}
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
          {isSubmitting ? 'Adding...' : 'Add Habit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHabitDialog;