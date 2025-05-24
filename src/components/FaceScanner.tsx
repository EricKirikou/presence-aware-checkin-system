
import React, { useState, useRef, useEffect } from 'react';
import { ScanFace, AlertTriangle, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { checkLocationPermission, getCurrentLocation } from '@/utils/locationUtils';
import { useAuth } from './AuthContext';

interface FaceScannerProps {
  onSuccess: (location: { lat: number, lng: number, locationName?: string }, faceImage?: string) => void;
  isCheckout?: boolean;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onSuccess, isCheckout = false }) => {
  const [scanning, setScanning] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if camera is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
    }
  }, []);

  const startCamera = async () => {
    if (!cameraSupported) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraSupported(false);
      toast({
        title: "Camera error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data as base64 string
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    stopCamera();
    
    // If user has a profile image, set compare mode to true
    if (user?.profileImage) {
      setCompareMode(true);
    }
  };

  const handleScan = async () => {
    if (scanning) return;
    
    const hasLocationPermission = await checkLocationPermission(setLocationDenied, toast);
    if (!hasLocationPermission) return;
    
    if (!cameraActive && !capturedImage) {
      startCamera();
      return;
    }
    
    if (cameraActive) {
      captureImage();
      return;
    }
    
    setScanning(true);
    
    toast({
      title: "Verifying face...",
      description: "Please wait",
    });
    
    // Simulate face verification process
    setTimeout(async () => {
      try {
        // Get current location with location name
        const location = await getCurrentLocation();
        
        toast({
          title: "Face verified",
          description: location.locationName ? 
            `Location: ${location.locationName}` : 
            "Location captured successfully",
          variant: "default",
        });
        
        setScanning(false);
        onSuccess(location, capturedImage || undefined);
        setCapturedImage(null);
        setCompareMode(false);
      } catch (error) {
        console.error("Geolocation error:", error);
        toast({
          title: "Location error",
          description: "Could not get your location. Please try again.",
          variant: "destructive",
        });
        setScanning(false);
      }
    }, 2000);
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCompareMode(false);
    if (!cameraActive) {
      startCamera();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {locationDenied && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location access required</AlertTitle>
          <AlertDescription>
            Please enable location access in your browser settings
          </AlertDescription>
        </Alert>
      )}
      
      {!cameraSupported && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Camera not supported</AlertTitle>
          <AlertDescription>
            Your device doesn't support camera access or permission was denied
          </AlertDescription>
        </Alert>
      )}
      
      {compareMode && user?.profileImage && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm font-medium">Comparing with your profile image</p>
          <div className="flex space-x-4 items-center">
            <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                Profile
              </div>
            </div>
            <div className="text-2xl font-bold">VS</div>
            <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              {capturedImage && (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                    Captured
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!compareMode && (
        <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured face" 
              className="w-full h-full object-cover"
            />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={cn("w-full h-full object-cover", !cameraActive && "hidden")}
            />
          )}
          
          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanFace size={64} className="text-gray-400" />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      
      <div className="flex space-x-2">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={resetCamera}>
              Retake
            </Button>
            <Button onClick={handleScan} disabled={locationDenied || scanning}>
              {scanning ? "Verifying..." : isCheckout ? "Checkout" : "Check In"}
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleScan} 
            disabled={locationDenied || (!cameraActive && !cameraSupported)}
            className={cn(scanning && "bg-green-500 pulse-animation")}
          >
            {!cameraActive ? <Camera className="mr-2" size={16} /> : null}
            {!cameraActive ? "Start Camera" : "Capture Face"}
          </Button>
        )}
      </div>
      
      <p className="text-sm text-center text-muted-foreground">
        {scanning ? "Verifying..." : locationDenied ? "Location access required" : capturedImage ? "Face captured" : cameraActive ? "Position your face in the frame" : "Tap to scan face"}
      </p>
      {locationDenied && (
        <p className="text-xs text-red-500 text-center">
          Please enable location access in your browser settings
        </p>
      )}
    </div>
  );
};

export default FaceScanner;
