
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;  // Add email field
  status: 'present' | 'absent' | 'late';
  method: 'biometric' | 'manual';
  location: { lat: number; lng: number; locationName?: string } | null;
  timestamp: Date;
  isCheckout: boolean;
  faceImage?: string;
}
