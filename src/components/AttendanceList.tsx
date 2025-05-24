
import React from 'react';
import AttendanceCard from './AttendanceCard';
import { AttendanceRecord } from '@/types/attendance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceListProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ records, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading attendance records...</h2>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.userName}</TableCell>
                <TableCell>{record.email}</TableCell>
                <TableCell>
                  {record.timestamp.toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </TableCell>
                <TableCell>
                  <span 
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' : 
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {record.isCheckout ? 'Check-out' : 'Check-in'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceList;
