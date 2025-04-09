
import React, { useState } from 'react';
import { useData, Diamond, Client } from '@/contexts/DataContext';
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
import { format } from 'date-fns';
import { Filter, MoreHorizontal, Search } from 'lucide-react';

const DiamondTable = () => {
  const { diamonds, clients } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Diamond | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'entryDate',
    direction: 'desc',
  });

  // Client lookup function
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Filter and sort diamonds
  const filteredDiamonds = diamonds.filter(diamond => {
    const searchLower = searchQuery.toLowerCase();
    const clientName = getClientName(diamond.clientId).toLowerCase();
    
    return (
      diamond.kapanId.toLowerCase().includes(searchLower) ||
      clientName.includes(searchLower) ||
      diamond.category.toLowerCase().includes(searchLower)
    );
  });
  
  // Apply sorting
  const sortedDiamonds = [...filteredDiamonds].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Request sort
  const requestSort = (key: keyof Diamond) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <h2 className="text-lg font-semibold">Diamond Inventory</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by kapan or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => requestSort('entryDate')}>
                Date {sortConfig.key === 'entryDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort('numberOfDiamonds')}>
                Count {sortConfig.key === 'numberOfDiamonds' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort('weightInKarats')}>
                Weight {sortConfig.key === 'weightInKarats' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort('totalValue')}>
                Value {sortConfig.key === 'totalValue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Kapan ID</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Weight (K)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDiamonds.length > 0 ? (
              sortedDiamonds.map((diamond) => (
                <TableRow key={diamond.id}>
                  <TableCell>
                    {format(new Date(diamond.entryDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{getClientName(diamond.clientId)}</TableCell>
                  <TableCell>{diamond.kapanId}</TableCell>
                  <TableCell className="text-right">{diamond.numberOfDiamonds}</TableCell>
                  <TableCell className="text-right">{diamond.weightInKarats.toFixed(2)}</TableCell>
                  <TableCell>{diamond.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${diamond.totalValue.toLocaleString()}
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
                        <DropdownMenuItem>Edit entry</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {searchQuery ? "No diamonds match your search" : "No diamonds added yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DiamondTable;
