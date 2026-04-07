import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Shield, FileCheck, QrCode, Users, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: FileCheck,
      title: 'Certificate Generation',
      description: 'Create professional certificates with custom templates and dynamic fields.'
    },
    {
      icon: QrCode,
      title: 'QR Code Verification',
      description: 'Every certificate comes with a unique QR code for instant verification.'
    },
    {
      icon: Shield,
      title: 'Secure & Tamper-Proof',
      description: 'Blockchain-style verification system ensures certificate authenticity.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Manage admins, users, and verifiers with granular permissions.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track certificate issuance, validity, and user activity in real-time.'
    },
    {
      icon: Award,
      title: 'PDF Export',
      description: 'Download certificates as high-quality PDF documents.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Certify</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Secure Certificate<br />Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, issue, and verify certificates with ease. Our platform provides
            tamper-proof digital certificates with QR code verification.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Start Free
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="px-8">
                Verify Certificate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of organizations using Certify to manage their certificates securely.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Certify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

