import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '../services/api';
import { Loader2, Upload, Image, Pen } from 'lucide-react';

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    signatureName: '',
    signatureTitle: ''
  });

  const [files, setFiles] = useState({
    backgroundImage: null,
    logo: null,
    signature: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const previewUrl = (file) => (file ? URL.createObjectURL(file) : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('signatureName', formData.signatureName);
      payload.append('signatureTitle', formData.signatureTitle);
      payload.append('fields', JSON.stringify([]));

      if (files.backgroundImage) payload.append('backgroundImage', files.backgroundImage);
      if (files.logo) payload.append('logo', files.logo);
      if (files.signature) payload.append('signature', files.signature);

      await api.post('/templates', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/app/templates');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Template</h1>
        <p className="text-muted-foreground">
          Create a new certificate template
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Fill in the template information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Professional Certificate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Template description"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 flex-1">
                  {files.backgroundImage ? (
                    <img
                      src={previewUrl(files.backgroundImage)}
                      alt="Background"
                      className="h-32 w-full object-cover rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Upload background image</p>
                    </div>
                  )}
                </div>
                <Label htmlFor="background-upload" className="cursor-pointer">
                  <span className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    Upload
                  </span>
                  <Input
                    id="background-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'backgroundImage')}
                  />
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 w-32 h-32 flex items-center justify-center">
                  {files.logo ? (
                    <img src={previewUrl(files.logo)} alt="Logo" className="h-full object-contain" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    Upload
                  </span>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Signature Image</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 w-48 h-20 flex items-center justify-center">
                  {files.signature ? (
                    <img src={previewUrl(files.signature)} alt="Signature" className="h-full object-contain" />
                  ) : (
                    <Pen className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Label htmlFor="signature-upload" className="cursor-pointer">
                  <span className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    Upload
                  </span>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'signature')}
                  />
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signatureName">Signature Name</Label>
                <Input
                  id="signatureName"
                  name="signatureName"
                  value={formData.signatureName}
                  onChange={handleChange}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureTitle">Signature Title</Label>
                <Input
                  id="signatureTitle"
                  name="signatureTitle"
                  value={formData.signatureTitle}
                  onChange={handleChange}
                  placeholder="Director"
                />
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateTemplatePage;
