
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  role: 'employee' | 'admin';
  position?: string;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.isFirstLogin) {
      setShowPasswordReset(true);
    }
  }, [user]);

  const handlePasswordReset = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would update the password in the database
    setUser(prev => prev ? { ...prev, isFirstLogin: false } : null);
    setShowPasswordReset(false);
    toast({
      title: "Password created",
      description: "Your new password has been set successfully",
    });
  };

  // Simulate login - in a real app, this would connect to a backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login logic
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Admin specific login
        if (email === 'info@joseiksolutions.com' && password === 'Joseik@123456') {
          const adminUser: User = {
            id: 'admin-1',
            name: 'Admin',
            email: email,
            profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            role: 'admin',
            position: 'Administrator',
            isFirstLogin: false,
          };
          setUser(adminUser);
          toast({
            title: "Admin Login successful",
            description: `Welcome back, Administrator!`,
          });
          return true;
        }
        
        // Regular user login
        if (email && password) {
          const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email: email,
            profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
            role: 'employee',
            isFirstLogin: password === 'password123', // Consider first login if using default password
          };
          
          setUser(mockUser);
          toast({
            title: "Login successful",
            description: `Welcome back, ${mockUser.name}!`,
          });
          return true;
        }
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

  // Simulate signup - in a real app, this would connect to a backend
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Mock signup logic
      if (email && password && name) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data for new signup
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          email: email,
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
          role: 'employee',
          isFirstLogin: true, // Always true for new signups
        };
        
        setUser(mockUser);
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup, updateProfile }}>
      {children}
      
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Password</DialogTitle>
            <DialogDescription>
              Since this is your first login, please create a new password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="new-password">New Password</label>
              <Input
                id="new-password"
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-password">Confirm Password</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordReset}>Create Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
