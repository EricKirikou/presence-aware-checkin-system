import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import SidebarLayout from './SidebarLayout';
import DashboardHeader from './DashboardHeader';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  checkInTime: string;
  checkOutTime?: string | null;
  status: 'on-time' | 'late';
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
  recentCheckIns: CheckIn[];
  attendanceTrend: AttendanceTrend[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/stats/dashboard`);
        setStats(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !stats) {
    return (
      <SidebarLayout>
        <div className="text-center text-red-500 mt-10">
          <p className="text-lg font-semibold">Error loading dashboard</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </SidebarLayout>
    );
  }

  const {
    totalEmployees,
    newEmployeesToday,
    onTimeCount,
    lateArrivals,
    earlyDepartures,
    recentCheckIns,
    attendanceTrend,
  } = stats;

  const barData = {
    labels: ['On Time', 'Late', 'Early Departure'],
    datasets: [{
      label: 'Today',
      data: [onTimeCount, lateArrivals, earlyDepartures],
      backgroundColor: ['#4ade80', '#f87171', '#facc15']
    }]
  };

  const pieData = {
    labels: ['Total Employees', 'New Today'],
    datasets: [{
      data: [totalEmployees, newEmployeesToday],
      backgroundColor: ['#60a5fa', '#a78bfa']
    }]
  };

  const lineData = {
    labels: attendanceTrend.map(t => format(parseISO(t.date), 'MMM dd')),
    datasets: [
      {
        label: 'On Time (%)',
        data: attendanceTrend.map(t => t.onTimePercentage),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        tension: 0.3
      },
      {
        label: 'Late (%)',
        data: attendanceTrend.map(t => t.latePercentage),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.3
      }
    ]
  };

  return (
    <SidebarLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Overview of employee attendance"
        />

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Employees" value={totalEmployees} />
          <StatCard label="New Today" value={newEmployeesToday} color="text-indigo-600" />
          <StatCard label="On Time" value={onTimeCount} color="text-green-600" />
          <StatCard label="Late Arrivals" value={lateArrivals} color="text-red-600" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartBox title="Today's Attendance">
            <Bar data={barData} options={{ responsive: true }} />
          </ChartBox>
          <ChartBox title="Employee Distribution">
            <Pie data={pieData} options={{ responsive: true }} />
          </ChartBox>
        </div>

        {/* Line Chart */}
        <ChartBox title="Weekly Attendance Trend">
          <Line
            data={lineData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback(this, tickValue) {
                      if (typeof tickValue === 'number') {
                        return `${tickValue}%`;
                      }
                      return tickValue;
                    }
                  }
                }
              }

            }}
          />
        </ChartBox>

        {/* Recent Check-ins */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Check-Ins</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Employee</th>
                  <th className="text-left px-4 py-2">Department</th>
                  <th className="text-left px-4 py-2">Check-In Time</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentCheckIns.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 flex items-center gap-2">
                      {rec.userImage && (
                        <img src={rec.userImage} alt={rec.userName} className="w-8 h-8 rounded-full" />
                      )}
                      {rec.userName}
                    </td>
                    <td className="px-4 py-2">{rec.department || 'N/A'}</td>
                    <td className="px-4 py-2">{format(new Date(rec.checkInTime), 'hh:mm a')}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${rec.status === 'on-time'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {rec.status === 'on-time' ? 'On Time' : 'Late'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

const StatCard = ({
  label,
  value,
  color = 'text-gray-800'
}: {
  label: string;
  value: number;
  color?: string;
}) => (
  <div className="bg-white p-4 rounded shadow">
    <h4 className="text-sm text-gray-500">{label}</h4>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const ChartBox = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded shadow">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="h-[320px]">{children}</div>
  </div>
);

export default Dashboard;
