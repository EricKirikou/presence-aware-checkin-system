
import React, { useState } from 'react';
import { Fingerprint, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BiometricScannerProps {
  onSuccess: (location: { lat: number, lng: number }) => void;
}

const BiometricScanner: React.FC<BiometricScannerProps> = ({ onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const { toast } = useToast();

  const checkLocationPermission = () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Your browser doesn't support geolocation.",
          variant: "destructive",
        });
        setLocationDenied(true);
        resolve(false);
        return;
      }

      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          toast({
            title: "Location access denied",
            description: "Please enable location access to check in.",
            variant: "destructive",
          });
          setLocationDenied(true);
          resolve(false);
        } else {
          setLocationDenied(false);
          resolve(true);
        }
      }).catch(() => {
        // Fallback to direct geolocation request if permissions API is not supported
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationDenied(false);
            resolve(true);
          },
          () => {
            toast({
              title: "Location access denied",
              description: "Please enable location access to check in.",
              variant: "destructive",
            });
            setLocationDenied(true);
            resolve(false);
          },
          { timeout: 5000 }
        );
      });
    });
  };

  const handleScan = async () => {
    if (scanning) return;
    
    const hasLocationPermission = await checkLocationPermission();
    if (!hasLocationPermission) return;
    
    setScanning(true);
    
    toast({
      title: "Scanning fingerprint...",
      description: "Please hold still",
    });
    
    // Simulate fingerprint scanning process
    setTimeout(() => {
      // Get current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          toast({
            title: "Fingerprint verified",
            description: "Location captured successfully",
            variant: "default",
          });
          
          setScanning(false);
          onSuccess(location);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location error",
            description: "Could not get your location. Please try again.",
            variant: "destructive",
          });
          setScanning(false);
        }
      );
    }, 2000);
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
      <div 
        className={cn(
          "fingerprint-scanner cursor-pointer",
          scanning && "scanning pulse-animation",
          locationDenied && "opacity-50"
        )}
        onClick={handleScan}
        role="button"
        aria-label="Scan fingerprint"
      >
        <Fingerprint
          size={48}
          className={cn(
            scanning ? "text-green-500" : locationDenied ? "text-red-400" : "text-gray-600"
          )}
        />
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {scanning ? "Scanning..." : locationDenied ? "Location access required" : "Tap to scan fingerprint"}
      </p>
      {locationDenied && (
        <p className="text-xs text-red-500 text-center">
          Please enable location access in your browser settings
        </p>
      )}
    </div>
  );
};

export default BiometricScanner;
