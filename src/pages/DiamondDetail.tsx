import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Diamond, Calendar, User, Scale, Tag, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const DiamondDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { diamonds, clients } = useData();
  
  const diamond = diamonds.find(d => d.id === id);
  const client = diamond ? clients.find(c => c.id === diamond.clientId) : null;
  
  if (!diamond) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => navigate('/diamonds')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Diamonds
        </Button>
        <div className="mt-8 text-center">Diamond not found</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Button variant="outline" onClick={() => navigate('/diamonds')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Diamonds
      </Button>

      <div className="mt-6 grid gap-6">
        {/* Diamond Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Diamond Details</CardTitle>
              <Badge variant={diamond.category === '4P Plus' ? 'default' : 'outline'}>
                {diamond.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Diamonds</p>
                    <p className="font-medium">{diamond.numberOfDiamonds}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weight in Karats</p>
                    <p className="font-medium">{diamond.weightInKarats.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-medium">₹{diamond.totalValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Entry Date</p>
                    <p className="font-medium">{format(new Date(diamond.entryDate), 'PPP')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{client?.name || 'Unknown Client'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rate Applied</p>
                    <p className="font-medium">
                      ₹{(diamond.category === '4P Plus' ? 
                        client?.rates.fourPPlus : 
                        client?.rates.fourPMinus || 0).toLocaleString('en-IN')}
                      {diamond.category === '4P Plus' ? ' per karat' : ' per piece'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Value Analysis */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Per Unit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Value per Diamond</p>
                  <p className="text-2xl font-bold">
                    ₹{(diamond.totalValue / diamond.numberOfDiamonds).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value per Karat</p>
                  <p className="text-2xl font-bold">
                    ₹{(diamond.totalValue / diamond.weightInKarats).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Weight per Diamond</p>
                  <p className="text-2xl font-bold">
                    {(diamond.weightInKarats / diamond.numberOfDiamonds).toFixed(3)} karats
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category Distribution</p>
                  <Badge variant={diamond.category === '4P Plus' ? 'default' : 'outline'} className="mt-1">
                    100% {diamond.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiamondDetail;
