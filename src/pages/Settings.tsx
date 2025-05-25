import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  useTheme,
  IconButton,
  Tooltip 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Download, Upload, AlertTriangle, HelpCircle } from 'lucide-react';
import ThemeSwitcher from '../components/settings/ThemeSwitcher';
import { db } from '../db/db';

const Settings = () => {
  const theme = useTheme();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const handleExportClick = async () => {
    try {
      // Get all data from IndexedDB
      const habits = await db.habits.toArray();
      const completions = await db.completions.toArray();
      const settings = await db.settings.toArray();
      
      // Create export object
      const exportObj = {
        habits,
        completions,
        settings
      };
      
      // Convert to JSON
      const exportJson = JSON.stringify(exportObj, null, 2);
      
      // Set export data and open dialog
      setExportData(exportJson);
      setExportDialogOpen(true);
    } catch (error) {
      console.error('Failed to export data:', error);
      setSnackbarMessage('Failed to export data');
      setSnackbarOpen(true);
    }
  };
  
  const handleImportClick = () => {
    setImportData('');
    setImportError('');
    setImportDialogOpen(true);
  };
  
  const handleImportSubmit = async () => {
    try {
      // Parse import data
      let importObj;
      try {
        importObj = JSON.parse(importData);
      } catch (error) {
        setImportError('Invalid JSON format');
        return;
      }
      
      // Validate import data structure
      if (!importObj.habits || !Array.isArray(importObj.habits) ||
          !importObj.completions || !Array.isArray(importObj.completions)) {
        setImportError('Invalid data format');
        return;
      }
      
      // Confirm before overwriting
      if (!confirm('This will replace all your current data. Are you sure?')) {
        return;
      }
      
      // Clear existing data
      await db.habits.clear();
      await db.completions.clear();
      
      // Import new data
      await db.habits.bulkAdd(importObj.habits);
      await db.completions.bulkAdd(importObj.completions);
      
      // Import settings if available
      if (importObj.settings && Array.isArray(importObj.settings) && importObj.settings.length > 0) {
        await db.settings.clear();
        await db.settings.bulkAdd(importObj.settings);
      }
      
      // Close dialog and show success message
      setImportDialogOpen(false);
      setSnackbarMessage('Data imported successfully');
      setSnackbarOpen(true);
      
      // Reload the page to apply imported settings
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to import data:', error);
      setImportError('Failed to import data: ' + error.message);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const dataFormatInfo = `
Expected JSON format:
{
  "habits": [
    {
      "id": number,
      "name": string,
      "description": string (optional),
      "frequency": "daily" | "weekly" | "monthly" | "custom",
      "color": string (hex color),
      "reminderEnabled": boolean,
      "reminderTime": string (HH:MM format, optional),
      "target": number,
      "currentStreak": number,
      "longestStreak": number,
      "createdAt": string (ISO date),
      "updatedAt": string (ISO date)
    }
  ],
  "completions": [
    {
      "id": number,
      "habitId": number,
      "date": string (YYYY-MM-DD),
      "createdAt": string (ISO date)
    }
  ],
  "settings": [
    {
      "id": number,
      "themeMode": "light" | "dark",
      "themeColor": string,
      "updatedAt": string (ISO date)
    }
  ]
}`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Settings
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Appearance
          </Typography>
          <ThemeSwitcher />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Data Management
            </Typography>
            <Tooltip title={dataFormatInfo} placement="right">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpCircle size={20} />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body1" paragraph>
              Export your habit data for backup or transfer to another device.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportClick}
              >
                Export Data
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={handleImportClick}
              >
                Import Data
              </Button>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            About
          </Typography>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Habit Tracker PWA
            </Typography>
            <Typography variant="body1" paragraph>
              Version 0.1.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A Progressive Web App for tracking and building habits.
              Works offline and can be installed on your device.
            </Typography>
          </Paper>
        </Box>
      </Box>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Copy this JSON data and save it in a safe place. You can use it to restore your habits later.
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={12}
            value={exportData}
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(exportData);
              setSnackbarMessage('Copied to clipboard');
              setSnackbarOpen(true);
            }}
          >
            Copy to Clipboard
          </Button>
          <Button onClick={() => setExportDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Paste your previously exported JSON data here to restore your habits.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertTriangle size={20} style={{ marginRight: '8px' }} />
              <Typography variant="body2">
                This will replace all your current data. Make sure you have a backup if needed.
              </Typography>
            </Box>
          </Alert>
          
          <TextField
            multiline
            fullWidth
            rows={12}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            error={!!importError}
            helperText={importError}
            placeholder='Paste JSON data here...'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImportSubmit} 
            variant="contained" 
            color="primary"
            disabled={!importData.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </motion.div>
  );
};

export default Settings;