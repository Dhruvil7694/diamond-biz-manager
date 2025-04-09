
import React, { useState } from 'react';
import { useData, Client } from '@/contexts/DataContext';
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
import { MoreHorizontal, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ClientsTable = () => {
  const { clients, diamonds } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter clients
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower) ||
      client.contactPerson.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });
  
  // Calculate business volume
  const getClientBusinessVolume = (clientId: string): number => {
    return diamonds
      .filter(d => d.clientId === clientId)
      .reduce((total, diamond) => total + diamond.totalValue, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <h2 className="text-lg font-semibold">Client List</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="text-right">Business Volume</TableHead>
              <TableHead className="w-[80px]">Rates</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const businessVolume = getClientBusinessVolume(client.id);
                
                return (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      <div>
                        <div>{client.contactPerson}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${businessVolume.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="justify-between">
                          <span className="font-normal mr-1">4P+:</span>
                          <span>${client.rates.fourPPlus}</span>
                        </Badge>
                        <Badge variant="outline" className="justify-between">
                          <span className="font-normal mr-1">4P-:</span>
                          <span>${client.rates.fourPMinus}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit client</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery ? "No clients match your search" : "No clients added yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientsTable;
