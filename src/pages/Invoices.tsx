
import React from 'react';
import { useData } from '@/contexts/DataContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, FilePlus } from 'lucide-react';
import { format } from 'date-fns';

const Invoices = () => {
  // This is a placeholder page for invoices
  // In a real application, this would connect to a proper invoicing system
  const { diamonds, clients } = useData();
  
  // Generate mock invoices from the diamond data for demonstration
  const generateMockInvoices = () => {
    // Group diamonds by client and date (first 10 characters of ISO string is YYYY-MM-DD)
    const groupedEntries: Record<string, any[]> = {};
    
    diamonds.forEach(diamond => {
      const date = diamond.entryDate.substring(0, 10);
      const key = `${diamond.clientId}-${date}`;
      
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      
      groupedEntries[key].push(diamond);
    });
    
    // Convert grouped entries to invoices
    return Object.entries(groupedEntries).map(([key, entries], index) => {
      const [clientId, dateStr] = key.split('-');
      const client = clients.find(c => c.id === clientId);
      const date = new Date(dateStr);
      
      const totalValue = entries.reduce((sum, entry) => sum + entry.totalValue, 0);
      
      // Generate invoice number (this would come from a proper invoice system)
      const invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${index + 1}`;
      
      return {
        id: index + 1,
        invoiceNumber,
        date: dateStr,
        dueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // Due in 30 days
        clientId,
        clientName: client?.name || 'Unknown Client',
        amount: totalValue,
        status: Math.random() > 0.7 ? 'pending' : 'paid', // Random status for demo
        entries,
      };
    });
  };
  
  const mockInvoices = generateMockInvoices();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-diamond-900">Invoices</h1>
        <p className="text-muted-foreground">Manage your client billing and invoices</p>
      </div>
      
      <div className="flex justify-between flex-wrap gap-2 mb-6">
        <div className="flex items-center space-x-2">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Invoice List
          </CardTitle>
          <CardDescription>
            Manage and track all your client invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{format(new Date(invoice.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">
                      ${invoice.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.status === 'paid' ? 'default' : 'outline'}
                        className={
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800'
                        }
                      >
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mockInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
