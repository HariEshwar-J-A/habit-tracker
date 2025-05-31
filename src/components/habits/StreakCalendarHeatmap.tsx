import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitStore } from '../../stores/habitStore';

interface StreakCalendarHeatmapProps {
  habitId: string;
}

const StreakCalendarHeatmap = ({ habitId }: StreakCalendarHeatmapProps) => {
  const theme = useTheme();
  const isBelow720px = useMediaQuery('(max-width:719px)');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getHabitCompletions } = useHabitStore();
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  const monthsToShow = isBelow720px ? 1 : (isMobile ? 4 : 12);

  const months = useMemo(() => {
    if (isBelow720px) {
      return [{ monthIndex: displayMonth, year: displayYear }];
    }

    const result = [];
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    for (let i = 0; i < monthsToShow; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentYear - (monthIndex > currentMonth ? 1 : 0);
      result.unshift({ monthIndex, year });
    }

    return result;
  }, [monthsToShow, isBelow720px, displayMonth, displayYear, currentDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchCompletions = async () => {
      setIsLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        if (isBelow720px) {
          startDate.setFullYear(displayYear, displayMonth, 1);
          endDate.setFullYear(displayYear, displayMonth + 1, 0);
        } else {
          startDate.setMonth(startDate.getMonth() - monthsToShow);
        }

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
  }, [habitId, getHabitCompletions, monthsToShow, isBelow720px, displayMonth, displayYear]);

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(prev => prev - 1);
    } else {
      setDisplayMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    const isCurrentMonth = displayMonth === now.getMonth() && displayYear === now.getFullYear();
    
    if (isCurrentMonth) return;

    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(prev => prev + 1);
    } else {
      setDisplayMonth(prev => prev + 1);
    }
  };

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
      
      weekDays.forEach((day, index) => {
        monthCells.push(
          <Typography
            key={`header-${day}`}
            variant="caption"
            sx={{
              gridColumn: index + 1,
              gridRow: 1,
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              color: theme.palette.text.secondary,
              textAlign: 'center',
              mb: 0.5,
            }}
          >
            {isMobile ? day.charAt(0) : day.slice(0, 3)}
          </Typography>
        );
      });
      
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
              gridRow: Math.ceil(d / 7) + 1,
            }}
          >
            <Box
              sx={{
                width: isMobile ? '12px' : '16px',
                height: isMobile ? '12px' : '16px',
                backgroundColor: getCellColor(dateStr),
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 0.7,
                  transform: 'scale(1.2)',
                },
              }}
              title={`${new Date(dateStr).toLocaleDateString(undefined, { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}: ${completionMap[dateStr] ? 'Completed' : 'Not completed'}`}
            />
          </motion.div>
        );
      }
      
      cells.push(
        <Box 
          key={`${year}-${monthIndex}`} 
          sx={{ 
            mb: 3,
            minWidth: isMobile ? '180px' : '220px',
            scrollSnapAlign: 'start',
          }}
        >
          {!isBelow720px && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontSize: isMobile ? '0.8rem' : '1rem',
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {monthNames[monthIndex]} {year}
            </Typography>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? '2px' : '3px',
              gridAutoRows: 'auto',
              alignItems: 'center',
              justifyItems: 'center',
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
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: isMobile ? '1rem' : '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          Activity Heatmap
        </Typography>

        {isBelow720px && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={handlePrevMonth}
              size="small"
            >
              <ChevronLeft size={20} />
            </IconButton>
            
            <Typography 
              variant="subtitle1"
              sx={{ 
                minWidth: '120px',
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              {monthNames[displayMonth]} {displayYear}
            </Typography>
            
            <IconButton 
              onClick={handleNextMonth}
              size="small"
              disabled={
                displayMonth === currentDate.getMonth() && 
                displayYear === currentDate.getFullYear()
              }
            >
              <ChevronRight size={20} />
            </IconButton>
          </Box>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        overflowX: isBelow720px ? 'hidden' : 'auto',
        overflowY: 'hidden',
        pb: 2,
        mx: isMobile ? -1 : 0,
        px: isMobile ? 1 : 0,
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.background.default,
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: '3px',
          '&:hover': {
            background: theme.palette.action.hover,
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.divider} ${theme.palette.background.default}`,
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
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
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            color: theme.palette.text.secondary,
          }}
        >
          Less
        </Typography>
        {[0, 1, 2, 3].map((level) => (
          <Box 
            key={level}
            sx={{
              width: isMobile ? '12px' : '14px',
              height: isMobile ? '12px' : '14px',
              backgroundColor: level === 0 
                ? (theme.palette.mode === 'light' ? '#ebedf0' : '#333') 
                : theme.palette.primary[level === 1 ? 'light' : level === 2 ? 'main' : 'dark'],
              borderRadius: '2px',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.2)',
              },
            }}
          />
        ))}
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            color: theme.palette.text.secondary,
          }}
        >
          More
        </Typography>
      </Box>
    </Paper>
  );
};

export default StreakCalendarHeatmap;