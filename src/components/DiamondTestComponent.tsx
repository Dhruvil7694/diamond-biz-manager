import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const DiamondTestComponent = () => {
  const { diamonds, clients, invoices } = useData();
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [directDiamonds, setDirectDiamonds] = useState([]);
  const [error, setError] = useState(null);

  // Test function to fetch invoice items directly
  const fetchInvoiceItemsDirectly = async (invoiceId) => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
      
      if (itemsError) throw itemsError;
      setInvoiceItems(items || []);
      
      if (items?.length) {
        // 2. Get diamond IDs from items
        const diamondIds = items.map(item => item.diamond_id);
        
        // 3. Fetch those diamonds directly
        const { data: diamondsData, error: diamondsError } = await supabase
          .from('diamonds')
          .select('*')
          .in('id', diamondIds);
        
        if (diamondsError) throw diamondsError;
        setDirectDiamonds(diamondsData || []);
      } else {
        setDirectDiamonds([]);
      }
    } catch (err) {
      console.error('Error in test component:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for all invoices to compare
  const runFullDiagnostic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("== DIAGNOSTIC REPORT ==");
      console.log(`Found ${diamonds.length} diamonds in DataContext`);
      console.log(`Found ${invoices.length} invoices in DataContext`);
      
      // Check a few sample diamonds
      if (diamonds.length > 0) {
        console.log("Sample diamond from context:", diamonds[0]);
      }
      
      // Run diagnostic on all invoices
      for (const invoice of invoices) {
        console.log(`\nChecking invoice ${invoice.invoiceNumber} (${invoice.id}):`);
        console.log("Diamond IDs in context:", invoice.diamonds || []);
        
        // Check invoice_items directly
        const { data: items } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoice.id);
        
        console.log(`Found ${items?.length || 0} invoice_items in database`);
        if (items?.length) {
          console.log("Sample invoice item:", items[0]);
          
          // Check if diamonds exist for these IDs
          const diamondIds = items.map(item => item.diamond_id);
          const foundDiamonds = diamonds.filter(d => diamondIds.includes(d.id));
          console.log(`Found ${foundDiamonds.length}/${diamondIds.length} matching diamonds in context`);
          
          // Check if the database has these diamonds
          const { data: dbDiamonds } = await supabase
            .from('diamonds')
            .select('*')
            .in('id', diamondIds);
          
          console.log(`Found ${dbDiamonds?.length || 0}/${diamondIds.length} matching diamonds in database`);
        }
      }
      
      console.log("\n== END DIAGNOSTIC ==");
    } catch (err) {
      console.error('Error running diagnostics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diamond Data Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Data Summary</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Diamonds in context: {diamonds.length}</li>
                <li>Clients in context: {clients.length}</li>
                <li>Invoices in context: {invoices.length}</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={runFullDiagnostic} 
                disabled={loading}
                variant="outline"
              >
                Run Full Diagnostic
              </Button>
              <div className="text-sm text-muted-foreground">
                Check console for detailed results
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Test Specific Invoice</h3>
              <div className="flex space-x-2 mb-4">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                >
                  <option value="">Select an invoice</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {new Date(invoice.issueDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={() => fetchInvoiceItemsDirectly(selectedInvoiceId)} 
                  disabled={!selectedInvoiceId || loading}
                >
                  Test
                </Button>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded mb-4">
                  Error: {error}
                </div>
              )}
              
              <div className="flex flex-col space-y-4">
                <div>
                  <h4 className="font-medium">Invoice Items (from database):</h4>
                  {invoiceItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mt-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoiceItems.map(item => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{item.id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{item.diamond_id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">₹{item.price || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No invoice items found</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">Diamonds (directly from database):</h4>
                  {directDiamonds.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mt-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapan ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {directDiamonds.map(diamond => (
                            <tr key={diamond.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{diamond.id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{diamond.kapan_id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{diamond.category}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{diamond.number_of_diamonds}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{diamond.weight_in_karats}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">₹{diamond.total_value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No diamonds found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiamondTestComponent;