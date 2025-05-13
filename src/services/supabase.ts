
import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord } from '@/types/attendance';

// Initialize Supabase client with default values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create mock functions for development when Supabase is not configured
const isMissingCredentials = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a client or a mock client based on available credentials
export const supabase = isMissingCredentials 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseAnonKey);

// Mock client for development when Supabase is not configured
function createMockClient() {
  console.warn('Supabase credentials not found. Using mock client for development.');
  
  // In-memory storage for development
  const mockStorage: AttendanceRecord[] = [];
  
  // Create a mock query object that matches the structure expected by the app
  const createMockQuery = () => {
    const mockQueryObject = {
      data: mockStorage,
      error: null,
      
      // Add all the required filter methods
      eq: () => mockQueryObject,
      neq: () => mockQueryObject,
      gt: () => mockQueryObject,
      lt: () => mockQueryObject,
      gte: () => mockQueryObject,
      lte: () => mockQueryObject,
      like: () => mockQueryObject,
      ilike: () => mockQueryObject,
      is: () => mockQueryObject,
      in: () => mockQueryObject,
      
      // Order function that matches the expected signature
      order: () => ({ data: mockStorage, error: null })
    };
    
    return mockQueryObject;
  };
  
  return {
    from: () => ({
      insert: (record: any) => {
        const newRecord = { ...record, id: Date.now().toString() };
        mockStorage.push(newRecord);
        return { 
          data: newRecord, 
          error: null,
          select: () => ({ single: () => ({ data: newRecord, error: null }) })
        };
      },
      select: () => createMockQuery(),
    })
  };
}

// Attendance functions
export const saveAttendanceRecord = async (record: AttendanceRecord) => {
  try {
    // Convert the timestamp to ISO string for proper storage
    const recordToSave = {
      ...record,
      timestamp: record.timestamp.toISOString(),
      location: record.location ? JSON.stringify(record.location) : null
    };
    
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(recordToSave)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving attendance record:', error);
    // Return the original record for development without Supabase
    return record;
  }
};

export const getAttendanceRecords = async (userId?: string) => {
  try {
    let query = supabase
      .from('attendance_records')
      .select('*');
    
    // If userId is provided, filter by that user
    if (userId) {
      query = query.eq('userId', userId);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    // Convert back from string to objects
    return (data || []).map(record => ({
      ...record,
      timestamp: new Date(record.timestamp),
      location: record.location ? JSON.parse(record.location) : null
    })) as AttendanceRecord[];
  } catch (error) {
    console.error('Error getting attendance records:', error);
    // Return empty array for development without Supabase
    return [];
  }
};
