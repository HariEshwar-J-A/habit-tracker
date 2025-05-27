import { useState } from 'react';
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
  IconButton,
  useTheme,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Calendar,
  Shield,
  Database,
  Users,
  Github,
} from 'lucide-react';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { toast } from 'react-toastify';

const features = [
  {
    icon: <Calendar size={24} />,
    title: 'Simple Habit Tracking',
    description: 'Track your daily habits with an intuitive interface'
  },
  {
    icon: <Shield size={24} />,
    title: 'Privacy First',
    description: 'Your data stays on your device, never uploaded without consent'
  },
  {
    icon: <Database size={24} />,
    title: 'Works Offline',
    description: 'Full functionality even without internet connection'
  },
  {
    icon: <Users size={24} />,
    title: 'Coming Soon: Community',
    description: 'Share goals and motivate each other (Premium feature)'
  }
];

const Auth = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, signup, loginWithProvider } = useAuthStore();
  const { themeMode, themeColor, setTheme } = useThemeStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const themes = ['blue', 'purple', 'teal', 'amber', 'pink'];
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  const switchTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    setCurrentThemeIndex(nextIndex);
    setTheme(themeMode, themes[nextIndex]);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" gutterBottom>
                Build Better Habits,
                <br />
                One Day at a Time
              </Typography>
              
              <Typography variant="h5" color="text.secondary" paragraph>
                A privacy-focused habit tracker that works offline and keeps your data local.
                Free for early adopters!
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          height: '100%',
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <CardContent>
                          <Box sx={{ color: theme.palette.primary.main, mb: 1 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Try our themes
                </Typography>
                <Button
                  variant="outlined"
                  onClick={switchTheme}
                >
                  Switch Theme
                </Button>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={5}>
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
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Auth;