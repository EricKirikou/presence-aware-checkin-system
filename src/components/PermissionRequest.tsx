
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkLocationPermission } from '@/utils/locationUtils';

interface PermissionRequestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsGranted: () => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  open,
  onOpenChange,
  onPermissionsGranted
}) => {
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  const handleRequestPermissions = async () => {
    setRequesting(true);
    
    try {
      // Request camera access
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (cameraError) {
        console.error("Camera permission error:", cameraError);
        toast({
          title: "Camera access denied",
          description: "Please enable camera access in your browser settings for facial recognition.",
          variant: "destructive",
        });
        // We continue even if camera fails, to try location
      }
      
      // Request location access
      const locationPermissionGranted = await checkLocationPermission(() => {}, toast);
      if (!locationPermissionGranted) {
        throw new Error("Location permission denied");
      }
      
      toast({
        title: "Permissions granted",
        description: "Thank you for allowing access to camera and location.",
      });
      
      onPermissionsGranted();
      onOpenChange(false);
    } catch (error) {
      console.error("Permission error:", error);
      toast({
        title: "Permission required",
        description: "Camera and location access are required for attendance check-in.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleDecline = () => {
    toast({
      title: "Limited functionality",
      description: "Some features will be limited without camera and location access.",
      variant: "destructive",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Permission Request</DialogTitle>
          <DialogDescription>
            CheckInPro needs access to your camera and location to verify your attendance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <Camera className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">Camera Access</h4>
              <p className="text-sm text-muted-foreground">For facial recognition attendance verification</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-medium">Location Access</h4>
              <p className="text-sm text-muted-foreground">To verify your presence at the check-in location</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleDecline}>
            Not Now
          </Button>
          <Button onClick={handleRequestPermissions} disabled={requesting}>
            {requesting ? "Requesting..." : "Allow Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionRequest;
