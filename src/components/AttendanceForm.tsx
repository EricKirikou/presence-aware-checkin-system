
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BiometricScanner from './BiometricScanner';

interface AttendanceFormProps {
  onSubmit: (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: { lat: number; lng: number } | null;
    timestamp: Date;
  }) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit }) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [method, setMethod] = useState<'biometric' | 'manual'>('biometric');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleManualSubmit = () => {
    // For manual check-in, try to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(currentLocation);
          submitAttendance(currentLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location error",
            description: "Could not get your current location. Using default location.",
            variant: "destructive",
          });
          
          // Use a default location if geolocation fails
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setLocation(defaultLocation);
          submitAttendance(defaultLocation);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Using default location.",
        variant: "destructive",
      });
      
      const defaultLocation = { lat: 40.7128, lng: -74.0060 };
      setLocation(defaultLocation);
      submitAttendance(defaultLocation);
    }
  };

  const handleBiometricSuccess = (biometricLocation: { lat: number, lng: number }) => {
    setLocation(biometricLocation);
    submitAttendance(biometricLocation);
  };

  const submitAttendance = (submitLocation: { lat: number, lng: number }) => {
    onSubmit({
      status,
      method,
      location: submitLocation,
      timestamp: new Date()
    });

    toast({
      title: "Check-in successful",
      description: `You've been marked as ${status} at ${new Date().toLocaleTimeString()}`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Check-In</CardTitle>
        <CardDescription>Mark your attendance for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Check-in method</h3>
            <RadioGroup 
              defaultValue="biometric" 
              value={method}
              onValueChange={(val) => setMethod(val as 'biometric' | 'manual')}
              className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biometric" id="biometric" />
                <Label htmlFor="biometric">Biometric</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual</Label>
              </div>
            </RadioGroup>
          </div>

          {method === 'manual' && (
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
          )}

          <Separator />

          {method === 'biometric' ? (
            <BiometricScanner onSuccess={handleBiometricSuccess} />
          ) : (
            <div className="flex justify-center">
              <Button onClick={handleManualSubmit}>
                Submit Attendance
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {location ? (
          <p>Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        ) : (
          <p>Your location will be recorded when you check in</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AttendanceForm;
