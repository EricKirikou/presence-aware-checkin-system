const API_BASE = import.meta.env.VITE_API_URL;

import { AttendanceRecord, User } from '@/types/attendance'; // ✅ Import both AttendanceRecord and User types

// ✅ Get all attendance records (admin) or records by userId (employee)
export const getAttendanceRecords = async (userId?: string): Promise<AttendanceRecord[]> => {
  const url = userId ? `${API_BASE}/attendance?userId=${userId}` : `${API_BASE}/attendance`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch attendance records');
  }

  return await response.json();
};

// ✅ Save new attendance record (Check-in / Check-out)
export const saveAttendanceRecord = async (record: AttendanceRecord): Promise<AttendanceRecord> => {
  const response = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to save attendance');
  }

  return await response.json();
};

// ✅ Check if user has checked in today
export const hasCheckedInToday = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/attendance/today/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to check attendance status');
  }

  const data = await response.json();
  return data.hasCheckedIn;
};

// ✅ Get user by email
export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch user');
  }

  return await response.json();
};

// ✅ Save (register) a new user
export const saveUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save user');
  }

  return await response.json();
};

// ✅ Check today's attendance by query param
export const checkTodayAttendance = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/attendance/today?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to check attendance status');
  }

  const data = await response.json();
  return data.hasCheckedIn;
};

// ✅ Update user password
export const updateUserPassword = async (
  payload: { newPassword: string } | { currentPassword: string; newPassword: string }
): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE}/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update password');
  }

  return await res.json();
};
