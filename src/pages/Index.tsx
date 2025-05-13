
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import LandingPage from '../components/LandingPage';
import PermissionRequest from '../components/PermissionRequest';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  // Check if this is the first visit using localStorage
  useEffect(() => {
    const hasRequestedPermissions = localStorage.getItem('permissions_requested');
    if (!hasRequestedPermissions && isAuthenticated) {
      setShowPermissionDialog(true);
    }
  }, [isAuthenticated]);

  const handlePermissionsGranted = () => {
    // Mark permissions as requested in localStorage
    localStorage.setItem('permissions_requested', 'true');
  };

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <Dashboard />
      </main>
      
      <PermissionRequest
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onPermissionsGranted={handlePermissionsGranted}
      />
    </div>
  );
};

export default Index;
