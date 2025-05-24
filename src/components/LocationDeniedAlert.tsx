
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface LocationDeniedAlertProps {
  locationDenied: boolean;
}

const LocationDeniedAlert: React.FC<LocationDeniedAlertProps> = ({ locationDenied }) => {
  if (!locationDenied) return null;
  
  return (
    <>
      <Alert variant="destructive" className="mb-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Location access required</AlertTitle>
        <AlertDescription>
          Please enable location access in your browser settings to check in
        </AlertDescription>
      </Alert>

      <div className="bg-red-50 p-3 rounded-md text-center">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
          <MapPin size={16} />
          <span className="font-medium">Location access required</span>
        </div>
        <p className="text-xs text-red-600">
          Please enable location access in your browser settings to check in
        </p>
      </div>
    </>
  );
};

export default LocationDeniedAlert;
