import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  useTheme,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Calendar,
  Shield,
  Database,
  Bell,
  Palette,
  BarChart,
  Github,
} from 'lucide-react';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { toast } from 'react-toastify';

const features = [
  {
    icon: <Calendar size={32} />,
    title: 'Smart Habit Tracking',
    description: 'Track daily, weekly, or monthly habits with an intuitive interface. Set custom goals and watch your progress grow.'
  },
  {
    icon: <BarChart size={32} />,
    title: 'Visual Progress',
    description: 'Monitor your progress with beautiful charts, streaks, and detailed statistics. Stay motivated with visual feedback.'
  },
  {
    icon: <Database size={32} />,
    title: 'Offline-First',
    description: 'Keep tracking habits even without internet. Your data syncs automatically when you\'re back online.'
  },
  {
    icon: <Shield size={32} />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely. Take control of your privacy with local-first storage.'
  },
  {
    icon: <Palette size={32} />,
    title: 'Personalized Experience',
    description: 'Customize the app with themes, colors, and habit icons. Make it truly yours.'
  },{
    icon: <Bell size={32} />,
    title: 'Smart Reminders',
    description: 'Never miss a habit with notifications at the right time to stay on track - customizable remainders coming soon!'
  }
];

const Auth = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, signup, loginWithProvider } = useAuthStore();
  const { themeMode } = useThemeStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        const user = useAuthStore.getState().user;
        
        if (!user?.isEmailVerified) {
          navigate('/verify-email');
          return;
        }
        
        navigate('/');
      } else {
        await signup(email, password);
        toast.info('Please check your email to verify your account');
        navigate('/verify-email');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      await loginWithProvider(provider);
      navigate('/');
    } catch (err) {
      setError('OAuth login failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Build Better Habits,
                <br />
                One Day at a Time
              </Typography>
              
              <Typography variant="h5" color="text.secondary" paragraph>
                A beautiful and powerful habit tracker that works for you.
              </Typography>

              <Box sx={{ mt: 6, mb: 4 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeatureIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                          color: theme.palette.primary.main,
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          {features[currentFeatureIndex].icon}
                        </Box>
                        <Typography variant="h4" gutterBottom>
                          {features[currentFeatureIndex].title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {features[currentFeatureIndex].description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </AnimatePresence>
                </Paper>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1,
                  mt: 2 
                }}>
                  {features.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: index === currentFeatureIndex 
                          ? theme.palette.primary.main 
                          : theme.palette.action.disabled,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '400px' } }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: <Mail size={20} style={{ marginRight: 8 }} />
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: <Lock size={20} style={{ marginRight: 8 }} />
                    }}
                  />

                  {error && (
                    <Alert severity="error\" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{ mt: 3 }}
                  >
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>or continue with</Divider>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleOAuthLogin('google')}
                  >
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Github />}
                    onClick={() => handleOAuthLogin('github')}
                  >
                    GitHub
                  </Button>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    onClick={() => setIsLogin(!isLogin)}
                    sx={{ textTransform: 'none' }}
                  >
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Sign In'}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Auth;