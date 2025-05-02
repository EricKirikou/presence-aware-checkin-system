
import React from 'react';
import { useAuth } from '../components/AuthContext';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-6 text-3xl font-extrabold">CheckInPro</h1>
              <p className="mt-2 text-gray-600">
                A modern attendance system with biometric verification and location tracking
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full"
              >
                Sign In
              </Button>
              <p className="text-sm text-gray-500">
                Secure attendance tracking for organizations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
