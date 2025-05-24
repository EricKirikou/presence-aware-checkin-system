
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from './AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Check if user is the specific admin email
  const isSpecialAdmin = user.email === 'info@joseiksolutions.com';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-xl">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.position && (
                <p className="text-sm font-medium text-primary">{user.position}</p>
              )}
            </div>
            <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
              {isSpecialAdmin ? 'Joseik Administrator' : user.role === 'admin' ? 'Administrator' : 'Employee'}
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
              <p className="capitalize">{isSpecialAdmin ? 'Joseik Admin' : user.role}</p>
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
      </CardContent>
    </Card>
  );
};

export default UserProfile;
