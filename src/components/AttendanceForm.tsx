
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BiometricScanner from './BiometricScanner';
import LocationDeniedAlert from './LocationDeniedAlert';
import ManualAttendance from './ManualAttendance';
import { checkLocationPermission, getCurrentLocation } from '@/utils/locationUtils';

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
  const [locationDenied, setLocationDenied] = useState(false);
  const { toast } = useToast();

  const handleBiometricSuccess = (biometricLocation: { lat: number, lng: number }) => {
    setLocation(biometricLocation);
    submitAttendance(biometricLocation);
  };

  const handleManualSubmit = (submitLocation: { lat: number, lng: number }) => {
    setLocation(submitLocation);
    submitAttendance(submitLocation);
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

  // Check location permission when component mounts or method changes
  React.useEffect(() => {
    checkLocationPermission(setLocationDenied, toast);
  }, [method]);

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
            <ManualAttendance 
              status={status} 
              setStatus={setStatus} 
              locationDenied={locationDenied} 
              onSubmitManual={handleManualSubmit} 
            />
          )}

          <Separator />

          <LocationDeniedAlert locationDenied={locationDenied} />

          {method === 'biometric' ? (
            <BiometricScanner onSuccess={handleBiometricSuccess} />
          ) : null}
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
