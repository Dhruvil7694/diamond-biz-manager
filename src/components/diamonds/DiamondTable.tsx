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
import EditDiamondDialog from './EditDiamondDialog';

interface DiamondTableProps {
  filterClientId?: string;
  hideClientColumn?: boolean;
}

const DiamondTable = ({ filterClientId, hideClientColumn = false }: DiamondTableProps) => {
  const { diamonds, clients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiamond, setSelectedDiamond] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  // Filter diamonds based on search term and clientId
  const filteredDiamonds = diamonds.filter(diamond => {
    const client = clients.find(c => c.id === diamond.clientId);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      client?.name.toLowerCase().includes(searchLower) ||
      diamond.category.toLowerCase().includes(searchLower);
    
    if (filterClientId) {
      return diamond.clientId === filterClientId && matchesSearch;
    }
    return matchesSearch;
  });

  const handleEdit = (diamondId: string) => {
    setSelectedDiamond(diamondId);
    setShowEditDialog(true);
  };

  const handleAdd = () => {
    setSelectedDiamond(null);
    setShowEditDialog(true);
  };

  return (
    <div>
      <div className="flex items-center relative mb-4">
        <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
        <Input
          placeholder="Search diamonds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 max-w-xs"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {!hideClientColumn && <TableHead>Client</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Number</TableHead>
              <TableHead className="text-right">Weight (Karats)</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiamonds.map((diamond) => {
              const client = clients.find(c => c.id === diamond.clientId);
              
              return (
                <TableRow key={diamond.id}>
                  {!hideClientColumn && (
                    <TableCell className="font-medium">{client?.name || 'Unknown'}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant={diamond.category === '4P Plus' ? 'default' : 'outline'}>
                      {diamond.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{diamond.numberOfDiamonds}</TableCell>
                  <TableCell className="text-right">{diamond.weightInKarats.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{diamond.totalValue.toLocaleString('en-IN')}
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
                        <DropdownMenuItem onClick={() => navigate(`/diamonds/${diamond.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(diamond.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Diamond
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDiamonds.length === 0 && (
              <TableRow>
                <TableCell colSpan={hideClientColumn ? 5 : 6} className="h-24 text-center">
                  No diamonds found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditDiamondDialog
        diamond={selectedDiamond ? diamonds.find(d => d.id === selectedDiamond) : undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </div>
  );
};

export default DiamondTable;
