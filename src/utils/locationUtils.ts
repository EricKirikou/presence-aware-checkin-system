
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

// The Google Maps API key - replace with your own in production
const GOOGLE_API_KEY = "AIzaSyAoceJ4SZmhM6v0vF55VaFaq-FLOdUtRBI"; 

export const checkLocationPermission = async (
  setLocationDenied: React.Dispatch<React.SetStateAction<boolean>>,
  toast?: {
    (props: { title: string; description?: string; action?: ToastActionElement; variant?: "default" | "destructive" }): void;
  }
): Promise<boolean> => {
  try {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      if (toast) {
        toast({
          title: "Geolocation not supported",
          description: "Your browser does not support geolocation",
          variant: "destructive",
        });
      }
      return false;
    }

    // Check if permission is already granted
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    
    if (permissionStatus.state === 'denied') {
      setLocationDenied(true);
      if (toast) {
        toast({
          title: "Location permission denied",
          description: "Please enable location services in your browser settings",
          variant: "destructive",
        });
      }
      return false;
    }
    
    setLocationDenied(false);
    return true;
  } catch (error) {
    console.error("Error checking location permission:", error);
    setLocationDenied(true);
    return false;
  }
};

export const getCurrentLocation = (): Promise<{ lat: number, lng: number, locationName?: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Get location name using Google Maps Geocoding API
          const locationName = await getLocationNameFromCoords(lat, lng);
          
          resolve({
            lat,
            lng,
            locationName
          });
        } catch (error) {
          console.error("Error getting location name:", error);
          // Resolve with coordinates only if getting the location name fails
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const getLocationNameFromCoords = async (lat: number, lng: number): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding API error:", data.status);
      return undefined;
    }
    
    // Find the locality (town/city) from the address components
    for (const result of data.results) {
      if (result.types.includes("locality") || result.types.includes("administrative_area_level_2")) {
        // Get the town/city name
        for (const component of result.address_components) {
          if (component.types.includes("locality") || 
              component.types.includes("administrative_area_level_2") ||
              component.types.includes("administrative_area_level_1")) {
            return component.long_name;
          }
        }
      }
    }
    
    // If we didn't find a locality, just return the formatted address of the first result
    if (data.results[0].formatted_address) {
      return data.results[0].formatted_address.split(",")[0];
    }
    
    return undefined;
  } catch (error) {
    console.error("Error getting location name:", error);
    return undefined;
  }
};
