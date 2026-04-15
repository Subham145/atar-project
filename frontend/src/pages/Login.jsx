import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { authAPI } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Will use updated login fn

  /**
   * @param {import('react').ChangeEvent<HTMLInputElement>} e
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  /**
   * @param {import('react').ChangeEvent<HTMLInputElement>} e
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      await login(data); // Sets auth state
      navigate('/InsuranceConverter');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="space-y-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-4xl text-center font-bold">🔐 Welcome Back</CardTitle>
          <CardDescription className="text-center text-blue-100 text-lg">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 animate-shake">
              <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                '🔐 Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm mb-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign Up
              </Link>
            </p>
            <hr className="my-4" />
            <p className="text-xs text-slate-500">
              Demo: admin@test.com / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

