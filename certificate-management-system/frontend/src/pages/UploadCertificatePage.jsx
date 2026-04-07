import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function UploadCertificatePage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    recipientName: '',
    courseName: '',
    fromDate: '',
    toDate: '',
    expiryDate: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a certificate file",
        variant: "destructive"
      });
      return;
    }

    if (!formData.courseName || !formData.recipientName || !formData.fromDate || !formData.toDate || !formData.expiryDate) {
      toast({
        title: "Incomplete form",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('file', file);
      data.append('recipientName', formData.recipientName);
      data.append('courseName', formData.courseName);
      data.append('fromDate', formData.fromDate);
      data.append('toDate', formData.toDate);
      data.append('expiryDate', formData.expiryDate);

      await api.post('/certificates/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Success!",
        description: "Certificate uploaded successfully"
      });

      // Reset form
      setFormData({
        recipientName: '',
        courseName: '',
        fromDate: '',
        toDate: '',
        expiryDate: ''
      });
      setFile(null);

    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📄 Upload Certificate
            </CardTitle>
            <CardDescription className="text-center">
              Fill the form and upload your certificate file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    placeholder="John Doe"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="Full Stack Web Development"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Certificate File (PDF, PNG, JPG)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-all mt-2">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="file" 
                    className="cursor-pointer block w-full"
                  >
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                      <p className="font-medium text-gray-900 mb-1">
                        {file ? file.name : 'Click to select certificate file'}
                      </p>
                      <p className="text-sm text-muted-foreground">Max 10MB - PDF, PNG, JPG supported</p>
                    </div>
                  </label>
                  {file && (
                    <Badge variant="secondary" className="mt-3 ml-1">
                      ✅ Selected
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6 font-semibold rounded-2xl shadow-lg"
                disabled={loading || !file || Object.values(formData).some(v => !v.trim())}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading Certificate...
                  </>
                ) : (
                  '🚀 Upload & Submit Certificate'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
