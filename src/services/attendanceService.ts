// src/services/attendanceService.ts
import axios, { AxiosError } from 'axios';
import { 
  AttendanceRecord, 
  DashboardStats,
  ApiErrorResponse,
  ServiceError,
  isApiError
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://attendane-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function handleServiceError(error: unknown): ServiceError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response) {
      return {
        type: 'API_ERROR',
        error: axiosError.response.data
      };
    }
    return {
      type: 'NETWORK_ERROR',
      error: new Error('Network error occurred')
    };
  }
  if (error instanceof Error) {
    return {
      type: 'VALIDATION_ERROR',
      error
    };
  }
  return {
    type: 'UNKNOWN_ERROR',
    error
  };
}

export const attendanceService = {
  async checkIn(): Promise<void> {
    try {
      await api.post('/attendance/check-in');
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async checkOut(): Promise<void> {
    try {
      await api.post('/attendance/check-out');
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async getTodayStatus(): Promise<AttendanceRecord> {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async getHistory(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    try {
      const params = { startDate, endDate };
      const response = await api.get('/attendance/history', { params });
      return response.data;
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/attendance/stats');
      return response.data;
    } catch (error) {
      throw handleServiceError(error);
    }
  }
};