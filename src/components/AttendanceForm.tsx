
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import FaceScanner from './FaceScanner';
import LocationDeniedAlert from './LocationDeniedAlert';
import ManualAttendance from './ManualAttendance';
import { checkLocationPermission, getCurrentLocation } from '@/utils/locationUtils';
import { useAuth } from './AuthContext';
import { hasCheckedInToday } from '@/services/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface AttendanceFormProps {
  onSubmit: (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: { lat: number; lng: number; locationName?: string } | null;
    timestamp: Date;
    isCheckout?: boolean;
    faceImage?: string;
  }) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit }) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [method, setMethod] = useState<'biometric' | 'manual'>('biometric');
  const [location, setLocation] = useState<{ lat: number; lng: number; locationName?: string } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (user) {
        setIsLoading(true);
        setError(null);
        try {
          const hasCheckedIn = await hasCheckedInToday(user.id);
          setAlreadyCheckedIn(hasCheckedIn);
        } catch (error: any) {
          console.error("Error checking today's attendance:", error);
          setError("Could not check attendance status. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkTodayAttendance();
  }, [user]);

  const handleFaceScanSuccess = async (faceScanLocation: { lat: number, lng: number, locationName?: string }, faceImage?: string) => {
    try {
      setLocation(faceScanLocation);
      setError(null);
      await submitAttendance(faceScanLocation, faceImage);
    } catch (error: any) {
      setError(error.message || "Failed to record attendance");
      // Error is handled in submitAttendance
    }
  };

  const handleManualSubmit = async (submitLocation: { lat: number, lng: number, locationName?: string }) => {
    try {
      setLocation(submitLocation);
      setError(null);
      await submitAttendance(submitLocation);
    } catch (error: any) {
      setError(error.message || "Failed to record attendance");
      // Error is handled in submitAttendance
    }
  };

  const submitAttendance = async (submitLocation: { lat: number, lng: number, locationName?: string }, faceImage?: string) => {
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
      
      // Update state after successful check-in
      setAlreadyCheckedIn(true);
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in failed",
        description: error.message || "An error occurred while checking in",
        variant: "destructive",
      });
      throw error; // Re-throw so the caller can handle it
    }
  };

  // Check location permission when component mounts or method changes
  React.useEffect(() => {
    checkLocationPermission(setLocationDenied, toast);
  }, [method]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Checking attendance records...</p>
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
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alreadyCheckedIn) {
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

          {method === 'biometric' ? (
            <FaceScanner onSuccess={handleFaceScanSuccess} />
          ) : null}
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
