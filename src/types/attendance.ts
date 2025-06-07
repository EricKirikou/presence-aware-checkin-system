// src/types/attendance.ts

export type CheckIn = {
  id?: string;
  userId: string;
  time: Date; // Can also use string if stored that way in MongoDB
  location?: {
    latitude: number;
    longitude: number;
  };
};

export interface GeoLocation {  // Renamed from Location
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
  location: GeoLocation | null;  // Use the renamed type
  timestamp: Date;           // Explicit Date type
  isCheckout: boolean;
  faceImage?: string;
}


export type User = {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
};
