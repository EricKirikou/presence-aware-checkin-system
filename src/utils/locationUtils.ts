import { ToastActionElement } from "@/components/ui/toast";

// Check if geolocation permission is granted or prompt user
export const checkLocationPermission = async (
  setLocationDenied: React.Dispatch<React.SetStateAction<boolean>>,
  toast?: {
    (props: {
      title: string;
      description?: string;
      action?: ToastActionElement;
      variant?: "default" | "destructive";
    }): void;
  }
): Promise<boolean> => {
  try {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      toast?.({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
      return false;
    }

    const permissionStatus = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });

    if (permissionStatus.state === "denied") {
      setLocationDenied(true);
      toast?.({
        title: "Location permission denied",
        description: "Enable location services in your browser settings",
        variant: "destructive",
      });
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

// Get current location (lat/lng) + reverse geocoded location name
export const getCurrentLocation = (): Promise<{
  lat: number;
  lng: number;
  locationName?: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const locationName = await getLocationNameFromCoords(lat, lng);

          resolve({
            lat,
            lng,
            locationName,
          });
        } catch (error) {
          console.error("Error getting location name:", error);
          resolve({ lat, lng }); // fallback if name fails
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(error);
      }
    );
  });
};

// Reverse geocode using OpenStreetMap Nominatim API
export const getLocationNameFromCoords = async (
  lat: number,
  lng: number
): Promise<string | undefined> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AttendanceSystem/1.0 (your@email.com)",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.county ||
      data?.display_name?.split(",")[0] ||
      undefined
    );
  } catch (error) {
    console.error("Error fetching location from coordinates:", error);
    return undefined;
  }
};
