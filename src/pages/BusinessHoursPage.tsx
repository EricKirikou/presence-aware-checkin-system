import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  InputAdornment
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import SidebarLayout from '../components/SidebarLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
const BUSINESS_HOURS_ENDPOINT = `${API_BASE_URL}/api/v1/business-hours`;

const BusinessHoursPage: React.FC = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // 🔄 Fetch existing business hours (keep exactly the same)
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        setLoading(true);
        setStatus(null);

        const token = localStorage.getItem('token');

        const res = await fetch(BUSINESS_HOURS_ENDPOINT, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          }
        });

        const data = await res.json();

        if (res.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }

        if (data.success && data.data) {
          setStartTime(data.data.startTime || '');
          setEndTime(data.data.endTime || '');
        } else if (data.success && !data.data) {
          setStatus({ type: 'info', message: 'No business hours set yet. Please configure below.' });
        } else {
          throw new Error(data.message || 'Failed to load business hours');
        }
      } catch (error: any) {
        setStatus({ type: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, []);

  // 📝 Handle form submit (keep exactly the same)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus(null);

      const token = localStorage.getItem('token');

      const res = await fetch(BUSINESS_HOURS_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ startTime, endTime }),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }

      if (data.success) {
        setStatus({ type: 'success', message: 'Business hours updated successfully.' });
      } else {
        throw new Error(data.message || 'Failed to update business hours.');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 500, mx: 'auto', my: 4 }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <ScheduleIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Business Hours
            </Typography>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {status && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 3 }}
              icon={false} // Remove default icon for cleaner look
            >
              <Typography fontWeight="medium">{status.message}</Typography>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Opening Time"
                type="time"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">🕗</Typography>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="medium"
                required
              />

              <TextField
                label="Closing Time"
                type="time"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">🕔</Typography>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="medium"
                required
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Save Business Hours'
                )}
              </Button>
            </Stack>
          </form>

          {startTime && endTime && (
            <Box sx={{ 
              mt: 3,
              p: 2,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderRadius: 2,
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}>
              <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                Current Hours
              </Typography>
              <Typography>
                {new Date(`2000-01-01T${startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                {new Date(`2000-01-01T${endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default BusinessHoursPage;