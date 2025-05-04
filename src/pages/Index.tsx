
import React from 'react';
import { useAuth } from '../components/AuthContext';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import LandingPage from '../components/LandingPage';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
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
