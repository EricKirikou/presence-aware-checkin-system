// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  LinearProgress,
  useTheme,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import {
  Refresh,
  People,
  Schedule,
  Alarm,
  ExitToApp,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';
import SidebarLayout from './SidebarLayout';
import DashboardHeader from './DashboardHeader';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  checkInTime: string;
  status: 'on-time' | 'late' | 'early-departure' | 'absent';
  department?: string;
}

interface AttendanceTrend {
  date: string;
  onTimePercentage: number;
  latePercentage: number;
}

interface DashboardStats {
  totalEmployees: number;
  newEmployeesToday: number;
  onTimeCount: number;
  lateArrivals: number;
  earlyDepartures: number;
  attendanceTrend: AttendanceTrend[];
  recentCheckIns: AttendanceRecord[];
}

const StatCard = ({ title, value, change, icon, trend, loading = false }: any) => {
  const theme = useTheme();
  return (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 150, display: 'flex', flexDirection: 'column', boxShadow: theme.shadows[2], position: 'relative' }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light', color: 'primary.main', mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="medium">{title}</Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>{loading ? '--' : value}</Typography>
      <Box display="flex" alignItems="center" mt={1}>
        {trend === 'up' ? <ArrowUpward color="success" fontSize="small" /> : trend === 'down' ? <ArrowDownward color="error" fontSize="small" /> : null}
        <Typography variant="body2" color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'} ml={0.5}>{change}</Typography>
      </Box>
    </Paper>
  );
};

const RecentActivity = ({ records, loading, error }: any) => {
  const theme = useTheme();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'success';
      case 'late': return 'warning';
      case 'early-departure': return 'error';
      default: return 'default';
    }
  };

  if (error) {
    return <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[2], mt: 3 }}><Alert severity="error">{error}</Alert></Paper>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[2], mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>Recent Check-Ins</Typography>
      {loading ? <LinearProgress /> : records.length === 0 ? <Typography color="text.secondary">No recent activity</Typography> : (
        <TableContainer>
          <Table>
            <TableBody>
              {records.map((record: AttendanceRecord) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{ mr: 2, width: 40, height: 40 }}
                        alt={record.userName}
                        src={record.userImage || undefined}
                      >
                        {!record.userImage && record.userName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">{record.userName}</Typography>
                        <Typography variant="body2" color="text.secondary">{record.department || 'No department'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={record.status.replace('-', ' ')} color={getStatusColor(record.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(record.checkInTime).toLocaleTimeString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(record.checkInTime).toLocaleDateString()}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/v1/stats/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to load dashboard data');
      setStats(result.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setStats({
        totalEmployees: 124,
        newEmployeesToday: 2,
        onTimeCount: 98,
        lateArrivals: 12,
        earlyDepartures: 6,
        attendanceTrend: [],
        recentCheckIns: [],
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SidebarLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
          <Box>
            <Typography variant="h4" fontWeight="bold" mb={1}>Welcome, {user?.name || "User"} 👋</Typography>
            <Typography variant="subtitle1" color="text.secondary">{dateString} • {timeString}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={fetchDashboardData} color="inherit" disabled={loading}><Refresh /></IconButton>
            <DashboardHeader />
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={3} mb={4}>
          <StatCard title="Total Employees" value={stats?.totalEmployees || 0} change={`${stats?.newEmployeesToday || 0} new today`} icon={<People />} trend="neutral" loading={loading} />
          <StatCard title="On Time" value={stats?.onTimeCount || 0} change={`${stats?.onTimeCount ? Math.round((stats.onTimeCount / stats.totalEmployees) * 100) : 0}%`} icon={<Schedule />} trend="up" loading={loading} />
          <StatCard title="Late Arrivals" value={stats?.lateArrivals || 0} change={`${stats?.lateArrivals ? Math.round((stats.lateArrivals / stats.totalEmployees) * 100) : 0}%`} icon={<Alarm />} trend="down" loading={loading} />
          <StatCard title="Early Departures" value={stats?.earlyDepartures || 0} change={`${stats?.earlyDepartures ? Math.round((stats.earlyDepartures / stats.totalEmployees) * 100) : 0}%`} icon={<ExitToApp />} trend="down" loading={loading} />
        </Box>

        {stats?.attendanceTrend && stats.attendanceTrend.length > 0 && (
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[2], mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Weekly Attendance Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onTimePercentage" name="On Time" stroke="#4caf50" />
                <Line type="monotone" dataKey="latePercentage" name="Late" stroke="#ff9800" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}

        <RecentActivity records={stats?.recentCheckIns || []} loading={loading} error={error} />

        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={2}>
            Last updated: {lastUpdated}
          </Typography>
        )}
      </Box>
    </SidebarLayout>
  );
};

export default Dashboard;
