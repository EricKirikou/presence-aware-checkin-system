
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

    // In a production environment, this would update the password in the database
    setUser(prev => prev ? { ...prev, isFirstLogin: false } : null);
    setShowPasswordReset(false);
    toast({
      title: "Password created",
      description: "Your new password has been set successfully",
    });
  };

  // In a production environment, this would connect to a secure backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Admin authentication - add support for info@joseiksolutions.com
        if ((email === 'admin@checkinpro.com' && password === 'Admin@123456') || 
            (email === 'info@joseiksolutions.com' && password === 'Joseik@123456')) {
          const adminUser: User = {
            id: 'admin-1',
            name: email === 'info@joseiksolutions.com' ? 'Joseik Admin' : 'Administrator',
            email: email,
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: 'admin',
            position: 'System Administrator',
            isFirstLogin: false,
          };
          setUser(adminUser);
          toast({
            title: "Login successful",
            description: `Welcome back, ${adminUser.name}!`,
          });
          return true;
        }
        
        // Regular user authentication
        if (email && password) {
          let userName = email.split('@')[0];
          // Make the first letter uppercase and the rest lowercase
          userName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
          
          const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: userName,
            email: email,
            profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
            role: 'employee',
            isFirstLogin: false,
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

  // In a production environment, this would connect to a secure backend
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      if (email && password && name) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create user account
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          email: email,
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
          role: 'employee',
          isFirstLogin: false,
        };
        
        setUser(newUser);
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
