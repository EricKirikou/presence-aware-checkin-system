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
import { GeoLocation } from '@/types/attendance';
import { Alert } from "@/components/ui/alert";

interface CheckoutAttendanceProps {
  onSubmit: (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: GeoLocation | null;
    timestamp: Date;
    isCheckout: boolean;
    faceImage?: string;
  }) => Promise<void> | void;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}

const CheckoutAttendance: React.FC<CheckoutAttendanceProps> = ({ 
  onSubmit, 
  hasCheckedIn,
  hasCheckedOut
}) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [method, setMethod] = useState<'biometric' | 'manual'>('biometric');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFaceScanSuccess = async (scanLocation: GeoLocation, faceImage?: string) => {
    try {
      setLocation(scanLocation);
      setError(null);
      await submitCheckout(scanLocation, faceImage);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process checkout");
    }
  };

  const handleManualSubmit = async (submitLocation: GeoLocation) => {
    try {
      setLocation(submitLocation);
      setError(null);
      await submitCheckout(submitLocation);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process checkout");
    }
  };

  const submitCheckout = async (submitLocation: GeoLocation, faceImage?: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        status,
        method,
        location: submitLocation,
        timestamp: new Date(),
        isCheckout: true,
        faceImage
      });

      toast({
        title: "Checkout successful",
        description: submitLocation.locationName ? 
          `You've checked out from ${submitLocation.locationName}` :
          `You've checked out at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    checkLocationPermission(setLocationDenied, toast);
  }, [method, toast]);

  if (!hasCheckedIn) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Checkout Not Available</CardTitle>
          <CardDescription>You must check in before checking out</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            Please check in first before attempting to check out.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (hasCheckedOut) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Already Checked Out</CardTitle>
          <CardDescription>You have completed your attendance for today</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            You've successfully checked out for today. See you tomorrow!
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitting) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Processing your checkout...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Checkout</CardTitle>
        <CardDescription>Record your departure for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Checkout method</h3>
            <RadioGroup 
              defaultValue="biometric" 
              value={method}
              onValueChange={(val) => setMethod(val as 'biometric' | 'manual')}
              className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biometric" id="checkout-biometric" />
                <Label htmlFor="checkout-biometric">Facial Recognition</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="checkout-manual" />
                <Label htmlFor="checkout-manual">Manual</Label>
              </div>
            </RadioGroup>
          </div>

          {method === 'manual' && (
            <ManualAttendance 
              status={status} 
              setStatus={setStatus} 
              locationDenied={locationDenied} 
              onSubmitManual={handleManualSubmit}
              isCheckout={true}
            />
          )}

          <Separator />

          <LocationDeniedAlert locationDenied={locationDenied} />

          {method === 'biometric' && (
            <FaceScanner 
              onSuccess={handleFaceScanSuccess} 
              isCheckout={true} 
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {location ? (
          <p>Location captured: {location.locationName || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</p>
        ) : (
          <p>Your location will be recorded when you check out</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckoutAttendance;