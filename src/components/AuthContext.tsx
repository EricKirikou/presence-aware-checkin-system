
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserByEmail, saveUser } from '@/services/supabase';

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

  const handlePasswordReset = async () => {
    if (!user) return;
    
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

    try {
      // Update the user's password and isFirstLogin flag
      const updatedUser = {
        ...user,
        password: newPassword,
        isFirstLogin: false
      };
      
      await saveUser(updatedUser);
      setUser(updatedUser);
      setShowPasswordReset(false);
      
      toast({
        title: "Password created",
        description: "Your new password has been set successfully",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password update failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) return false;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to get the user from the database
      const dbUser = await getUserByEmail(email);
      
      if (dbUser && dbUser.password === password) {
        // User found and password matches
        const authenticatedUser: User = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          profileImage: dbUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: dbUser.role,
          position: dbUser.position,
          isFirstLogin: dbUser.isFirstLogin,
        };
        
        setUser(authenticatedUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${authenticatedUser.name}!`,
        });
        return true;
      } else if (
        // Fallback for demo admin accounts if not in DB
        (email === 'admin@checkinpro.com' && password === 'Admin@123456') || 
        (email === 'info@joseiksolutions.com' && password === 'Joseik@123456')
      ) {
        const isJoseik = email === 'info@joseiksolutions.com';
        const adminUser: User = {
          id: isJoseik ? 'admin-2' : 'admin-1',
          name: isJoseik ? 'Joseik Admin' : 'Administrator',
          email: email,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: 'admin',
          position: 'System Administrator',
          isFirstLogin: false,
        };
        
        // Save the admin user to database for future logins
        await saveUser({
          ...adminUser,
          password
        });
        
        setUser(adminUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${adminUser.name}!`,
        });
        return true;
      } else if (!dbUser && email && password) {
        // For demo purposes - create a new regular user account
        let userName = email.split('@')[0];
        // Make the first letter uppercase and the rest lowercase
        userName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
        
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: userName,
          email: email,
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
          role: 'employee',
          isFirstLogin: false,
          password
        };
        
        // Save the new user to the database
        await saveUser(newUser);
        
        const mockUser: User = {
          ...newUser,
          role: 'employee' as 'employee'
        };
        
        setUser(mockUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${mockUser.name}!`,
        });
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
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

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      if (!email || !password || !name) return false;
      
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        toast({
          title: "Signup failed",
          description: "User with this email already exists",
          variant: "destructive",
        });
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
        role: 'employee',
        isFirstLogin: false,
        password
      };
      
      // Save to database
      await saveUser(newUser);
      
      // Set in state
      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        profileImage: newUser.profileImage,
        role: 'employee',
        isFirstLogin: false
      });
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      return true;
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

  const updateProfile = async (updatedUser: User) => {
    try {
      // Save to database
      await saveUser({
        ...updatedUser,
        // We need to include password when saving to database
        password: (user as any)?.password || 'default-password'
      });
      
      // Update local state
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
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
