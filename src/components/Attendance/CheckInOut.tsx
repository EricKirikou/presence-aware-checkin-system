// src/components/Attendance/CheckInOut.tsx
import React, { useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Snackbar, 
  Box,
  Alert
} from '@mui/material';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../AuthContext';
import { ServiceError } from '../../types';

export const CheckInOut = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  const [status, setStatus] = useState<'checked-in' | 'checked-out' | null>(null);
  const { user } = useAuth();

  const handleServiceAction = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      await action();
      setStatus(action === attendanceService.checkIn ? 'checked-in' : 'checked-out');
    } catch (err) {
      setError(err as ServiceError);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: ServiceError | null): string => {
    if (!error) return '';
    
    switch (error.type) {
      case 'API_ERROR':
        return `Server error: ${error.error.message}`;
      case 'NETWORK_ERROR':
        return 'Network error - please check your connection';
      case 'VALIDATION_ERROR':
        return `Validation error: ${error.error.message}`;
      case 'UNKNOWN_ERROR':
        return 'An unknown error occurred';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleServiceAction(attendanceService.checkIn)}
        disabled={loading || status === 'checked-in'}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {status === 'checked-in' ? 'Checked In' : 'Check In'}
      </Button>
      
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => handleServiceAction(attendanceService.checkOut)}
        disabled={loading || status === 'checked-out'}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        Check Out
      </Button>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {getErrorMessage(error)}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};