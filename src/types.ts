import * as faceapi from 'face-api.js';
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  department?: string;
  lastCheckIn?: string;
  lastCheckOut?: string;
  status?: 'on-time' | 'late' | 'early-departure' | 'absent';
}

export interface DashboardStats {
  totalEmployees: number;
  newEmployeesToday: number;
  onTimeCount: number;
  lateArrivals: number;
  earlyDepartures: number;
  attendanceTrend: {
    date: string;
    onTimePercentage: number;
    latePercentage: number;
  }[];
  recentCheckIns: User[];
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  image: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

export type FaceDetectionWithLandmarks = faceapi.WithFaceDescriptor<
  faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >
>;

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

// Attendance-related types
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'early-departure' | 'absent';
  workingHours?: number;
  department: string;
}

export interface DashboardStats {
  totalEmployees: number;
  newEmployeesToday: number;
  onTimeCount: number;
  lateArrivals: number;
  earlyDepartures: number;
  attendanceTrend: {
    date: string;
    onTimePercentage: number;
    latePercentage: number;
  }[];
}

export type AttendanceError = {
  message: string;
  code?: string;
  statusCode?: number;
  metadata?: {
    userId?: string;
    timestamp?: string;
    action?: 'check-in' | 'check-out';
  };
};

export type ServiceError = 
  | { type: 'API_ERROR'; error: ApiErrorResponse }
  | { type: 'NETWORK_ERROR'; error: Error }
  | { type: 'VALIDATION_ERROR'; error: Error }
  | { type: 'UNKNOWN_ERROR'; error: unknown };

// Type guard for API errors
export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}