
import React, { useState } from 'react';
import DiamondEntryForm from '@/components/diamonds/DiamondEntryForm';
import DiamondTable from '@/components/diamonds/DiamondTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListFilter } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const Diamonds = () => {
  const [activeTab, setActiveTab] = useState<string>('inventory');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-diamond-900">Diamond Management</h1>
        <p className="text-muted-foreground">Manage your diamond inventory</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="inventory" className="flex gap-2">
              <ListFilter className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="new" className="flex gap-2">
              <PlusCircle className="h-4 w-4" />
              New Entry
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden md:flex">
            {activeTab === 'inventory' ? (
              <Button onClick={() => setActiveTab('new')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Diamond Entry
              </Button>
            ) : null}
          </div>
        </div>
        
        <TabsContent value="inventory" className="space-y-4">
          <DiamondTable />
        </TabsContent>
        
        <TabsContent value="new">
          <DiamondEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Diamonds;
