import React, { useState, useEffect } from 'react';
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch records');
        }

        setAttendanceRecords(data.records);
      } catch (err: any) {
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

    fetchRecords();
  }, [user]);

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
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="check-in">Check In</TabsTrigger>
          <TabsTrigger value="check-out">Check Out</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <AttendanceList records={attendanceRecords} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="check-in" className="mt-6">
          <AttendanceForm onSubmit={() => {}} hasCheckedIn={false} />
        </TabsContent>

        <TabsContent value="check-out" className="mt-6">
          <CheckoutAttendance onSubmit={() => {}} hasCheckedIn={false} hasCheckedOut={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
