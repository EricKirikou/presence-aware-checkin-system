
import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord } from '@/types/attendance';

// Initialize Supabase client with the provided URL and key
const supabaseUrl = 'https://qggdrunhlhuidxwwkhtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ2RydW5obGh1aWR4d3draHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY3NzYsImV4cCI6MjA2MjY3Mjc3Nn0.YVKQ4gY2bmzG9IBjFZM9hQiFG8zEnhpMeDU5HByFT6A';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if user has already checked in on the same day
export const hasCheckedInToday = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
    console.log('Checking for check-ins between:', startOfDay, 'and', endOfDay);
    console.log('For user:', userId);
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', startOfDay)
      .lte('timestamp', endOfDay)
      .eq('isCheckout', false);
    
    if (error) {
      console.error('Error in hasCheckedInToday:', error);
      throw error;
    }
    
    console.log('Found records:', data);
    // If we have any records, the user has already checked in today
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking for today\'s attendance:', error);
    throw error; // Let the caller handle this error
  }
};

// Attendance functions
export const saveAttendanceRecord = async (record: AttendanceRecord): Promise<AttendanceRecord> => {
  try {
    // Check if this is a check-in (not a checkout)
    if (!record.isCheckout) {
      try {
        // Check if the user has already checked in today
        const alreadyCheckedIn = await hasCheckedInToday(record.userId);
        if (alreadyCheckedIn) {
          throw new Error('You have already checked in today.');
        }
      } catch (error: any) {
        // If error occurred during the check, re-throw it
        throw error;
      }
    }
    
    // Prepare record for storage - serialize the location object to JSON string for storage
    const recordToSave = {
      ...record,
      timestamp: record.timestamp.toISOString(),
      location: record.location ? JSON.stringify(record.location) : null
    };
    
    console.log('Saving record:', recordToSave);
    
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(recordToSave)
      .select()
      .single();
      
    if (error) {
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
  } catch (error) {
    console.error('Error saving attendance record:', error);
    // Re-throw the error so it can be handled by the component
    throw error;
  }
};

export const getAttendanceRecords = async (userId?: string): Promise<AttendanceRecord[]> => {
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
    // Return empty array in case of error
    return [];
  }
};
