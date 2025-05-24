
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import FaceScanner from './FaceScanner';
import LocationDeniedAlert from './LocationDeniedAlert';
import ManualAttendance from './ManualAttendance';
import { checkLocationPermission } from '@/utils/locationUtils';

interface CheckoutAttendanceProps {
  onSubmit: (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: { lat: number; lng: number; locationName?: string } | null;
    timestamp: Date;
    isCheckout: boolean;
    faceImage?: string;
  }) => void;
}

const CheckoutAttendance: React.FC<CheckoutAttendanceProps> = ({ onSubmit }) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [method, setMethod] = useState<'biometric' | 'manual'>('biometric');
  const [location, setLocation] = useState<{ lat: number; lng: number; locationName?: string } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const { toast } = useToast();

  const handleFaceScanSuccess = (scanLocation: { lat: number, lng: number, locationName?: string }, faceImage?: string) => {
    setLocation(scanLocation);
    submitCheckout(scanLocation, faceImage);
  };

  const handleManualSubmit = (submitLocation: { lat: number, lng: number, locationName?: string }) => {
    setLocation(submitLocation);
    submitCheckout(submitLocation);
  };

  const submitCheckout = (submitLocation: { lat: number, lng: number, locationName?: string }, faceImage?: string) => {
    onSubmit({
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
  };

  // Check location permission when component mounts or method changes
  React.useEffect(() => {
    checkLocationPermission(setLocationDenied, toast);
  }, [method]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Checkout</CardTitle>
        <CardDescription>Record your departure for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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

          {method === 'biometric' ? (
            <FaceScanner onSuccess={handleFaceScanSuccess} isCheckout={true} />
          ) : null}
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
