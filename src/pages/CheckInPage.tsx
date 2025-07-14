import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';

import SidebarLayout from '../components/SidebarLayout';
import DashboardHeader from '../components/DashboardHeader';



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const CheckInPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');

  // Manual Check-in
  const handleManualCheckIn = async () => {
    if (!userId.trim()) return;

    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Check-in successful!');
      } else {
        throw new Error(data.message || 'Check-in failed.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  // WebAuthn Biometric Check-in
  const handleBiometricCheckIn = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([1, 2, 3, 4]).buffer, // 👈 replace with real challenge from server
          allowCredentials: [], // allow all for demo
          timeout: 60000,
          userVerification: 'preferred',
        },
      });

      if (credential) {
        // In real use: send credential to backend for verification
        setStatus('success');
        setMessage('Biometric check-in successful!');
      } else {
        throw new Error('Biometric authentication was cancelled or failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Biometric check-in failed.');
    }
  };

  // Face Check-in (Placeholder — face-api.js would go here)
  const handleFaceCheckIn = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setMessage('Face recognition check-in successful!');
    }, 2000);
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto' }}>
        <DashboardHeader />
        <Paper sx={{ p: 4, borderRadius: 2, mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Employee Check-In
          </Typography>

          {status === 'success' && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {status === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}

          <TextField
            label="Enter User ID"
            variant="outlined"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={status === 'loading'}
            sx={{ mb: 2 }}
          />

          <Stack spacing={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleManualCheckIn}
              disabled={status === 'loading'}
              startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
            >
              {status === 'loading' ? 'Checking in...' : 'Check In Manually'}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleBiometricCheckIn}
              disabled={status === 'loading'}
            >
              Check In with Biometrics
            </Button>

            <Button
              variant="outlined"
              fullWidth
              color="info"
              onClick={handleFaceCheckIn}
              disabled={status === 'loading'}
            >
              Check In with Face Recognition
            </Button>
          </Stack>
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default CheckInPage;
