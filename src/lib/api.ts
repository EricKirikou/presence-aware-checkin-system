const API_BASE = import.meta.env.VITE_API_URL;

export const getAttendanceRecords = async (p0: string | undefined) => {
  const response = await fetch(`${API_BASE}/attendance`);
  return await response.json();
};

export const saveAttendanceRecord = async (record: any) => {
  const response = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return await response.json();
};

export const hasCheckedInToday = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/attendance/today/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to check attendance status');
  }
  const data = await response.json();
  return data.hasCheckedIn;
};

export const getUserByEmail = async (email: string) => {
  const response = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
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
  const response = await fetch(`${API_BASE}/users`, {
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
    const response = await fetch(`${API_BASE}/attendance/today?userId=${userId}`);

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

// ✅ UPDATED FUNCTION
export const updateUserPassword = async (
  payload: { newPassword: string } | { currentPassword: string; newPassword: string }
) => {
  const res = await fetch(`${API_BASE}/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update password');
  }

  return res.json();
};
