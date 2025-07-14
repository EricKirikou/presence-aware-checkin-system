// src/pages/CheckInPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import * as faceapi from 'face-api.js';
import SidebarLayout from '../components/SidebarLayout';
import DashboardHeader from '../components/DashboardHeader';

const CheckInPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Must be hosted publicly (move `models` folder to `public/`)
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    loadModels().then(startVideo);
  }, []);

  const handleCheckIn = async () => {
    setStatus('loading');
    setMessage('');

    if (!videoRef.current) return;

    const detections = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detections) {
      // Fake logic for face-recognition check-in
      setStatus('success');
      setMessage('Face detected. Check-in successful!');
      // You can now POST this data to your backend
    } else {
      setStatus('error');
      setMessage('Face not recognized. Please try again.');
    }
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto' }}>
        <DashboardHeader />

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Face Recognition Check-In
          </Typography>

          {status === 'success' && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {status === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <video ref={videoRef} autoPlay muted width="100%" style={{ borderRadius: 8 }} />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleCheckIn}
            disabled={status === 'loading'}
            startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
          >
            {status === 'loading' ? 'Checking face...' : 'Check In with Face'}
          </Button>
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default CheckInPage;
