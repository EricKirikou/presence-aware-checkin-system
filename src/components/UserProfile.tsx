import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { updateUserPassword } from '@/lib/api';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const isSpecialAdmin = user.email === 'info@joseiksolutions.com';

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserPassword(
        user.isFirstLogin ? { newPassword } : { currentPassword, newPassword }
      );

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed.",
      });

      setNewPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profileImage || ''} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-xl">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.position && (
                <p className="text-sm font-medium text-primary">{user.position}</p>
              )}
            </div>
            <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
              {isSpecialAdmin ? 'Joseik Administrator' :
                user.role === 'admin' ? 'Administrator' : 'Employee'}
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Account Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="text-sm">
              <p className="text-muted-foreground">ID</p>
              <p>{user.id}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Role</p>
              <p className="capitalize">
                {isSpecialAdmin ? 'Joseik Admin' : user.role}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Username</p>
              <p>{user.email.split('@')[0]}</p>
            </div>
            {user.position && (
              <div className="text-sm">
                <p className="text-muted-foreground">Position</p>
                <p>{user.position}</p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Security</h4>
          <div className="grid gap-2">
            {!user.isFirstLogin && (
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            )}
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              onClick={handlePasswordUpdate}
              disabled={isUpdating || !newPassword || (!user.isFirstLogin && !currentPassword)}
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
