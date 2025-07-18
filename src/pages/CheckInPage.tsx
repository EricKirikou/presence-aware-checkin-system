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
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
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
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <DashboardHeader />
        
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          mb: 3
        }}>
          <Typography variant="h5" fontWeight="bold" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
            {isCheckingOut ? (
              <>
                <FingerprintIcon sx={{ mr: 1 }} />
                Check Out
              </>
            ) : (
              <>
                <FingerprintIcon sx={{ mr: 1 }} />
                Check In
              </>
            )}
          </Typography>

          <Tabs 
            value={tab} 
            onChange={(e, val) => setTab(val)} 
            sx={{ mb: 3 }}
            variant="fullWidth"
          >
            <Tab 
              label="Face Recognition" 
              icon={<FaceIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              label="Manual" 
              icon={<FingerprintIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          {status === 'success' && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<CheckCircleIcon fontSize="inherit" />}
            >
              <Typography fontWeight="bold">{message}</Typography>
            </Alert>
          )}
          {status === 'error' && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              icon={<ErrorIcon fontSize="inherit" />}
            >
              <Typography fontWeight="bold">{message}</Typography>
            </Alert>
          )}

          {tab === 0 && (
            <Box>
              <Card sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ 
                  position: 'relative',
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5'
                }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    width="100%"
                    style={{ 
                      height: '100%',
                      objectFit: 'cover'
                    }} 
                  />
                  {status === 'loading' && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      zIndex: 1
                    }}>
                      <CircularProgress color="inherit" />
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Position your face in the frame
                  </Typography>
                </CardContent>
              </Card>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={performFaceCheckIn}
                disabled={status === 'loading'}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {status === 'loading' ? (
                  <CircularProgress size={24} color="inherit" />
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
              <Card sx={{ mb: 2, p: 3 }}>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {isCheckingOut 
                    ? 'You are about to manually check out from your current location'
                    : 'You are about to manually check in from your current location'}
                </Typography>
                
                <Stack direction="row" spacing={1} mb={3}>
                  <Chip 
                    icon={<LocationIcon />}
                    label={locationName} 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip 
                    label={new Date().toLocaleTimeString()} 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </Stack>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => handleAttendance('manual')}
                  disabled={status === 'loading'}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {status === 'loading' ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isCheckingOut ? (
                    'Confirm Manual Check Out'
                  ) : (
                    'Confirm Manual Check In'
                  )}
                </Button>
              </Card>
            </Box>
          )}

          <Box sx={{ 
            mt: 3,
            p: 2,
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            <LocationIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Current Location:</strong> {locationName || 'Unknown'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SidebarLayout>
  );
};

export default CheckInPage;