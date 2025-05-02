
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  role: 'employee' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Simulate login - in a real app, this would connect to a backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login logic
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data
        const mockUser: User = {
          id: '1',
          name: email.split('@')[0],
          email: email,
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
          role: email.includes('admin') ? 'admin' : 'employee',
        };
        
        setUser(mockUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${mockUser.name}!`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
