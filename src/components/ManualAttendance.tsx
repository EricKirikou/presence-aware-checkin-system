
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { checkLocationPermission, getCurrentLocation } from "@/utils/locationUtils";

interface ManualAttendanceProps {
  status: 'present' | 'absent' | 'late';
  setStatus: React.Dispatch<React.SetStateAction<'present' | 'absent' | 'late'>>;
  locationDenied: boolean;
  onSubmitManual: (location: { lat: number; lng: number; locationName?: string }, isCheckout?: boolean) => void;
  isCheckout?: boolean;
}

const ManualAttendance: React.FC<ManualAttendanceProps> = ({ 
  status, 
  setStatus, 
  locationDenied, 
  onSubmitManual,
  isCheckout = false
}) => {
  const { toast } = useToast();
  
  const handleManualSubmit = async () => {
    try {
      // Check for location permission first
      const hasLocationPermission = await checkLocationPermission(
        () => {}, // We don't need to update locationDenied here as it's passed from parent
        toast
      );
      if (!hasLocationPermission) return;
      
      // Now get the location with locationName
      const currentLocation = await getCurrentLocation();
      onSubmitManual(currentLocation, isCheckout);
    } catch (error) {
      console.error("Geolocation error:", error);
      toast({
        title: "Location error",
        description: "Could not get your location. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Attendance status</h3>
        <RadioGroup 
          defaultValue="present" 
          value={status}
          onValueChange={(val) => setStatus(val as 'present' | 'absent' | 'late')}
          className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="present" id="present" />
            <Label htmlFor="present">Present</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absent" id="absent" />
            <Label htmlFor="absent">Absent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="late" id="late" />
            <Label htmlFor="late">Late</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleManualSubmit} disabled={locationDenied}>
          {isCheckout ? 'Submit Checkout' : 'Submit Attendance'}
        </Button>
      </div>
    </div>
  );
};

export default ManualAttendance;
