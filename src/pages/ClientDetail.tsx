import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Building2 } from 'lucide-react';
import DiamondTable from '@/components/diamonds/DiamondTable';
import { format } from 'date-fns';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, diamonds } = useData();
  
  const client = clients.find(c => c.id === id);
  const clientDiamonds = diamonds.filter(d => d.clientId === id);
  
  if (!client) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
        </Button>
        <div className="mt-8 text-center">Client not found</div>
      </div>
    );
  }

  const totalValue = clientDiamonds.reduce((sum, d) => sum + d.totalValue, 0);
  const totalDiamonds = clientDiamonds.reduce((sum, d) => sum + d.numberOfDiamonds, 0);
  const totalWeight = clientDiamonds.reduce((sum, d) => sum + d.weightInKarats, 0);

  return (
    <div className="p-4">
      <Button variant="outline" onClick={() => navigate('/clients')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
      </Button>

      <div className="mt-6 grid gap-6">
        {/* Client Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{client.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{client.company}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{client.contactPerson}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rates and Statistics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">4P Plus Rate</p>
                  <p className="text-2xl font-bold">₹{client.rates.fourPPlus.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">per karat</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">4P Minus Rate</p>
                  <p className="text-2xl font-bold">₹{client.rates.fourPMinus.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">per piece</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Business Value</p>
                  <p className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Diamonds</p>
                    <p className="text-xl font-bold">{totalDiamonds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Weight</p>
                    <p className="text-xl font-bold">{totalWeight.toFixed(2)} karats</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client's Diamonds */}
        <Card>
          <CardHeader>
            <CardTitle>Diamond Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <DiamondTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetail;