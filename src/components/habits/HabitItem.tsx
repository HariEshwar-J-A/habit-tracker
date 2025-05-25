import { useState, useEffect } from 'react';
import { Card, CardContent, CardActionArea, Typography, Box, Checkbox, CircularProgress } from '@mui/material';
import { CheckCircle, Circle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { Habit } from '../../types';
import { useHabitStore } from '../../stores/habitStore';
import useSound from 'use-sound';

interface HabitItemProps {
  habit: Habit;
  onClick: () => void;
}

const HabitItem = ({ habit, onClick }: HabitItemProps) => {
  const [checking, setChecking] = useState(false);
  const { toggleHabitCompletion } = useHabitStore();
  const controls = useAnimation();
  
  // Sound effects
  const [playComplete] = useSound('/sounds/complete.mp3', { volume: 0.5 });
  const [playUndo] = useSound('/sounds/undo.mp3', { volume: 0.5 });
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Glowing animation when it's reminder time
  useEffect(() => {
    if (habit.reminder_enabled && habit.reminder_time) {
      const now = new Date();
      const [hours, minutes] = habit.reminder_time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // Check if current time is within 5 minutes of reminder time
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      const isReminderTime = timeDiff <= 5 * 60 * 1000; // 5 minutes

      if (isReminderTime) {
        controls.start({
          boxShadow: [
            '0 0 0 0 rgba(255,255,255,0)',
            '0 0 20px 10px rgba(255,255,255,0.5)',
            '0 0 0 0 rgba(255,255,255,0)'
          ],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        });
      } else {
        controls.stop();
      }
    }
  }, [habit.reminder_enabled, habit.reminder_time, controls]);
  
  const handleCheckToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (checking) return;
    
    setChecking(true);
    try {
      await toggleHabitCompletion(habit.id, today);
      if (habit.current_streak > 0) {
        playUndo();
      } else {
        playComplete();
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={controls}
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
                  checked={habit.current_streak > 0}
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
                  {habit.current_streak} {habit.current_streak === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Best streak
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {habit.longest_streak} {habit.longest_streak === 1 ? 'day' : 'days'}
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