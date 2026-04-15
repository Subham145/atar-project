import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileUp, FileText, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Layout({ children, currentPageName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Upload Policies', href: createPageUrl('InsuranceConverter'), icon: FileUp },
    { name: 'Upload History', href: createPageUrl('PolicyList'), icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-700">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">InsuranceHub</h1>
              <p className="text-xs text-blue-200">Policy Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPageName === item.name.replace(' ', '');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile and Logout Section */}
          <div className="px-4 py-6 border-t border-blue-700 space-y-2">
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPageName === 'profile'
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">My Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-600 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
