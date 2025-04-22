import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Server, Database, Activity } from 'lucide-react';
import SupabaseStorageManager from './SupabaseStorageManage';
import { useAuth } from '@/contexts/AuthContext';

const SystemStatusPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access system status
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>
      
      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="storage">
            <HardDrive className="h-4 w-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="server">
            <Server className="h-4 w-4 mr-2" />
            Server
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="storage" className="mt-6">
          <SupabaseStorageManager />
        </TabsContent>
        
        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>
                Monitor your Supabase database metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Database monitoring coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="server" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Server Status
              </CardTitle>
              <CardDescription>
                View server performance and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Server monitoring coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemStatusPage;