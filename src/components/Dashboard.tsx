
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AttendanceForm from './AttendanceForm';
import AttendanceList from './AttendanceList';
import CheckoutAttendance from './CheckoutAttendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, CalendarCheck, LogOut, Users } from "lucide-react";
import UserProfile from './UserProfile';
import { AttendanceRecord } from '@/types/attendance';
import ProfileSettings from './ProfileSettings';
import { saveAttendanceRecord, getAttendanceRecords } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch attendance records from the database
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // For admin, get all records, for regular user get only their records
        const records = await getAttendanceRecords(user.role === 'admin' ? undefined : user.id);
        setAttendanceRecords(records);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        toast({
          title: "Failed to load attendance data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [user, toast]);

  const handleAttendanceSubmit = async (data: {
    status: 'present' | 'absent' | 'late';
    method: 'biometric' | 'manual';
    location: { lat: number; lng: number; locationName?: string } | null;
    timestamp: Date;
    isCheckout?: boolean;
    faceImage?: string;
  }) => {
    if (!user) return;
    
    try {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        email: user.email,
        ...data,
        isCheckout: data.isCheckout || false
      };
      
      // Save the record to the database
      const savedRecord = await saveAttendanceRecord(newRecord);
      
      // Update local state with the returned record from the database
      setAttendanceRecords(prev => [savedRecord, ...prev]);
      
      toast({
        title: data.isCheckout ? "Checkout recorded" : "Check-in recorded",
        description: `Your attendance has been saved successfully`,
      });

      return savedRecord;
    } catch (error: any) {
      console.error('Error saving attendance record:', error);
      toast({
        title: "Failed to save attendance",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error; // Re-throw so the form can handle it
    }
  };

  // Check if user is an admin
  const isAdmin = user?.role === 'admin';

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
                r.timestamp.toDateString() === new Date().toDateString() && !r.isCheckout
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
                  {attendanceRecords.filter(r => r.status === 'present' && !r.isCheckout).length}
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
              <div>
                <div className="text-2xl font-bold">
                  {attendanceRecords.filter(r => r.isCheckout).length}
                </div>
                <p className="text-xs text-muted-foreground">Checkouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="check-in">Check In</TabsTrigger>
          <TabsTrigger value="check-out">Check Out</TabsTrigger>
          {isAdmin && <TabsTrigger value="history">History</TabsTrigger>}
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="check-in" className="mt-6">
          <AttendanceForm onSubmit={handleAttendanceSubmit} />
        </TabsContent>
        <TabsContent value="check-out" className="mt-6">
          <CheckoutAttendance onSubmit={handleAttendanceSubmit} />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="history" className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Attendance History</h2>
              </div>
              <p className="text-muted-foreground">View and manage all attendance records</p>
            </div>
            <AttendanceList records={attendanceRecords} isLoading={isLoading} />
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
