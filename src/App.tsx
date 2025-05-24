import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/layout/Layout';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { db } from './db/db';

// Lazy load pages to improve initial load performance
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HabitDetail = lazy(() => import('./pages/HabitDetail'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  const { theme, initializeTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize the theme from IndexedDB
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Initialize the database
        await db.open();
        // Initialize theme from stored preferences
        await initializeTheme();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    loadTheme();
  }, [initializeTheme]);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Show email verification warning if needed
  useEffect(() => {
    if (user && !user.isEmailVerified) {
      // You could show a warning banner or modal here
      console.log('Email not verified');
    }
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </Box>
          }>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Suspense>
        ) : (
          <Layout>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/habit/:id" element={<HabitDetail />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;