import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';

// Lazy load pages to improve initial load performance
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HabitDetail = lazy(() => import('./pages/HabitDetail'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Settings = lazy(() => import('./pages/Settings'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

function App() {
  const { theme, initializeTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize theme and check auth state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeTheme();
        
        // Check current auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [initializeTheme, navigate, location.pathname]);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Check if user needs to verify email
  useEffect(() => {
    if (isAuthenticated && user && !user.isEmailVerified && location.pathname !== '/verify-email') {
      navigate('/verify-email', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

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
              <Route path="*" element={<Auth />} />
            </Routes>
          </Suspense>
        ) : (
          <>
            {user?.isEmailVerified ? (
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
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </Suspense>
              </Layout>
            ) : (
              <Suspense fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                  <CircularProgress />
                </Box>
              }>
                <Routes>
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="*" element={<VerifyEmail />} />
                </Routes>
              </Suspense>
            )}
          </>
        )}
      </AnimatePresence>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode}
      />
    </ThemeProvider>
  );
}

export default App;