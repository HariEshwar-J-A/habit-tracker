import { useState } from 'react';
import { Card, CardContent, CardActionArea, Typography, Box, Checkbox, CircularProgress } from '@mui/material';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Habit } from '../../types';
import { useHabitStore } from '../../stores/habitStore';

interface HabitItemProps {
  habit: Habit;
  onClick: () => void;
}

const HabitItem = ({ habit, onClick }: HabitItemProps) => {
  const [checking, setChecking] = useState(false);
  const { toggleHabitCompletion } = useHabitStore();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const handleCheckToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (checking) return;
    
    setChecking(true);
    try {
      await toggleHabitCompletion(habit.id as number, today);
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '8px',
            height: '100%',
            backgroundColor: habit.color,
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px'
          }
        }}
      >
        <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', pl: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Typography variant="h6" component="div" noWrap sx={{ mr: 1 }}>
                {habit.name}
              </Typography>
              
              {checking ? (
                <CircularProgress size={24} />
              ) : (
                <Checkbox
                  icon={<Circle size={24} />}
                  checkedIcon={<CheckCircle size={24} />}
                  checked={habit.currentStreak > 0}
                  onClick={handleCheckToggle}
                  color="primary"
                  sx={{ p: 0.5 }}
                />
              )}
            </Box>
            
            {habit.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {habit.description}
              </Typography>
            )}
            
            <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current streak
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Best streak
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {habit.longestStreak} {habit.longestStreak === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default HabitItem;