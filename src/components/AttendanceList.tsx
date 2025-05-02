
import React from 'react';
import AttendanceCard, { AttendanceRecord } from './AttendanceCard';

interface AttendanceListProps {
  records: AttendanceRecord[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Check-ins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => (
          <AttendanceCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
};

export default AttendanceList;
