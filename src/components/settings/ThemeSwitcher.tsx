import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup,
  useTheme 
} from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

// Color options for theme
const colorOptions = [
  { name: 'Blue', value: 'blue' },
  { name: 'Purple', value: 'purple' },
  { name: 'Teal', value: 'teal' },
  { name: 'Amber', value: 'amber' },
  { name: 'Pink', value: 'pink' },
  { name: 'Green', value: 'green' },
  { name: 'Indigo', value: 'indigo' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Deep Purple', value: 'deepPurple' },
];

const ThemeSwitcher = () => {
  const theme = useTheme();
  const { themeMode, themeColor, setTheme } = useThemeStore();
  const [selectedMode, setSelectedMode] = useState<'light' | 'dark'>(themeMode);
  const [selectedColor, setSelectedColor] = useState<string>(themeColor);

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'light' | 'dark';
    setSelectedMode(newMode);
    setTheme(newMode, selectedColor);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setTheme(selectedMode, color);
  };

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Theme Mode
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="theme-mode"
            value={selectedMode}
            onChange={handleModeChange}
          >
            <FormControlLabel 
              value="light" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Sun size={18} style={{ marginRight: '8px' }} />
                  <Typography>Light</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="dark" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Moon size={18} style={{ marginRight: '8px' }} />
                  <Typography>Dark</Typography>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Theme Color
        </Typography>
        
        <Grid container spacing={2}>
          {colorOptions.map((color) => (
            <Grid item key={color.value}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Box
                  onClick={() => handleColorChange(color.value)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: theme.palette.mode === 'light' 
                      ? color.value === 'blue' ? '#1976d2' 
                      : color.value === 'purple' ? '#9c27b0' 
                      : color.value === 'teal' ? '#009688'
                      : color.value === 'amber' ? '#ffb300'
                      : color.value === 'pink' ? '#e91e63'
                      : color.value === 'green' ? '#4caf50'
                      : color.value === 'indigo' ? '#3f51b5'
                      : color.value === 'red' ? '#f44336'
                      : color.value === 'orange' ? '#ff9800'
                      : color.value === 'deepPurple' ? '#673ab7' : '#1976d2'
                      : color.value === 'blue' ? '#90caf9' 
                      : color.value === 'purple' ? '#ce93d8' 
                      : color.value === 'teal' ? '#80cbc4'
                      : color.value === 'amber' ? '#ffe082'
                      : color.value === 'pink' ? '#f48fb1'
                      : color.value === 'green' ? '#a5d6a7'
                      : color.value === 'indigo' ? '#9fa8da'
                      : color.value === 'red' ? '#ef9a9a'
                      : color.value === 'orange' ? '#ffcc80'
                      : color.value === 'deepPurple' ? '#b39ddb' : '#90caf9',
                    border: selectedColor === color.value 
                      ? `2px solid ${theme.palette.mode === 'light' ? 'black' : 'white'}`
                      : `2px solid transparent`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        bgcolor: theme.palette.mode === 'light' ? 'white' : 'black',
                      }}
                    />
                  )}
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ThemeSwitcher;