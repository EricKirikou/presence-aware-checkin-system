// src/lib/api.ts
export const getAttendanceRecords = async (p0: string | undefined) => {
  const response = await fetch('/api/attendance');
  return await response.json();
};

export const saveAttendanceRecord = async (record: any) => {
  const response = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  return await response.json();
};

export const hasCheckedInToday = async (userId: string): Promise<boolean> => {
  const response = await fetch(`/api/attendance/today/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to check attendance status');
  }
  const data = await response.json();
  return data.hasCheckedIn;
};

export const getUserByEmail = async (email: string) => {
  const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return await response.json();
};

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export const saveUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save user');
  }

  return await response.json();
};

export const checkTodayAttendance = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/attendance/today?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check attendance status');
    }

    const data = await response.json();
    return data.hasCheckedIn;
  } catch (error) {
    console.error('Error checking attendance:', error);
    throw new Error('Could not verify attendance status');
  }
};