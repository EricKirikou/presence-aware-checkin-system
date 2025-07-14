import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { format } from 'date-fns';
import { 
  Box, Button, Card, CardContent, Container, 
  LinearProgress, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Avatar, Chip, Divider
} from '@mui/material';
import { 
  CameraAlt, LocationOn, Schedule, Person, 
  Refresh, History, CheckCircle, ErrorOutline, Pending
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  image: string;
  location: Location;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

const FacialRecognitionDashboard: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedFace, setDetectedFace] = useState<faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
  > | null>(null);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectionInterval = useRef<number | null>(null);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load facial recognition models');
        setIsModelLoading(false);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval.current) {
        cancelAnimationFrame(detectionInterval.current);
      }
    };
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name || 'Unknown location';
            
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              address
            });
          } catch (err) {
            setCurrentLocation({
              lat: latitude,
              lng: longitude
            });
          }
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Could not retrieve location. Please ensure location services are enabled.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Detect faces in the video stream
  const detectFaces = async () => {
    if (!webcamRef.current?.video) return;
    
    try {
      const video = webcamRef.current.video;
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptors();

      setDetectedFace(detections[0] || null);
    } catch (err) {
      console.error('Face detection error:', err);
    }

    detectionInterval.current = requestAnimationFrame(detectFaces);
  };

  // Start camera and face detection
  const startCamera = async () => {
    setIsCameraActive(true);
    getCurrentLocation();
    await new Promise(resolve => setTimeout(resolve, 500));
    detectionInterval.current = requestAnimationFrame(detectFaces);
  };

  // Stop camera
  const stopCamera = () => {
    setIsCameraActive(false);
    setDetectedFace(null);
    if (detectionInterval.current) {
      cancelAnimationFrame(detectionInterval.current);
      detectionInterval.current = null;
    }
  };

  // Simulate user recognition
  const recognizeUser = async () => {
    if (!detectedFace) return;
    
    const simulatedUser = {
      id: 'user-123',
      name: 'John Doe'
    };
    
    setCurrentUser(simulatedUser);
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!currentUser || !currentLocation || !webcamRef.current) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Could not capture image');
      
      const newRecord: CheckInRecord = {
        id: `record-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        image: imageSrc,
        location: currentLocation,
        timestamp: new Date(),
        status: 'success'
      };
      
      setCheckInRecords(prev => [newRecord, ...prev]);
      setCurrentUser(null);
      setError(null);
    } catch (err) {
      console.error('Check-in failed:', err);
      setError('Check-in failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: 'primary.main',
        mb: 4
      }}>
        Facial Recognition Check-in System
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 4,
        mb: 4
      }}>
        {/* Camera Section */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CameraAlt color="primary" fontSize="large" />
              <Typography variant="h6">
                {isCameraActive ? 'Face Detection Active' : 'Camera Preview'}
              </Typography>
            </Box>
            
            {isModelLoading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: 400
              }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Loading facial recognition models...
                </Typography>
                <LinearProgress sx={{ width: '80%' }} />
              </Box>
            ) : (
              <Box sx={{
                position: 'relative',
                height: 400,
                bgcolor: 'background.paper',
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'divider'
              }}>
                {isCameraActive ? (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'user',
                        width: 1280,
                        height: 720
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {detectedFace && (
                      <Box sx={{
                        position: 'absolute',
                        border: 3,
                        borderColor: 'success.main',
                        borderRadius: 1,
                        top: `${detectedFace.detection.box.top}px`,
                        left: `${detectedFace.detection.box.left}px`,
                        width: `${detectedFace.detection.box.width}px`,
                        height: `${detectedFace.detection.box.height}px`,
                        zIndex: 10,
                        boxShadow: 3
                      }} />
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CameraAlt sx={{ 
                      fontSize: 80, 
                      color: 'action.disabled',
                      mb: 2
                    }} />
                    <Typography variant="body1" color="text.secondary">
                      Camera is currently inactive
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ 
              mt: 3,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              {!isCameraActive ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CameraAlt />}
                  onClick={startCamera}
                  disabled={isModelLoading}
                  fullWidth
                  size="large"
                >
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={stopCamera}
                    fullWidth
                    size="large"
                  >
                    Stop Camera
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Person />}
                    onClick={recognizeUser}
                    disabled={!detectedFace}
                    fullWidth
                    size="large"
                  >
                    Recognize Face
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
        
        {/* Check-in Info Section */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Check-in Information
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Typography variant="subtitle1">
                  User Identification
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ 
                ml: 7,
                fontWeight: currentUser ? 'bold' : 'normal',
                color: currentUser ? 'text.primary' : 'text.secondary'
              }}>
                {currentUser ? currentUser.name : 'Not recognized'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <LocationOn />
                </Avatar>
                <Typography variant="subtitle1">
                  Location Data
                </Typography>
              </Box>
              <Box sx={{ ml: 7 }}>
                <Typography variant="body1">
                  {currentLocation?.address || 'Location not available'}
                </Typography>
                {currentLocation && (
                  <Typography variant="caption" color="text.secondary">
                    ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Schedule />
                </Avatar>
                <Typography variant="subtitle1">
                  Date & Time
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ ml: 7 }}>
                {format(new Date(), 'PPpp')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleCheckIn}
              disabled={!currentUser || !currentLocation}
              sx={{ 
                py: 2,
                mt: 2,
                fontSize: '1rem'
              }}
              startIcon={<CheckCircle />}
            >
              Confirm Check-in
            </Button>
            
            {error && (
              <Box sx={{ 
                mt: 2,
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <ErrorOutline color="error" />
                <Typography color="error">{error}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* Check-in History Section */}
      <Card>
        <CardContent>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <History color="primary" fontSize="large" />
              <Typography variant="h6">
                Check-in History
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setCheckInRecords([])} 
              size="large"
              color="secondary"
            >
              <Refresh />
            </IconButton>
          </Box>
          
          {checkInRecords.length === 0 ? (
            <Box sx={{ 
              py: 4,
              border: 2,
              borderColor: 'divider',
              borderStyle: 'dashed',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary">
                No check-in records available
              </Typography>
            </Box>
          ) : (
            <TableContainer 
              component={Paper}
              sx={{ 
                border: 1,
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkInRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {record.userName.charAt(0)}
                          </Avatar>
                          <Typography>{record.userName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {format(record.timestamp, 'PP')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(record.timestamp, 'p')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {record.location.address || 'Unknown location'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box 
                          component="img" 
                          src={record.image} 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: 1,
                            borderColor: 'divider'
                          }} 
                          alt="Check-in photo"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          icon={record.status === 'success' ? <CheckCircle /> : <Pending />}
                          color={record.status === 'success' ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 'medium',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default FacialRecognitionDashboard;