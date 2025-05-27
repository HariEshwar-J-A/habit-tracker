import { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';

interface StreakCalendarHeatmapProps {
  habitId: string;
}

const StreakCalendarHeatmap = ({ habitId }: StreakCalendarHeatmapProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getHabitCompletions } = useHabitStore();
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // For mobile, show only last 6 months instead of 12
  const monthsToShow = isMobile ? 6 : 12;

  const months = [];
  for (let i = 0; i < monthsToShow; i++) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const year = currentYear - (monthIndex > currentMonth ? 1 : 0);
    months.unshift({ monthIndex, year });
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysOfWeek = ['Mon', 'Wed', 'Fri'];

  useEffect(() => {
    const fetchCompletions = async () => {
      setIsLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsToShow);

        const completions = await getHabitCompletions(habitId, startDate, endDate);

        const map: Record<string, boolean> = {};
        completions.forEach(completion => {
          map[completion.date] = true;
        });

        setCompletionMap(map);
      } catch (error) {
        console.error('Failed to fetch completions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (habitId) {
      fetchCompletions();
    }
  }, [habitId, getHabitCompletions, monthsToShow]);

  const getCellColor = (date: string) => {
    if (!completionMap[date]) {
      return theme.palette.mode === 'light' ? '#ebedf0' : '#333';
    }
    return theme.palette.primary.main;
  };

  const generateCalendarCells = () => {
    const cells = [];
    
    for (let m = 0; m < months.length; m++) {
      const { monthIndex, year } = months[m];
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      const monthCells = [];
      
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const dayOfWeek = date.getDay();
        
        const dateStr = date.toISOString().split('T')[0];
        
        monthCells.push(
          <motion.div
            key={dateStr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.01 * d }}
            style={{
              gridColumn: dayOfWeek === 0 ? 7 : dayOfWeek,
              gridRow: Math.ceil(d / 7),
            }}
          >
            <Box
              sx={{
                width: isMobile ? '16px' : '20px',
                height: isMobile ? '16px' : '20px',
                backgroundColor: getCellColor(dateStr),
                borderRadius: '2px',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              title={`${date.toLocaleDateString()}: ${completionMap[dateStr] ? 'Completed' : 'Not completed'}`}
            />
          </motion.div>
        );
      }
      
      cells.push(
        <Box key={`${year}-${monthIndex}`} sx={{ mb: 2, minWidth: isMobile ? '200px' : '250px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {monthNames[monthIndex]}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? '2px' : '3px',
              gridAutoRows: 'auto',
            }}
          >
            {monthCells}
          </Box>
        </Box>
      );
    }
    
    return cells;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Activity Heatmap
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        mb: 1,
        pl: isMobile ? 1 : 2
      }}>
        <Box sx={{ width: '20px' }}></Box>
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          justifyContent: 'space-between',
          fontSize: isMobile ? '0.75rem' : '0.875rem'
        }}>
          <Typography variant="caption">Mon</Typography>
          <Typography variant="caption">Wed</Typography>
          <Typography variant="caption">Fri</Typography>
          <Typography variant="caption">Sun</Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        overflowX: 'auto',
        pb: 2,
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.background.default,
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: '3px',
        },
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          mr: 2,
          pl: isMobile ? 1 : 2
        }}>
          {daysOfWeek.map(day => (
            <Typography 
              key={day} 
              variant="caption" 
              sx={{ 
                height: '20px', 
                my: isMobile ? 3 : 4,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          minWidth: 'min-content'
        }}>
          {generateCalendarCells()}
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mt: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="caption" sx={{ mr: 1 }}>Less</Typography>
        {[0, 1, 2, 3].map((level) => (
          <Box 
            key={level}
            sx={{
              width: isMobile ? 12 : 15,
              height: isMobile ? 12 : 15,
              backgroundColor: level === 0 
                ? (theme.palette.mode === 'light' ? '#ebedf0' : '#333') 
                : theme.palette.primary[level === 1 ? 'light' : level === 2 ? 'main' : 'dark'],
              borderRadius: '2px',
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 1 }}>More</Typography>
      </Box>
    </Paper>
  );
};

export default StreakCalendarHeatmap;