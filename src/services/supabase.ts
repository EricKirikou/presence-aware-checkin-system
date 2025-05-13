
import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord } from '@/types/attendance';

// Initialize Supabase client with the provided URL and key
const supabaseUrl = 'https://qggdrunhlhuidxwwkhtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ2RydW5obGh1aWR4d3draHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY3NzYsImV4cCI6MjA2MjY3Mjc3Nn0.YVKQ4gY2bmzG9IBjFZM9hQiFG8zEnhpMeDU5HByFT6A';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    // Return the original record in case of error
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
    // Return empty array in case of error
    return [];
  }
};
