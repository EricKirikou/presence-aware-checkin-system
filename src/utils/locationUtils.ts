
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
  return new Promise<{ lat: number, lng: number, locationName?: string }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Get location name using reverse geocoding
        getLocationName(coordinates.lat, coordinates.lng)
          .then(locationName => {
            resolve({
              ...coordinates,
              locationName
            });
          })
          .catch(() => {
            // If getting location name fails, resolve with just coordinates
            resolve(coordinates);
          });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Gets location name from coordinates using Google Maps Geocoding API
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise that resolves to location name
 */
export const getLocationName = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=YOUR_API_KEY`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Find locality (town/city) in address components
      const locality = data.results[0].address_components.find(
        (component: any) => component.types.includes("locality")
      );
      
      // Fallback to formatted address if locality is not found
      return locality ? locality.long_name : data.results[0].formatted_address;
    }
    
    return "Unknown location";
  } catch (error) {
    console.error("Error getting location name:", error);
    return "Unknown location";
  }
};
