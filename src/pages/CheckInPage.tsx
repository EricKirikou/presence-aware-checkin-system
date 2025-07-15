import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import SidebarLayout from '../components/SidebarLayout';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../components/AuthContext';
import * as faceapi from 'face-api.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CheckInPage: React.FC = () => {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Unknown');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Example condition to disable tabs (optional, adjust as needed)
  const allDone = false; // or some logic to disable tabs

  useEffect(() => {
    loadModels();
    startVideo();
    getLocation();
    checkIfCheckedIn();
  }, []);

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]);
    console.log('✅ FaceAPI models loaded');
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocation(coords);
        try {
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=${OPENCAGE_API_KEY}`
          );
          const data = await res.json();
          setLocationName(data.results[0]?.formatted || 'Unknown Location');
        } catch (e) {
          setLocationName('Failed to get location name');
        }
      },
      () => {
        setMessage('Location access denied');
        setStatus('error');
      }
    );
  };

  const checkIfCheckedIn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/attendance/today/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.hasCheckedIn && !data.hasCheckedOut) {
        setHasCheckedIn(true);
        setIsCheckingOut(true);
      } else {
        setHasCheckedIn(false);
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const captureAndUploadImage = async () => {
    if (!videoRef.current) return '';

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 320, 240);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg');
    });

    if (!blob) return '';

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || '';
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return '';
    }
  };

  const handleAttendance = async (method: 'face' | 'manual') => {
    const imageUrl = method === 'face' ? await captureAndUploadImage() : '';

    const payload: Record<string, any> = {
      userId: user?._id,
      userName: user?.name,
      method,
      status: isCheckingOut ? 'absent' : 'present',
      isCheckout: isCheckingOut,
      location: location
        ? {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          }
        : undefined,
      locationName,
    };

    if (imageUrl) payload.imageUrl = imageUrl;

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setHasCheckedIn(!isCheckingOut);
        setIsCheckingOut(false);
      } else {
        throw new Error(data.message || 'Check-in/out failed');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  const performFaceCheckIn = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus('error');
      setMessage('No face detected. Please try again.');
      return;
    }

    await handleAttendance('face');
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <DashboardHeader />
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            {isCheckingOut ? 'Check Out' : 'Check In'}
          </Typography>

          <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ mb: 3 }}>
            <Tab label="Face Recognition" disabled={false} />
            <Tab label="Manual" disabled={false} />
          </Tabs>

          {status === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {tab === 0 && (
            <Box>
              <video ref={videoRef} autoPlay muted width="100%" style={{ borderRadius: 8 }} />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={performFaceCheckIn}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <CircularProgress size={20} />
                ) : isCheckingOut ? (
                  'Scan Face to Check Out'
                ) : (
                  'Scan Face to Check In'
                )}
              </Button>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleAttendance('manual')}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  'Submitting...'
                ) : isCheckingOut ? (
                  'Manual Check Out'
                ) : (
                  'Manual Check In'
                )}
              </Button>
            </Box>
          )}

          {locationName && (
            <Typography variant="caption" color="text.secondary" mt={2}>
              Location: {locationName}
            </Typography>
          )}
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default CheckInPage;
