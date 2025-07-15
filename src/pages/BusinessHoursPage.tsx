import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import SidebarLayout from '../components/SidebarLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
const BUSINESS_HOURS_ENDPOINT = `${API_BASE_URL}/api/v1/business-hours`;

const BusinessHoursPage: React.FC = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // 🔄 Fetch existing business hours
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

  // 📝 Handle form submit
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
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Set Business Hours
          </Typography>

          {status && (
            <Alert severity={status.type} sx={{ mb: 2 }}>
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="End Time"
              type="time"
              fullWidth
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ mb: 2 }}
              required
            />

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
            </Button>
          </form>
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default BusinessHoursPage;
