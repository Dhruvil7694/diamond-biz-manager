import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Search, Edit, Eye, Plus } from 'lucide-react';
import EditClientDialog from './EditClientDialog';

const ClientsTable = () => {
  const { clients, diamonds } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (clientId: string) => {
    setSelectedClient(clientId);
    setShowEditDialog(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setShowEditDialog(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 max-w-xs"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Business Volume</TableHead>
              <TableHead>Rates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const businessVolume = diamonds
                .filter(d => d.clientId === client.id)
                .reduce((sum, d) => sum + d.totalValue, 0);
                
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{businessVolume.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <Badge variant="outline" className="justify-between">
                        <span className="font-normal mr-1">4P+:</span>
                        <span>₹{client.rates.fourPPlus}</span>
                      </Badge>
                      <Badge variant="outline" className="justify-between">
                        <span className="font-normal mr-1">4P-:</span>
                        <span>₹{client.rates.fourPMinus}</span>
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditClientDialog
        client={selectedClient ? clients.find(c => c.id === selectedClient) : undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </div>
  );
};

export default ClientsTable;