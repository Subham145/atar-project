import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, User } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              My Profile
            </CardTitle>
            <CardDescription className="text-blue-100">
              View and manage your account information
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Account Details</h3>
              
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="text-lg font-medium text-slate-900">{user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <User className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Account Type</p>
                      <p className="text-lg font-medium text-slate-900 capitalize">
                        {user?.role || 'user'}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="text-lg font-medium text-slate-900">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Account Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Member Since</p>
                  <p className="text-lg font-semibold text-blue-900">Now</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <p className="text-sm text-indigo-600 font-medium">Access Level</p>
                  <p className="text-lg font-semibold text-indigo-900">Full</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
