import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Award, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // ✅ Always go to dashboard
      navigate('/app/dashboard', { replace: true });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        (err?.message === 'Network Error'
          ? 'Cannot reach backend. Please start backend and check MongoDB connection.'
          : 'Login failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Award className="h-10 w-10 text-primary" />
          <span className="font-bold text-2xl">Certify</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {/* Manual Error */}
              {error && (
                <div className="bg-red-100 text-red-600 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Auth Context Error */}
              {authError && (
                <div className="bg-red-100 text-red-600 text-sm p-3 rounded-md">
                  {authError}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-4">

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>

            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6 text-center text-xs space-y-1">
            <p className="font-semibold">Demo Credentials</p>
            <p>Admin: admin@cert.com / admin123</p>
            <p>User: user@cert.com / user123</p>
            <p>Verifier: verifier@cert.com / verifier123</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginPage;
