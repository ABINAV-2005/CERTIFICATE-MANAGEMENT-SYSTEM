import { useState } from 'react';
import { verifyAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function VerifierToolsPage() {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    try {
      setLoading(true);
      const res = await verifyAPI.verifyById(certificateId.trim());
      setResult(res.data.certificate || null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifier Tools</h1>
        <p className="text-muted-foreground">Quickly validate any certificate ID</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex gap-2">
            <Input
              placeholder="Enter certificate ID"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
            />
            <Button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Verify'}</Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>ID:</strong> {result.certificateId}</p>
            <p><strong>Recipient:</strong> {result.recipientName}</p>
            <p><strong>Course:</strong> {result.courseName}</p>
            <p><strong>Issue Date:</strong> {new Date(result.issueDate).toLocaleDateString()}</p>
            <Badge variant={result.status === 'valid' ? 'default' : 'destructive'}>{result.status}</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
