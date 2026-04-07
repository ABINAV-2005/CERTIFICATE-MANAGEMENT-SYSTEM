import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { activityAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function ActivityPage() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [isAdmin]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await activityAPI.getAll() : await activityAPI.getMy();
      setLogs(res.data.logs || []);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const hay = `${log.action} ${log.description || ''}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground">Audit trail and recent actions</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No activity found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((log) => (
                <div key={log._id} className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{log.action}</Badge>
                      {isAdmin && log.userId?.email && (
                        <span className="text-xs text-muted-foreground">{log.userId.email}</span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{log.description || 'No description'}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
