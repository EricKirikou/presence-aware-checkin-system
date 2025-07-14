import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const CheckInPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');

  const handleCheckIn = async () => {
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Check In
        </Typography>

        {status === 'success' && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {status === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}

        <TextField
          label="User ID"
          variant="outlined"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={status === 'loading'}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCheckIn}
          disabled={status === 'loading'}
          startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
        >
          {status === 'loading' ? 'Checking in...' : 'Check In'}
        </Button>
      </Paper>
    </Box>
  );
};

export default CheckInPage;
