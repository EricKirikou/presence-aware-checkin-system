
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  status: 'present' | 'absent' | 'late';
  method: 'biometric' | 'manual';
  timestamp: Date;
  location: { lat: number; lng: number; locationName?: string } | null;
  isCheckout?: boolean;
  faceImage?: string;
}
