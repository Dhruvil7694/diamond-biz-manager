import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Save } from 'lucide-react';

// Define the interface for notifications
interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  marketUpdates: boolean;
  securityAlerts: boolean;
  weeklyReports: boolean;
  priceAlerts: boolean;
  newInventory: boolean;
}

const NotificationSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize with default values
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    marketUpdates: true,
    securityAlerts: true,
    weeklyReports: true,
    priceAlerts: false,
    newInventory: true,
  });

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      try {
        setNotifications(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse saved notification preferences', error);
      }
    }
  }, []);
  
  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setNotifications(prev => {
      const updatedPreferences = { ...prev, [key]: !prev[key] };
      return updatedPreferences;
    });
  };
  
  const savePreferences = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage for persistence
      localStorage.setItem('notificationPreferences', JSON.stringify(notifications));
      
      // Simulate API call to save to server
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to Save",
        description: "There was a problem saving your notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetToDefaults = () => {
    const defaultSettings: NotificationPreferences = {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      marketUpdates: true,
      securityAlerts: true,
      weeklyReports: true,
      priceAlerts: false,
      newInventory: true,
    };
    
    setNotifications(defaultSettings);
    
    toast({
      title: "Reset to Defaults",
      description: "Notification settings have been reset to default values.",
      variant: "default",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications about diamond inventory, sales, and system updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Methods</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="emailAlerts" className="flex-1">Email Alerts</Label>
              </div>
              <Switch 
                id="emailAlerts" 
                checked={notifications.emailAlerts}
                onCheckedChange={() => handleNotificationChange('emailAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="pushNotifications" className="flex-1">Push Notifications</Label>
              </div>
              <Switch 
                id="pushNotifications" 
                checked={notifications.pushNotifications}
                onCheckedChange={() => handleNotificationChange('pushNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="smsAlerts" className="flex-1">SMS Alerts</Label>
              </div>
              <Switch 
                id="smsAlerts" 
                checked={notifications.smsAlerts}
                onCheckedChange={() => handleNotificationChange('smsAlerts')}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="marketUpdates" className="flex-1">Market Updates</Label>
              <Switch 
                id="marketUpdates" 
                checked={notifications.marketUpdates}
                onCheckedChange={() => handleNotificationChange('marketUpdates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="securityAlerts" className="flex-1">Security Alerts</Label>
              <Switch 
                id="securityAlerts" 
                checked={notifications.securityAlerts}
                onCheckedChange={() => handleNotificationChange('securityAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReports" className="flex-1">Weekly Reports</Label>
              <Switch 
                id="weeklyReports" 
                checked={notifications.weeklyReports}
                onCheckedChange={() => handleNotificationChange('weeklyReports')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="priceAlerts" className="flex-1">Price Alert Notifications</Label>
              <Switch 
                id="priceAlerts" 
                checked={notifications.priceAlerts}
                onCheckedChange={() => handleNotificationChange('priceAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="newInventory" className="flex-1">New Inventory Alerts</Label>
              <Switch 
                id="newInventory" 
                checked={notifications.newInventory}
                onCheckedChange={() => handleNotificationChange('newInventory')}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          disabled={isLoading}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={savePreferences}
          disabled={isLoading}
        >
          {isLoading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;