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

  // Show fewer months on mobile for better UX
  const monthsToShow = isMobile ? 4 : 12;

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
                width: isMobile ? '12px' : '16px',
                height: isMobile ? '12px' : '16px',
                backgroundColor: getCellColor(dateStr),
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
              title={`${date.toLocaleDateString()}: ${completionMap[dateStr] ? 'Completed' : 'Not completed'}`}
            />
          </motion.div>
        );
      }
      
      cells.push(
        <Box 
          key={`${year}-${monthIndex}`} 
          sx={{ 
            mb: 2,
            minWidth: isMobile ? '160px' : '200px',
            scrollSnapAlign: 'start',
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              fontWeight: 500,
            }}
          >
            {monthNames[monthIndex]} {year}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? '1px' : '2px',
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
        p: isMobile ? 1.5 : 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontSize: isMobile ? '1rem' : '1.25rem' }}>
        Activity Heatmap
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        mb: 1,
        pl: isMobile ? 0.5 : 1,
      }}>
        <Box sx={{ width: isMobile ? '16px' : '20px' }}></Box>
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          justifyContent: 'space-between',
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          color: theme.palette.text.secondary,
        }}>
          <Typography variant="caption">M</Typography>
          <Typography variant="caption">W</Typography>
          <Typography variant="caption">F</Typography>
          <Typography variant="caption">S</Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 2,
        mx: isMobile ? -1 : 0,
        px: isMobile ? 1 : 0,
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.background.default,
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: '2px',
          '&:hover': {
            background: theme.palette.action.hover,
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.divider} ${theme.palette.background.default}`,
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          mr: 1,
          mt: 3,
        }}>
          {daysOfWeek.map(day => (
            <Typography 
              key={day} 
              variant="caption" 
              sx={{ 
                height: isMobile ? '12px' : '16px',
                my: isMobile ? 2.2 : 2.8,
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                color: theme.palette.text.secondary,
              }}
            >
              {day.charAt(0)}
            </Typography>
          ))}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          minWidth: 'min-content',
        }}>
          {generateCalendarCells()}
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mt: 2,
        gap: 1,
        flexWrap: 'wrap',
      }}>
        <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
          Less
        </Typography>
        {[0, 1, 2, 3].map((level) => (
          <Box 
            key={level}
            sx={{
              width: isMobile ? '10px' : '12px',
              height: isMobile ? '10px' : '12px',
              backgroundColor: level === 0 
                ? (theme.palette.mode === 'light' ? '#ebedf0' : '#333') 
                : theme.palette.primary[level === 1 ? 'light' : level === 2 ? 'main' : 'dark'],
              borderRadius: '2px',
            }}
          />
        ))}
        <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
          More
        </Typography>
      </Box>
    </Paper>
  );
};

export default StreakCalendarHeatmap;