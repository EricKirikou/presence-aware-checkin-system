
import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord } from '@/types/attendance';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Attendance functions
export const saveAttendanceRecord = async (record: AttendanceRecord) => {
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
};

export const getAttendanceRecords = async (userId?: string) => {
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
  return data.map(record => ({
    ...record,
    timestamp: new Date(record.timestamp),
    location: record.location ? JSON.parse(record.location) : null
  })) as AttendanceRecord[];
};
