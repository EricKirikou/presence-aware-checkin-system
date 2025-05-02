
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  status: 'present' | 'absent' | 'late';
  method: 'biometric' | 'manual';
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  } | null;
}

interface AttendanceCardProps {
  record: AttendanceRecord;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ record }) => {
  const statusConfig = {
    present: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      label: 'Present'
    },
    absent: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800',
      label: 'Absent'
    },
    late: {
      icon: Clock,
      color: 'bg-amber-100 text-amber-800',
      label: 'Late'
    }
  };

  const StatusIcon = statusConfig[record.status].icon;

  return (
    <Card className="w-full">
      <CardHeader className="py-3 flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${record.status === 'present' ? 'text-green-600' : record.status === 'absent' ? 'text-red-600' : 'text-amber-600'}`} />
          <span className="font-semibold">{record.userName}</span>
        </div>
        <Badge className={cn(statusConfig[record.status].color)}>
          {statusConfig[record.status].label}
        </Badge>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {record.timestamp.toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Check-in method: {record.method === 'biometric' ? 'Biometric scan' : 'Manual entry'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-3 text-xs">
        {record.location && (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>
              {record.location.lat.toFixed(6)}, {record.location.lng.toFixed(6)}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AttendanceCard;
