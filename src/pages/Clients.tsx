
import React, { useState } from 'react';
import ClientForm from '@/components/clients/ClientForm';
import ClientsTable from '@/components/clients/ClientsTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const Clients = () => {
  const [activeTab, setActiveTab] = useState<string>('list');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-diamond-900">Client Management</h1>
        <p className="text-muted-foreground">Manage your clients and their rates</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list" className="flex gap-2">
              <Users className="h-4 w-4" />
              Client List
            </TabsTrigger>
            <TabsTrigger value="new" className="flex gap-2">
              <PlusCircle className="h-4 w-4" />
              New Client
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden md:flex">
            {activeTab === 'list' ? (
              <Button onClick={() => setActiveTab('new')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            ) : null}
          </div>
        </div>
        
        <TabsContent value="list" className="space-y-4">
          <ClientsTable />
        </TabsContent>
        
        <TabsContent value="new">
          <ClientForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clients;
