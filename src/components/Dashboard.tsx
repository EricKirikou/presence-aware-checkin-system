
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AttendanceForm from './AttendanceForm';
import AttendanceList from './AttendanceList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, CalendarCheck } from "lucide-react";
import UserProfile from './UserProfile';
import { AttendanceRecord } from './AttendanceCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Load sample attendance data on component mount
    if (user) {
      const sampleData: AttendanceRecord[] = [
        {
          id: '1',
          userId: user.id,
          userName: user.name,
          status: 'present',
          method: 'biometric',
          timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
          location: { lat: 40.7128, lng: -74.0060 }
        }
      ];
      setAttendanceRecords(sampleData);
    }
  }, [user]);

  const handleAttendanceSubmit = (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: { lat: number; lng: number } | null;
    timestamp: Date;
  }) => {
    if (!user) return;
    
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      ...data
    };
    
    setAttendanceRecords([newRecord, ...attendanceRecords]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Today's Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceRecords.some(r => 
                r.timestamp.toDateString() === new Date().toDateString()
              ) ? 'Checked In' : 'Not Checked In'}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 bg-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="h-5 w-5 text-accent-foreground" />
              <CardTitle className="text-lg">Attendance Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </div>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {attendanceRecords.filter(r => r.status === 'absent').length}
                </div>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {attendanceRecords.filter(r => r.status === 'late').length}
                </div>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="check-in">Check In</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="check-in" className="mt-6">
          <AttendanceForm onSubmit={handleAttendanceSubmit} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <AttendanceList records={attendanceRecords} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
