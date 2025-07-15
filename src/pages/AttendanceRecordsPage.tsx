import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

type AttendanceRecord = {
  _id: string;
  userName: string;
  status: string;
  locationName?: string;
  timestamp: string;
};

const AttendanceRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/attendance`);
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        console.error('Failed to fetch attendance records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Attendance Records</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : records.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No records found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {records.map((record) => (
              <Card
                key={record._id}
                className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl border dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {record.userName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: <span className="font-medium">{record.status}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location: {record.locationName || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-sm text-right text-gray-500 dark:text-gray-400">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AttendanceRecordsPage;
