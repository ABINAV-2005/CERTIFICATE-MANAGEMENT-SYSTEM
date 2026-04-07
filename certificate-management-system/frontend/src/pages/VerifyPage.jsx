import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  FileText,
  QrCode,
  Home
} from 'lucide-react';
import { api } from '../services/api';

const VerifyPage = () => {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.get(`/verify/${certificateId}`);
      setCertificate(res.data.certificate || res.data);
    } catch (err) {
      setCertificate(null);
      setError(err.response?.data?.message || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'revoked':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <Award className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      valid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    };
    return variants[status] || variants.valid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Certify</span>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Verify Certificate</CardTitle>
            <CardDescription>
              Enter the certificate ID or scan the QR code to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter certificate ID (e.g., CERT-2024-001)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Or scan QR code</p>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {searched && !loading && (
          <Card>
            <CardContent className="pt-6">
              {error ? (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Certificate Not Found</h3>
                  <p className="text-muted-foreground">{error}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    The certificate ID you entered is not valid or does not exist in our system.
                  </p>
                </div>
              ) : certificate ? (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="text-center">
                    {getStatusIcon(certificate.status)}
                    <h3 className="text-2xl font-bold mt-4">
                      Certificate {certificate.status.toUpperCase()}
                    </h3>
                    <Badge className={`mt-2 ${getStatusBadge(certificate.status)}`}>
                      {certificate.status}
                    </Badge>
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Recipient</p>
                          <p className="font-medium">{certificate.recipientName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Course</p>
                          <p className="font-medium">{certificate.courseName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Issue Date</p>
                          <p className="font-medium">
                            {new Date(certificate.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Certificate ID</p>
                          <p className="font-medium font-mono text-sm">
                            {certificate.certificateId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning for revoked */}
                  {certificate.status === 'revoked' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-600">This certificate has been revoked</p>
                          <p className="text-sm text-red-600/80 mt-1">
                            Reason: {certificate.revokeReason || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;

