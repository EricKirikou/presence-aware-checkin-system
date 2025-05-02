
import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface BiometricScannerProps {
  onSuccess: (location: { lat: number, lng: number }) => void;
}

const BiometricScanner: React.FC<BiometricScannerProps> = ({ onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    if (scanning) return;
    
    setScanning(true);
    
    // Show toast for scanning
    toast({
      title: "Scanning fingerprint...",
      description: "Please hold still",
    });
    
    // Simulate fingerprint scanning process
    setTimeout(() => {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Simulate success
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
              description: "Could not get your current location. Using default location.",
              variant: "destructive",
            });
            
            // Provide a default location if geolocation fails
            const defaultLocation = { lat: 40.7128, lng: -74.0060 };
            setScanning(false);
            onSuccess(defaultLocation);
          }
        );
      } else {
        toast({
          title: "Geolocation not supported",
          description: "Your browser doesn't support geolocation. Using default location.",
          variant: "destructive",
        });
        
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };
        setScanning(false);
        onSuccess(defaultLocation);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={cn(
          "fingerprint-scanner cursor-pointer",
          scanning && "scanning pulse-animation"
        )}
        onClick={handleScan}
        role="button"
        aria-label="Scan fingerprint"
      >
        <Fingerprint
          size={48}
          className={cn(
            "text-gray-600",
            scanning && "text-green-500"
          )}
        />
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {scanning ? "Scanning..." : "Tap to scan fingerprint"}
      </p>
    </div>
  );
};

export default BiometricScanner;
