import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "../services/api";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCheck,
  Clock,
  Award,
  XCircle,
  BarChart3,
  RefreshCw,
  UploadCloud,
  FilePlus,
  Eye,
  ArrowUpCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    expired: 0
  });
  const [recent, setRecent] = useState([]);
  const [approvalRate, setApprovalRate] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [health, setHealth] = useState({ status: 'checking', database: 'unknown' });

  // Fallback demo data
  const demoStats = {
    total: 124,
    pending: 12,
    approved: 98,
    expired: 14
  };
  const demoRecent = [
    { _id: '1', recipientName: 'John Doe', courseName: 'React Developer', status: 'approved', issueDate: '2024-01-15' },
    { _id: '2', recipientName: 'Jane Smith', courseName: 'Node.js Expert', status: 'pending', issueDate: '2024-01-14' },
    { _id: '3', recipientName: 'Bob Johnson', courseName: 'Fullstack Pro', status: 'approved', issueDate: '2024-01-13' },
  ];

  const generateMonthlyData = (total) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const avg = total / 12;
    const data = months.map((month, i) => ({
      name: month,
      value: Math.max(0, Math.round(avg + (Math.sin(i / 2) * avg * 0.5)))
    }));
    return data;
  };

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get("/certificates/stats"),
        api.get("/certificates/my")
      ]);
      
      const fetchedStats = statsRes.data.stats || {};
      const safeStats = {
        total: fetchedStats.total || 0,
        pending: fetchedStats.pending || 0,
        approved: fetchedStats.approved || 0,
        expired: fetchedStats.expired || 0
      };
      setStats(safeStats);
      
      setRecent(recentRes.data.certificates?.slice(0, 5) || []);
      setUseFallback(false);

      // Calculate approval rate safely
      const rate = safeStats.total > 0 
        ? Math.round((safeStats.approved / safeStats.total) * 100)
        : 0;
      setApprovalRate(rate);

      // Generate monthly data
      setMonthlyData(generateMonthlyData(safeStats.total));

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Fallback to demo
      setStats(demoStats);
      setRecent(demoRecent);
      setApprovalRate(79); // demo
      setMonthlyData(generateMonthlyData(demoStats.total));
      setUseFallback(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.get('/health');
      setHealth({
        status: res.data.status || 'ok',
        database: res.data.database || 'unknown'
      });
    } catch (err) {
      setHealth({ status: 'down', database: 'disconnected' });
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchHealth();
  }, [fetchData, fetchHealth]);

  // Auto-refresh every 10s
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Socket real-time (keep existing)
  useEffect(() => {
    const handleNewCert = () => fetchData();
    const handleCertUpdated = () => fetchData();
    
    window.addEventListener('newCertificate', handleNewCert);
    window.addEventListener('certificateUpdated', handleCertUpdated);
    
    return () => {
      window.removeEventListener('newCertificate', handleNewCert);
      window.removeEventListener('certificateUpdated', handleCertUpdated);
    };
  }, [fetchData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': case 'valid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ProgressCircle = ({ percentage }) => (
    <svg className="w-32 h-32" viewBox="0 0 36 36">
      <path 
        className="text-gray-200 stroke-[3px] fill-none" 
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path 
        className="text-blue-500 stroke-[3px] fill-none origin-center -rotate-90 transition-all duration-1000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        strokeDasharray={`${113, 113}`}
        strokeDashoffset={113 - (percentage / 100) * 113}
      />
    </svg>
  );
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name || 'Admin'} 
          </h1>
          <p className="text-xl text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {useFallback && (
            <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800 border-orange-200">
              Using demo data (API unavailable)
            </Badge>
          )}
          <div className="mt-2">
            <Badge
              variant="secondary"
              className={
                health.status === 'ok'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              Backend: {health.status} | DB: {health.database}
            </Badge>
          </div>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={refreshing}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group rounded-3xl shadow-xl backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-indigo-500/10 bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border hover:border-blue-200/50">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-blue-100/80 group-hover:bg-blue-200/80 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <UserCheck className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900">{stats.total}</CardTitle>
            <CardDescription>Total Certificates</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group rounded-3xl shadow-xl backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/10 bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border hover:border-emerald-200/50">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-emerald-100/80 group-hover:bg-emerald-200/80 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <Award className="h-7 w-7 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900">{stats.approved}</CardTitle>
            <CardDescription>Approved</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group rounded-3xl shadow-xl backdrop-blur-sm bg-gradient-to-br from-yellow-400/10 to-orange-500/10 bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border hover:border-yellow-200/50">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-yellow-100/80 group-hover:bg-yellow-200/80 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <Clock className="h-7 w-7 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900">{stats.pending}</CardTitle>
            <CardDescription>Pending</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group rounded-3xl shadow-xl backdrop-blur-sm bg-gradient-to-br from-rose-500/10 to-pink-500/10 bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border hover:border-rose-200/50">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-rose-100/80 group-hover:bg-rose-200/80 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <XCircle className="h-7 w-7 text-rose-600" />
            </div>
            <CardTitle className="text-3xl font-black text-gray-900">{stats.expired}</CardTitle>
            <CardDescription>Expired</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Progress & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl shadow-xl backdrop-blur-sm bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 p-8">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <ArrowUpCircle className="h-8 w-8 text-green-600" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <div className="relative">
              <ProgressCircle percentage={approvalRate} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {approvalRate}%
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">of {stats.total} approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-xl backdrop-blur-sm bg-white/80 border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Monthly Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-2">
            <ResponsiveContainer>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tickCount={4} tickMargin={12} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="rounded-3xl shadow-xl backdrop-blur-sm bg-white/80 border-white/50 hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {recent.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No recent certificates</p>
            </div>
          ) : (
            recent.map((cert) => (
              <div key={cert._id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 rounded-2xl transition-colors group">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={cert.recipientPhoto} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                    {cert.recipientName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{cert.courseName}</p>
                  <p className="text-sm text-gray-500 truncate">{cert.recipientName || 'User'}</p>
                  {cert.issueDate && (
                    <p className="text-xs text-gray-400">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge className={`${getStatusColor(cert.status)} font-semibold px-4 py-2 shadow-md`}>
                  {cert.status?.charAt(0).toUpperCase() + cert.status?.slice(1) || 'Unknown'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {user?.role === 'admin' && (
          <>
            <Button 
              onClick={() => navigate('/app/certificates/upload')}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <UploadCloud className="mr-3 h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              Upload Certificate
            </Button>
            <Button 
              onClick={() => navigate('/app/templates/create')}
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <FilePlus className="mr-3 h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              Create Template
            </Button>
            <Button 
              onClick={() => navigate('/app/activity')}
              className="group bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <Eye className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              Activity Logs
            </Button>
          </>
        )}

        {user?.role === 'user' && (
          <>
            <Button 
              onClick={() => navigate('/app/certificates/upload')}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <UploadCloud className="mr-3 h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              Upload Certificate
            </Button>
            <Button 
              onClick={() => navigate('/app/certificates')}
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <Eye className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              My Certificates
            </Button>
            <Button 
              onClick={() => navigate('/app/activity')}
              className="group bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <BarChart3 className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              My Activity
            </Button>
          </>
        )}

        {user?.role === 'verifier' && (
          <>
            <Button 
              onClick={() => navigate('/app/verifier-tools')}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <Eye className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              Verify Certificate
            </Button>
            <Button 
              onClick={() => navigate('/app/activity')}
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <BarChart3 className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              Verification Activity
            </Button>
            <Button 
              onClick={() => navigate('/verify')}
              className="group bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl px-8 py-8 text-xl font-bold rounded-3xl transition-all duration-300 hover:scale-105 h-fit"
            >
              <ArrowUpCircle className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              Public Verify Page
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
