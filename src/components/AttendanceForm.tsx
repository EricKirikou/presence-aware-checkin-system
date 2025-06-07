import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import FaceScanner from './FaceScanner';
import LocationDeniedAlert from './LocationDeniedAlert';
import ManualAttendance from './ManualAttendance';
import { checkLocationPermission } from '@/utils/locationUtils';
import { useAuth } from './AuthContext';
import { checkTodayAttendance } from '@/lib/api';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { GeoLocation } from '@/types/attendance';

interface AttendanceFormProps {
  onSubmit: (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: GeoLocation | null;
    timestamp: Date;
    isCheckout?: boolean;
    faceImage?: string;
  }) => Promise<void> | void;
  hasCheckedIn: boolean;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit, hasCheckedIn }) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [method, setMethod] = useState<'biometric' | 'manual'>('biometric');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFaceScanSuccess = async (faceScanLocation: GeoLocation, faceImage?: string) => {
    try {
      setLocation(faceScanLocation);
      setError(null);
      await submitAttendance(faceScanLocation, faceImage);
    } catch (error: any) {
      setError(error.message || "Failed to record attendance");
    }
  };

  const handleManualSubmit = async (submitLocation: GeoLocation) => {
    try {
      setLocation(submitLocation);
      setError(null);
      await submitAttendance(submitLocation);
    } catch (error: any) {
      setError(error.message || "Failed to record attendance");
    }
  };

  const submitAttendance = async (submitLocation: GeoLocation, faceImage?: string) => {
    setIsLoading(true);
    try {
      await onSubmit({
        status,
        method,
        location: submitLocation,
        timestamp: new Date(),
        faceImage
      });

      toast({
        title: "Check-in successful",
        description: submitLocation.locationName ? 
          `You've been marked as ${status} at ${submitLocation.locationName}` :
          `You've been marked as ${status} at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in failed",
        description: error.message || "An error occurred while checking in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLocationPermission(setLocationDenied, toast);
  }, [method, toast]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Processing your check-in...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>There was a problem checking your attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => setError(null)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasCheckedIn) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Already Checked In</CardTitle>
          <CardDescription>You have already checked in for today</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <Clock className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-700">
              You're all set for today! You've already successfully checked in.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
                <Label htmlFor="biometric">Facial Recognition</Label>
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

          {method === 'biometric' && (
            <FaceScanner onSuccess={handleFaceScanSuccess} />
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {location ? (
          <p>Location captured: {location.locationName || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</p>
        ) : (
          <p>Your location will be recorded when you check in</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AttendanceForm;