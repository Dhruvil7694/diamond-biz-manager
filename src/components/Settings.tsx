import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './settings/ProfileSettings';
import NotificationSettings from './settings/NotificationSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import SecuritySettings from './settings/SecuritySettings';
import DataSettings from './settings/DataSettings';

const Settings = () => {
  // Track active tab for any potential side effects
  const [activeTab, setActiveTab] = useState('profile');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update the URL to reflect the current tab
    // This enables direct linking to specific tabs and browser history navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url);
  };

  // On first load, check URL for tab parameter
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    if (tabParam && ['profile', 'notifications', 'appearance', 'security', 'data'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        
        {/* Data Tab */}
        <TabsContent value="data">
          <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;