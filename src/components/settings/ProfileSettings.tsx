import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Save, User, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: (user as any)?.name || 'Hiren Patel',
    email: (user as any)?.email || 'hiren.patel@example.com',
    phone: (user as any)?.phone || '+1 123-456-7890',
    position: (user as any)?.position || 'Diamond Merchant',
    company: (user as any)?.company || 'Diamond Business Management Systems',
    avatar: (user as any)?.avatar || '',
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile(prev => ({
            ...prev,
            avatar: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const saveProfile = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, you would upload the avatar file to a server
      // and update the profile with the returned URL
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile in auth context
      if (typeof updateProfile === 'function') {
        await updateProfile({
          ...profile,
          // In a real implementation, this would be the URL returned from the server
          avatar: profile.avatar
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetProfile = () => {
    setProfile({
      name: (user as any)?.name || 'Hiren Patel',
      email: (user as any)?.email || 'hiren.patel@example.com',
      phone: (user as any)?.phone || '+1 123-456-7890',
      position: (user as any)?.position || 'Diamond Merchant',
      company: (user as any)?.company || 'Diamond Business Management Systems',
      avatar: (user as any)?.avatar || '',
    });
    setAvatarFile(null);
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    return profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="grid md:grid-cols-7 gap-6">
      <div className="md:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profile.email} 
                  onChange={handleProfileChange} 
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  name="position" 
                  value={profile.position} 
                  onChange={handleProfileChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                name="company" 
                value={profile.company} 
                onChange={handleProfileChange} 
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button 
              variant="outline" 
              onClick={resetProfile} 
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button 
              onClick={saveProfile} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Avatar</CardTitle>
            <CardDescription>Upload a profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar 
              className="h-24 w-24 cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={handleAvatarClick}
            >
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} />
              ) : null}
              <AvatarFallback className="text-xl bg-diamond-100 text-diamond-800">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAvatarClick}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {avatarFile ? 'Change Image' : 'Upload Image'}
            </Button>
            
            {avatarFile && (
              <p className="text-xs text-muted-foreground text-center">
                {avatarFile.name}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full justify-start text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;