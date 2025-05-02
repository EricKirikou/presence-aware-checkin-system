
import { useToast } from "@/hooks/use-toast";

/**
 * Checks if location access is allowed by the user's browser
 * @returns Promise that resolves to boolean indicating if location is permitted
 */
export const checkLocationPermission = (
  setLocationDenied: (denied: boolean) => void,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  return new Promise<boolean>((resolve) => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setLocationDenied(true);
      resolve(false);
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        toast({
          title: "Location access denied",
          description: "Please enable location access to check in.",
          variant: "destructive",
        });
        setLocationDenied(true);
        resolve(false);
      } else {
        setLocationDenied(false);
        resolve(true);
      }
    }).catch(() => {
      // Fallback to direct geolocation request if permissions API is not supported
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationDenied(false);
          resolve(true);
        },
        () => {
          toast({
            title: "Location access denied",
            description: "Please enable location access to check in.",
            variant: "destructive",
          });
          setLocationDenied(true);
          resolve(false);
        },
        { timeout: 5000 }
      );
    });
  });
};

/**
 * Gets the current location coordinates
 * @returns Promise that resolves to location coordinates
 */
export const getCurrentLocation = () => {
  return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
