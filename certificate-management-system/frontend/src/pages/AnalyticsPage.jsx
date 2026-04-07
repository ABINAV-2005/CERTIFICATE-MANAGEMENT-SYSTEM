import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Users, Award, XCircle, TrendingUp, Download, Calendar 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { certificatesAPI } from '../services/api';

const AnalyticsPage = () => {
  const [certStats, setCertStats] = useState({});
  const [stats, setStats] = useState({}); // For the top cards
  const [topEmployees, setTopEmployees] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: These should ideally come from your API. 
  // Providing empty arrays to prevent "is not defined" errors.
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [certRes, empRes, courseRes] = await Promise.all([
        certificatesAPI.getStats(),
        certificatesAPI.getEmployeeStats(),
        certificatesAPI.getCertificateStats()
      ]);
      
      // Assuming certRes.data contains both specific status counts and general stats
      setCertStats(certRes.data.stats || {});
      setStats(certRes.data.overview || {}); 
      setTopEmployees(empRes.data.topEmployees || []);
      setTopCourses(courseRes.data.topCourses || []);
      
      // Mocking trend data if not in API yet
      setMonthlyData(certRes.data.monthlyTrend || []);
      setWeeklyData(certRes.data.weeklyActivity || []);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fixed the color mapping logic
  const colors = {
    pending: '#f59e0b',
    approved: '#3b82f6',
    valid: '#22c55e',
    revoked: '#ef4444',
    expired: '#eab308'
  };

  const statusData = Object.entries(certStats)
    .filter(([key]) => ['pendingCertificates', 'approvedCertificates', 'validCertificates', 'revokedCertificates', 'expiredCertificates'].includes(key))
    .map(([key, value]) => {
      const name = key.replace('Certificates', '');
      return {
        name,
        value,
        color: colors[name.toLowerCase()] || '#6b7280'
      };
    });

  const statCards = [
    {
      title: 'Total Certificates',
      value: stats.totalCertificates || 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+12.5%'
    },
    {
      title: 'Active Certificates',
      value: stats.activeCertificates || 0,
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: '+8.2%'
    },
    {
      title: 'Revoked Certificates',
      value: stats.revokedCertificates || 0,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      trend: '-2.4%'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      trend: '+15.3%'
    }
  ];

  if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor certificate issuance and user activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Last 30 Days</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Certificates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="certificates" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;

