import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, resendVerificationEmail } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user?.isEmailVerified) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
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
              onClick={() => navigate('/auth')}
            >
              Back to Login
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={handleResendEmail}
            >
              Resend Email
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VerifyEmail;