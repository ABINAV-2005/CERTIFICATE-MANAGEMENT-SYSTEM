import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api, BACKEND_BASE } from '@/services/api';
import { Download, Upload } from 'lucide-react';

const demoCertificates = [
  {
    _id: 'demo-1',
    certificateId: 'CERT-001',
    recipientName: 'John Doe',
    courseName: 'AWS Certified Cloud Practitioner',
    fromDate: '2023-01-01',
    toDate: '2023-12-31',
    expiryDate: '2024-02-01',
    status: 'expired',
    pdfUrl: '/demo/cert-001.pdf'
  },
  {
    _id: 'demo-2',
    certificateId: 'CERT-002',
    recipientName: 'Sarah Smith',
    courseName: 'React Developer Certification',
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    expiryDate: '2027-01-01',
    status: 'approved',
    pdfUrl: '/demo/cert-002.pdf'
  },
  {
    _id: 'demo-3',
    certificateId: 'CERT-003',
    recipientName: 'Michael Lee',
    courseName: 'Cyber Security Professional',
    fromDate: '2024-03-01',
    toDate: '2024-09-30',
    expiryDate: '2026-05-10',
    status: 'pending',
    pdfUrl: '/demo/cert-003.pdf'
  }
];

export default function CertificatesPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/certificates/all' : '/certificates/my';
      const res = await api.get(endpoint);
      const data = res.data.certificates || [];
      const useDemo = data.length === 0;
      setIsDemoData(useDemo);
      setCertificates(useDemo ? demoCertificates : data);
    } catch (err) {
      toast({
        title: 'Error loading certificates',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
      if (isAdmin) {
        setIsDemoData(true);
        setCertificates(demoCertificates);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (isDemoData) return;
    try {
      await api.put(`/certificates/${id}/approve`);
      toast({ title: 'Approved', description: 'Certificate status updated' });
      fetchCertificates();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (id) => {
    if (isDemoData) return;
    try {
      await api.put(`/certificates/${id}/reject`);
      toast({ title: 'Rejected', description: 'Certificate status updated' });
      fetchCertificates();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const downloadCertificate = async (pdfUrl, certificateId) => {
    if (isDemoData) return;

    try {
      if (certificateId) {
        const res = await api.get(`/certificates/download/${certificateId}`, {
          responseType: 'blob'
        });
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      window.open(`${BACKEND_BASE}${pdfUrl}`, '_blank');
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/certificates/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificates-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'CSV exported', description: 'Certificate data downloaded successfully.' });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const form = new FormData();
      form.append('csv', file);
      const res = await api.post('/certificates/import/csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast({ title: 'Import successful', description: res.data.message || 'Certificates imported.' });
      fetchCertificates();
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleView = (cert) => {
    if (!cert?.pdfUrl) {
      toast({
        title: 'View failed',
        description: 'No uploaded file found for this certificate.',
        variant: 'destructive'
      });
      return;
    }
    window.open(`${BACKEND_BASE}${cert.pdfUrl}`, '_blank');
  };

  const handleUpdate = async (cert) => {
    if (isDemoData) return;

    const recipientName = window.prompt('Recipient Name', cert.recipientName);
    if (recipientName === null) return;
    const courseName = window.prompt('Course Name', cert.courseName);
    if (courseName === null) return;
    const fromDate = window.prompt('From Date (YYYY-MM-DD)', cert.fromDate?.slice?.(0, 10) || '');
    if (fromDate === null) return;
    const toDate = window.prompt('To Date (YYYY-MM-DD)', cert.toDate?.slice?.(0, 10) || '');
    if (toDate === null) return;
    const expiryDate = window.prompt('Expiry Date (YYYY-MM-DD)', cert.expiryDate?.slice?.(0, 10) || '');
    if (expiryDate === null) return;

    try {
      await api.put(`/certificates/${cert._id}`, {
        recipientName,
        courseName,
        fromDate,
        toDate,
        expiryDate
      });
      toast({ title: 'Updated', description: 'Certificate updated successfully' });
      fetchCertificates();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (cert) => {
    if (isDemoData) return;
    const yes = window.confirm(`Delete certificate ${cert.certificateId}?`);
    if (!yes) return;

    try {
      await api.delete(`/certificates/${cert._id}`);
      toast({ title: 'Deleted', description: 'Certificate deleted successfully' });
      fetchCertificates();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
      case 'valid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
      case 'rejected':
      case 'revoked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateStr) => {
    return dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent drop-shadow-lg">
              {isAdmin ? 'Certificate Dashboard' : 'My Certificates'}
            </h1>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              {isAdmin ? 'Manage all certificates' : 'View your certificates'}
              {isDemoData && (
                <Badge variant="secondary" className="ml-3 bg-yellow-100 text-yellow-800 border-yellow-300">
                  Demo Mode
                </Badge>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={fetchCertificates}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl h-12 px-8 text-lg font-semibold"
            >
              Refresh
            </Button>
            {isAdmin && !isDemoData && (
              <>
                <Button size="lg" variant="outline" onClick={handleExportCsv} className="h-12 px-5">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleImportCsv}
                    disabled={importing}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border px-5 h-12 text-sm font-medium cursor-pointer bg-white hover:bg-slate-50">
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Import CSV'}
                  </span>
                </label>
              </>
            )}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              Certificates
              <span className="text-lg text-slate-500 font-normal">({certificates.length})</span>
              {isDemoData && <Badge variant="destructive" className="animate-pulse">DEMO DATA</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <div className="p-16 text-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl border-2 border-dashed border-slate-200">
                <h3 className="text-2xl font-bold text-slate-700 mb-2">No certificates yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert._id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-900 transition-colors">{cert.recipientName}</h3>
                          <p className="text-sm text-slate-500 font-medium">{cert.courseName}</p>
                        </div>
                        <Badge variant={getStatusVariant(cert.status)} className="text-sm px-3 py-1 font-semibold shadow-md">
                          {cert.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600 font-medium">From - To</span>
                          <span className="font-semibold text-slate-900">
                            {formatDate(cert.fromDate)} - {formatDate(cert.toDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-100">
                          <span className="text-sm text-slate-600 font-medium">Expires</span>
                          <span className="font-semibold">{formatDate(cert.expiryDate)}</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleApprove(cert._id)}
                            disabled={['approved', 'valid'].includes(cert.status) || isDemoData}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleReject(cert._id)}
                            disabled={['rejected', 'revoked'].includes(cert.status) || isDemoData}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => downloadCertificate(cert.pdfUrl, cert._id)}
                            disabled={isDemoData}
                          >
                            Download
                          </Button>
                        </div>
                      )}

                      {!isAdmin && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleView(cert)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => handleUpdate(cert)}
                            disabled={isDemoData}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleDelete(cert)}
                            disabled={isDemoData}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
