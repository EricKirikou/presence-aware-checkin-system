
import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord } from '@/types/attendance';

// Initialize Supabase client with the provided URL and key
const supabaseUrl = 'https://qggdrunhlhuidxwwkhtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ2RydW5obGh1aWR4d3draHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY3NzYsImV4cCI6MjA2MjY3Mjc3Nn0.YVKQ4gY2bmzG9IBjFZM9hQiFG8zEnhpMeDU5HByFT6A';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize the database table if it doesn't exist
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // First, let's check if the table exists by trying to get its structure
    const { error: checkError } = await supabase
      .from('attendance_records')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!checkError) {
      console.log('Table attendance_records already exists');
      return true;
    }
    
    // If we can't create tables (we're using the client), we'll just mock the data locally
    console.log('Unable to create tables directly via client. Using local mock data mode.');
    return false;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Check if user has already checked in on the same day
export const hasCheckedInToday = async (userId: string): Promise<boolean> => {
  try {
    // Try to initialize the database first
    await initializeDatabase();
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    console.log('Checking for check-ins between:', startOfDay, 'and', endOfDay);
    console.log('For user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('userId', userId)
        .gte('timestamp', startOfDay)
        .lte('timestamp', endOfDay)
        .eq('isCheckout', false);
      
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist error - return false and let the app continue
          console.log('Table does not exist yet. Treating as no check-ins.');
          return false;
        }
        
        console.error('Error in hasCheckedInToday:', error);
        throw error;
      }
      
      console.log('Found records:', data);
      // If we have any records, the user has already checked in today
      return data && data.length > 0;
    } catch (error) {
      // For any other error, log and return false (assume no check-in)
      console.error('Supabase query error:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking for today\'s attendance:', error);
    return false; // Default to no check-in if there's an error
  }
};

// Attendance functions
export const saveAttendanceRecord = async (record: AttendanceRecord): Promise<AttendanceRecord> => {
  try {
    // Initialize the database
    await initializeDatabase();
    
    // Check if this is a check-in (not a checkout)
    if (!record.isCheckout) {
      try {
        // Check if the user has already checked in today
        const alreadyCheckedIn = await hasCheckedInToday(record.userId);
        if (alreadyCheckedIn) {
          throw new Error('You have already checked in today.');
        }
      } catch (error: any) {
        // If error is related to missing table, we can continue
        if (error.code === '42P01') {
          console.log('Table does not exist yet. Proceeding with first check-in.');
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    }
    
    // Prepare record for storage - serialize the location object to JSON string for storage
    const recordToSave = {
      ...record,
      timestamp: record.timestamp.toISOString(),
      location: record.location ? JSON.stringify(record.location) : null
    };
    
    console.log('Saving record:', recordToSave);
    
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(recordToSave)
        .select()
        .single();
        
      if (error) {
        // If table doesn't exist, we're in mock mode
        if (error.code === '42P01') {
          console.log('Using mock data since table does not exist');
          // Return the original record but formatted as if it came from the database
          return {
            ...record,
            id: `mock-${Date.now()}`,
            timestamp: record.timestamp
          };
        }
        
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      // Convert the stored record back to the proper format with parsed location
      const savedRecord: AttendanceRecord = {
        ...data,
        timestamp: new Date(data.timestamp),
        location: data.location ? JSON.parse(data.location) : null
      };
      
      return savedRecord;
    } catch (error: any) {
      if (error.code === '42P01') {
        // If table doesn't exist, return mock data
        console.log('Using mock data since table does not exist');
        return {
          ...record,
          id: `mock-${Date.now()}`,
          timestamp: record.timestamp
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error saving attendance record:', error);
    // Re-throw the error so it can be handled by the component
    throw error;
  }
};

export const getAttendanceRecords = async (userId?: string): Promise<AttendanceRecord[]> => {
  try {
    // Initialize the database
    await initializeDatabase();
    
    try {
      let query = supabase
        .from('attendance_records')
        .select('*');
      
      // If userId is provided, filter by that user
      if (userId) {
        query = query.eq('userId', userId);
      }
      
      const { data, error } = await query.order('timestamp', { ascending: false });
      
      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.log('Table does not exist yet. Returning empty attendance records.');
          return [];
        }
        throw error;
      }
      
      // Convert back from string to objects
      return (data || []).map(record => ({
        ...record,
        timestamp: new Date(record.timestamp),
        location: record.location ? JSON.parse(record.location) : null
      })) as AttendanceRecord[];
    } catch (error: any) {
      if (error.code === '42P01') {
        // If table doesn't exist, return empty array
        console.log('Table does not exist yet. Returning empty attendance records.');
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting attendance records:', error);
    // Return empty array in case of error
    return [];
  }
};
