import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, CalendarCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AttendanceForm from './AttendanceForm';
import CheckoutAttendance from './CheckoutAttendance';
import AttendanceList from './AttendanceList';
import UserProfile from './UserProfile';
import ProfileSettings from './ProfileSettings';
import { AttendanceRecord } from '@/types/attendance';
import { getAttendanceRecords, saveAttendanceRecord } from '@/lib/api';
import { GeoLocation } from '@/types/attendance';

interface AttendanceFormData {
  status: 'present' | 'absent' | 'late';
  method: 'biometric' | 'manual';
  location: GeoLocation | null;
  timestamp: Date;
  isCheckout?: boolean;
  faceImage?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch attendance records
  useEffect(() => {
    const loadRecords = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const records = await getAttendanceRecords(
          user.role === 'admin' ? undefined : user.id
        );
        setAttendanceRecords(records);
      } catch (err) {
        console.error('Failed to fetch records:', err);
        setError('Failed to load attendance data');
        toast({
          title: "Error",
          description: "Could not load attendance records",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [user, toast]);

  // Handle attendance submission
  const handleSubmit = async (data: AttendanceFormData) => {
    if (!user) return;

    try {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name || 'Unknown',
        email: user.email || '',
        status: data.status,
        method: data.method,
        location: data.location,
        timestamp: new Date(data.timestamp),
        isCheckout: data.isCheckout || false,
        ...(data.faceImage && { faceImage: data.faceImage })
      };

      const savedRecord = await saveAttendanceRecord(newRecord);
      setAttendanceRecords(prev => [...prev, savedRecord]);
      
      toast({
        title: "Success",
        description: data.isCheckout 
          ? "Checkout recorded successfully" 
          : "Attendance recorded successfully",
      });
    } catch (error) {
      console.error('Failed to save record:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance record",
        variant: "destructive",
      });
    }
  };

  // Filter today's records
  const todaysRecords = useMemo(() => {
    if (!user) return [];

    const today = new Date();
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return (
        record.userId === user.id &&
        recordDate.getDate() === today.getDate() &&
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getFullYear() === today.getFullYear()
      );
    });
  }, [attendanceRecords, user]);

  // Status checks
  const hasCheckedInToday = todaysRecords.some(r => !r.isCheckout);
  const hasCheckedOutToday = todaysRecords.some(r => r.isCheckout);
  const isAdmin = user?.role === 'admin';

  // Stats calculation
  const stats = useMemo(() => ({
    present: attendanceRecords.filter(r => r.status === 'present' && !r.isCheckout).length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    checkouts: attendanceRecords.filter(r => r.isCheckout).length,
  }), [attendanceRecords]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>
            No user data found. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Today's Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasCheckedInToday ?
                (hasCheckedOutToday ? 'Completed' : 'Checked In') :
                'Not Checked In'}
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-2">{error}</div>
            ) : (
              <div className="flex justify-around text-center">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="check-in">Check In</TabsTrigger>
          <TabsTrigger value="check-out">Check Out</TabsTrigger>
          {isAdmin && <TabsTrigger value="history">History</TabsTrigger>}
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="check-in" className="mt-6">
          <AttendanceForm
            onSubmit={handleSubmit}
            hasCheckedIn={hasCheckedInToday}
          />
        </TabsContent>

        <TabsContent value="check-out" className="mt-6">
          <CheckoutAttendance
            onSubmit={handleSubmit}
            hasCheckedIn={hasCheckedInToday}
            hasCheckedOut={hasCheckedOutToday}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="history" className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Attendance History</h2>
              </div>
            </div>
            <AttendanceList
              records={attendanceRecords}
              isLoading={isLoading}
            />
          </TabsContent>
        )}

        <TabsContent value="profile" className="mt-6">
          <UserProfile />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;