// src/types/attendance.ts

export type CheckIn = {
  id?: string;
  userId: string;
  time: Date; // Can also be string if stored as ISO string in MongoDB
  location?: {
    latitude: number;
    longitude: number;
  };
};

export interface GeoLocation {
  lat: number;
  lng: number;
  locationName?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  status: 'present' | 'absent' | 'late';
  method: 'biometric' | 'manual';
  location: GeoLocation | null;
  timestamp: Date; // This is fine since you're parsing it to Date on the frontend
  isCheckout: boolean;
  faceImage?: string;
}

// ✅ User type for use in auth & attendance (instead of separate user.ts)
export type User = {
  id?: string; // Optional because MongoDB assigns _id
  name: string;
  email: string;
  password?: string; // Optional here since you may omit password on frontend fetch
  role: 'admin' | 'employee';
};
