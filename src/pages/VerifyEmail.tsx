import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, resendVerificationEmail, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
    } else if (user?.isEmailVerified) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
      setCountdown(60); // Start 60-second countdown
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
      // Force navigation to auth page even if logout fails
      navigate('/auth', { replace: true });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.7 }} />
          
          <Typography variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link to continue.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            If you don't see the email, please check your spam folder.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={handleResendEmail}
              disabled={isLoading || countdown > 0}
            >
              {isLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VerifyEmail;