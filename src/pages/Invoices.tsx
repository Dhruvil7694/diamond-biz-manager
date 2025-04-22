import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useViewport } from '@/contexts/ViewportContext';
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
import { FileText, Search, FilePlus, CheckCircle2, Clock, AlertCircle, Eye, Trash2, Download, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import InvoiceTemplate from '../components/InvoiceTemplate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PaymentMethodDialog, { PAYMENT_METHODS } from '../components/PaymentMethodDialog';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const { isMobile, isTablet } = useViewport();
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [invoiceToUpdate, setInvoiceToUpdate] = useState<any>(null);
  
  // Get database data from context
  const { invoices, updateInvoice, deleteInvoice, clients, diamonds, getCompleteInvoice } = useData();
  
  

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === invoice.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle payment status change
  const handlePaymentStatusChange = async (invoice: any, newStatus: string, paymentMethod?: string) => {
    try {
      // If we're marking as paid and no payment method provided, open the dialog
      if (newStatus === 'paid' && !paymentMethod) {
        setInvoiceToUpdate(invoice);
        setIsPaymentMethodDialogOpen(true);
        return;
      }
      
      // Update the invoice with the new status and payment method if applicable
      await updateInvoice({
        ...invoice,
        status: newStatus,
        paymentDate: newStatus === 'paid' ? new Date().toISOString() : null,
        paymentMethod: newStatus === 'paid' ? paymentMethod : null
      });
      
      toast(`Invoice ${invoice.invoiceNumber} has been marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast(`Failed to update payment status: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePaymentMethodConfirm = (method: string) => {
    if (invoiceToUpdate) {
      handlePaymentStatusChange(invoiceToUpdate, 'paid', method);
      setInvoiceToUpdate(null);
    }
  };
  
  // Handle delete
  const handleDeleteClick = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    
    try {
      await deleteInvoice(invoiceToDelete.id);
      toast(`Invoice ${invoiceToDelete.invoiceNumber} has been deleted`);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast(`Failed to delete invoice: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const downloadPdf = async (invoice: any) => {
    // Get complete invoice data
    const completeInvoice = await getCompleteInvoice(invoice.id);
    if (!completeInvoice) {
      toast('Failed to get invoice data for PDF generation');
      return;
    }
    
    // Create a new window for the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast('Failed to open print window. Please check your popup blocker settings.');
      return;
    }
    
    // Format currency consistently
    const formatCurrency = (amount: number) => {
      return '₹' + amount.toLocaleString('en-IN');
    };
    
    // Format dates consistently
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr || 'N/A';
      }
    };
    
    // Create diamond entries HTML
    const diamondRows = completeInvoice.diamondDetails.map((diamond: any, index: number) => `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-3 py-2 text-sm text-center">${index + 1}</td>
        <td class="px-3 py-2 text-sm font-medium">${diamond.id}</td>
        <td class="px-3 py-2 text-sm">${diamond.kapanId}</td>
        <td class="px-3 py-2 text-sm">
          <span class="px-2 py-1 rounded-full text-xs font-medium ${
            diamond.category === '4P Plus' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
          }">
            ${diamond.category}
          </span>
        </td>
        <td class="px-3 py-2 text-sm text-right">${diamond.numberOfDiamonds}</td>
        <td class="px-3 py-2 text-sm text-right">${diamond.weightInKarats.toFixed(2)} ct</td>
        <td class="px-3 py-2 text-sm text-right">${formatCurrency(
          diamond.category === '4P Plus'
            ? Math.round(diamond.totalValue / diamond.weightInKarats)
            : Math.round(diamond.totalValue / diamond.numberOfDiamonds)
        )}</td>
        <td class="px-3 py-2 text-sm font-medium text-right">${formatCurrency(diamond.totalValue)}</td>
      </tr>
    `).join('');
    
    // Generate comprehensive HTML with proper styling
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${completeInvoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.5;
              color: #333;
              background-color: white;
              margin: 0;
              padding: 0;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: Arial, sans-serif;
            }
            
            th {
              text-align: left;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 0.75rem;
              font-weight: bold;
            }
            
            td {
              padding: 0.75rem;
              border-top: 1px solid #e5e7eb;
              font-size: 0.875rem;
            }
            
            .bg-indigo-800 {
              background-color: #4338ca !important;
              color: white !important;
            }
            
            .bg-indigo-100 {
              background-color: #e0e7ff !important;
            }
            
            .text-indigo-800 {
              color: #3730a3 !important;
            }
            
            .bg-blue-100 {
              background-color: #dbeafe !important;
            }
            
            .text-blue-800 {
              color: #1e40af !important;
            }
            
            .bg-green-100 {
              background-color: #dcfce7 !important;
            }
            
            .text-green-800 {
              color: #166534 !important;
            }
            
            .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            
            @media print {
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="max-w-4xl mx-auto my-4 bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-indigo-800 text-white p-4">
              <div class="flex justify-between items-center">
                <h1 class="text-xl font-bold">INVOICE</h1>
                <div>
                  <p class="text-sm text-right">Invoice #${completeInvoice.invoiceNumber}</p>
                  <div class="inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    completeInvoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }">
                    <span class="ml-2 font-medium">${completeInvoice.status === 'paid' ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Company and Client Info -->
            <div class="p-4 grid grid-cols-2 gap-4">
              <div>
                <h3 class="font-bold text-gray-700 mb-2">From:</h3>
                <div class="text-sm space-y-1">
                  <p class="font-medium">${completeInvoice.company?.companyName || 'Rashi Diamonds'}</p>
                  <p>${completeInvoice.company?.address || 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat'}</p>
                  ${completeInvoice.company?.phone ? `<p>Phone: ${completeInvoice.company.phone}</p>` : '<p>Phone: 9879225849</p>'}
                  ${completeInvoice.company?.email ? `<p>Email: ${completeInvoice.company.email}</p>` : '<p>Email: hirenpatel29111997@gmail.com</p>'}
                  ${completeInvoice.company?.gstNumber ? `<p>GST: ${completeInvoice.company.gstNumber}</p>` : '<p>GST: 27ABCDE1234F1Z5</p>'}
                </div>
              </div>
              
              <div>
                <h3 class="font-bold text-gray-700 mb-2">To:</h3>
                <div class="text-sm space-y-1">
                  <p class="font-medium">${completeInvoice.client?.name || 'N/A'}</p>
                  <p>${completeInvoice.client?.company || 'N/A'}</p>
                  <p>Contact: ${completeInvoice.client?.contactPerson || 'N/A'}</p>
                  <p>Phone: ${completeInvoice.client?.phone || 'N/A'}</p>
                  <p>Email: ${completeInvoice.client?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <!-- Invoice Details -->
            <div class="px-4 py-2 bg-gray-50 grid grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-500">Issue Date</p>
                <p class="font-medium">${formatDate(completeInvoice.issueDate)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Due Date</p>
                <p class="font-medium">${formatDate(completeInvoice.dueDate)}</p>
              </div>
              ${completeInvoice.status === 'paid' && completeInvoice.paymentDate ? `
                <div>
                  <p class="text-sm text-gray-500">Payment Date</p>
                  <p class="font-medium">${formatDate(completeInvoice.paymentDate)}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Diamond Entries Table -->
            <div class="px-4 py-2">
              <h3 class="font-bold text-gray-700 mb-3">Diamond Details:</h3>
              <div class="border rounded-md overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-indigo-800">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-12">#</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">DIAMOND ID</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">KAPAN ID</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">CATEGORY</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider">COUNT</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider">WEIGHT</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider">RATE</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    ${diamondRows}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Payment Summary -->
            <div class="px-4 py-3 grid grid-cols-2 gap-4">
              <div>
                <div class="mb-3">
                  <h3 class="font-bold text-gray-700 mb-2">Bank Details:</h3>
                  <p class="text-sm">Bank Name: ${completeInvoice.company?.bankName || '12341234123'}</p>
                  <p class="text-sm">Account No: ${completeInvoice.company?.accountNumber || 'Hirenbhai Rameshbhai Patel'}</p>
                  <p class="text-sm">IFSC Code: ${completeInvoice.company?.ifscCode || 'BARB0KIMXXX'}</p>
                  <p class="text-sm">Branch: ${completeInvoice.company?.branch || 'Kim, Surat'}</p>
                </div>
                
                <div>
                  <h3 class="font-bold text-gray-700 mb-2">Payment Terms:</h3>
                  <p class="text-sm text-gray-600">${completeInvoice.client?.paymentTerms || 'Net 30'}</p>
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-end">
                <div class="bg-gray-50 p-3 rounded-md border border-gray-200 w-full max-w-xs">
                  <div class="space-y-1">
                    <div class="flex justify-between py-1 text-sm">
                      <span class="text-gray-600">Total Amount:</span>
                      <span class="font-medium">${formatCurrency(completeInvoice.totalAmount)}</span>
                    </div>
                    <div class="h-px bg-gray-300 my-1"></div>
                    <div class="flex justify-between py-1">
                      <span class="font-bold text-gray-800">Grand Total:</span>
                      <span class="font-bold text-gray-800">${formatCurrency(completeInvoice.totalAmount)}</span>
                    </div>
                  </div>
                  ${completeInvoice.status === 'paid' ? 
                    `<div class="mt-2 text-center py-1 bg-green-100 text-green-800 rounded font-medium text-sm">
                      Payment Received
                    </div>` : ''}
                </div>
                
                <div class="mt-4 text-sm text-gray-500">
                  Thank you for your business!
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="py-3 px-4 bg-indigo-800 text-white text-xs text-center mt-1">
              <p>${completeInvoice.company?.companyName || 'Rashi Diamonds'} • ${completeInvoice.company?.address || 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat'} • ${completeInvoice.company?.email || 'hirenpatel29111997@gmail.com'} • ${completeInvoice.company?.phone || '9879225849'}</p>
            </div>
          </div>
          
          <div class="text-center my-4 no-print">
            <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Print or Save as PDF
            </button>
          </div>
          
          <script>
            window.onload = function() {
              // Wait for all styles to load
              setTimeout(function() {
                try {
                  // Check if the user is on a mobile device
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  
                  if (isMobile) {
                    // For mobile devices, show a message to use the save as PDF option
                    alert('Please use the "Save as PDF" option in your browser\'s print menu');
                  }
                  
                  // Trigger the print dialog
                  window.print();
                } catch (error) {
                  console.error('Error triggering print:', error);
                  alert('There was an error trying to print. Please try using your browser\'s print function.');
                }
              }, 1000);
            };

            // Add event listener for the print button
            document.addEventListener('click', function(event) {
              if (event.target.tagName === 'BUTTON' && event.target.innerText.includes('Print')) {
                event.preventDefault();
                window.print();
              }
            });
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Focus the print window
    printWindow.focus();
    
    toast(`Opening print dialog for Invoice ${completeInvoice.invoiceNumber}`);

    console.log('Complete invoice for PDF:', completeInvoice);
    console.log('Diamond details:', completeInvoice.diamondDetails);
  };
 
  // Helper function to get status details for displaying
  const getStatusDetails = (status: string, dueDate: string, paymentMethod?: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isPastDue = now > due;
    
    if (status === 'paid') {
      const methodLabel = paymentMethod ?
        PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod :
        '';
        
      return {
        label: 'Paid',
        detailedLabel: methodLabel ? `Paid via ${methodLabel}` : 'Paid',
        icon: CheckCircle2,
        variant: 'default' as const,
        classes: 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800',
        paymentMethod: methodLabel
      };
    } else if (isPastDue) {
      return {
        label: 'Past Due',
        detailedLabel: 'Past Due',
        icon: AlertCircle,
        variant: 'destructive' as const,
        classes: 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800'
      };
    } else {
      return {
        label: 'Pending',
        detailedLabel: 'Pending',
        icon: Clock,
        variant: 'secondary' as const,
        classes: 'bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800'
      };
    }
  };

  // Open preview dialog with the selected invoice
  const openPreview = async (invoice: any) => {
    try {
      // Get complete invoice data
      const completeInvoice = await getCompleteInvoice(invoice.id);
      if (!completeInvoice) {
        toast('Failed to get invoice data for preview');
        return;
      }
      
      // Convert to the format expected by InvoiceTemplate
      const previewInvoice = {
        id: completeInvoice.id,
        invoiceNumber: completeInvoice.invoiceNumber,
        date: completeInvoice.issueDate,
        dueDate: completeInvoice.dueDate,
        clientId: completeInvoice.clientId,
        clientName: completeInvoice.client.name,
        clientDetails: {
          name: completeInvoice.client.name,
          company: completeInvoice.client.company,
          contactPerson: completeInvoice.client.contactPerson,
          phone: completeInvoice.client.phone,
          email: completeInvoice.client.email,
          rates: {
            fourPPlus: completeInvoice.client.rates.fourPPlus,
            fourPMinus: completeInvoice.client.rates.fourPMinus
          },
          paymentTerms: completeInvoice.client.paymentTerms
        },
        company: completeInvoice.company,
        amount: completeInvoice.totalAmount,
        status: completeInvoice.status,
        paymentDate: completeInvoice.paymentDate,
        entries: completeInvoice.diamondDetails.map((diamond: any) => ({
          id: diamond.id,
          kapanId: diamond.kapanId || 'N/A',
          weight: diamond.weightInKarats,
          numberOfDiamonds: diamond.numberOfDiamonds,
          category: diamond.category,
          rate: diamond.category === '4P Plus'
            ? Math.round(diamond.totalValue / diamond.weightInKarats)
            : Math.round(diamond.totalValue / diamond.numberOfDiamonds),
          totalValue: diamond.totalValue
        }))
      };
      
      setSelectedInvoice(previewInvoice);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error opening invoice preview:', error);
      toast('Failed to open invoice preview');
    }
  };

  // Render mobile row card for invoice
  const renderMobileInvoiceCard = (invoice: any) => {
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client?.name || 'Unknown Client';
    const statusDetails = getStatusDetails(invoice.status, invoice.dueDate, invoice.paymentMethod);
    const StatusIcon = statusDetails.icon;
  
    return (
      <div key={invoice.id} className="bg-white p-3 rounded-lg border shadow-sm mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-sm">{invoice.invoiceNumber}</h3>
            <p className="text-xs text-gray-500">{clientName}</p>
          </div>
          <Badge
            variant={statusDetails.variant}
            className={`flex items-center gap-1 w-fit text-xs ${statusDetails.classes}`}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{statusDetails.label}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <p className="text-gray-500">Issue Date</p>
            <p>{format(new Date(invoice.issueDate), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-gray-500">Due Date</p>
            <p>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-medium">₹{invoice.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          {invoice.status === 'paid' && invoice.paymentMethod && (
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-medium">
                {PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || invoice.paymentMethod}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPreview(invoice)}
            className="h-8 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handlePaymentStatusChange(invoice, invoice.status === 'paid' ? 'pending' : 'paid')}
                className="text-xs"
              >
                Mark as {invoice.status === 'paid' ? 'Pending' : 'Paid'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/invoices/${invoice.id}`)}
                className="text-xs sm:text-sm"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => downloadPdf(invoice)}
                className="text-xs"
              >
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(invoice)}
                className="text-red-500 focus:text-red-500 focus:bg-red-50 text-xs"
              >
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };
  
  

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-diamond-900">Invoices</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage your client billing and invoices</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <Button 
          onClick={() => navigate('/invoices/new')}
          className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
        >
          <FilePlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          New Invoice
        </Button>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-7 sm:pl-8 h-8 sm:h-10 text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Invoice List
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
          Manage and track all your client invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-0 sm:py-2">
          {/* Mobile View */}
          <div className="md:hidden">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(invoice => renderMobileInvoiceCard(invoice))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm">No invoices found</p>
              </div>
            )}
          </div>
          
          {/* Tablet and Desktop View */}
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] text-xs">Invoice #</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-right text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  const clientName = client?.name || 'Unknown Client';
                  const statusDetails = getStatusDetails(invoice.status, invoice.dueDate);
                  const StatusIcon = statusDetails.icon;
                  
                  return (
                    <TableRow key={invoice.id} className="group text-sm">
                      <TableCell className="font-medium py-2 text-xs sm:text-sm">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="py-2 text-xs sm:text-sm">{clientName}</TableCell>
                      <TableCell className="py-2 text-xs sm:text-sm">{format(new Date(invoice.issueDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="py-2 text-xs sm:text-sm">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-right font-medium py-2 text-xs sm:text-sm">
                        ₹{invoice.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="py-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col">
                                <Badge
                                  variant={statusDetails.variant}
                                  className={`flex items-center gap-1 w-fit ${statusDetails.classes} text-xs`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {statusDetails.label}
                                </Badge>
                                {invoice.status === 'paid' && statusDetails.paymentMethod && (
                                  <span className="text-xs text-gray-500 mt-1 ml-1">
                                    via {statusDetails.paymentMethod}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              {invoice.status === 'paid' ? 
                                `Paid on ${format(new Date(invoice.paymentDate), 'dd MMM yyyy')}${
                                  invoice.paymentMethod ? 
                                  ` via ${PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || invoice.paymentMethod}` : 
                                  ''
                                }` : 
                                `Due on ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openPreview(invoice)}
                                  className="h-7 w-7"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p>Preview Invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {!isTablet && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(invoice)}
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  <p>Delete Invoice</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-7 w-7"
                                    >
                                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                      onClick={() => handlePaymentStatusChange(invoice, invoice.status === 'paid' ? 'pending' : 'paid')}
                                      className="text-xs sm:text-sm"
                                    >
                                      Mark as {invoice.status === 'paid' ? 'Pending' : 'Paid'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                                      className="text-xs sm:text-sm"
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => downloadPdf(invoice)}
                                      className="text-xs sm:text-sm"
                                    >
                                      Download PDF
                                    </DropdownMenuItem>
                                    {isTablet && (
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(invoice)}
                                        className="text-red-500 focus:text-red-500 focus:bg-red-50 text-xs sm:text-sm"
                                      >
                                        Delete Invoice
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <p>More Actions</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="h-8 w-8 mb-2" />
                        <p className="text-sm">No invoices found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-[90vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-2 sm:mb-4">
            <DialogTitle className="text-base sm:text-lg">Invoice Preview</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              A detailed preview of invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <>
              <div className="mt-2 sm:mt-4 overflow-x-auto">
                {selectedInvoice.status === 'paid' && selectedInvoice.paymentMethod && (
                  <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-md flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>
                      Payment Received via {
                        PAYMENT_METHODS.find(m => m.id === selectedInvoice.paymentMethod)?.label || 
                        selectedInvoice.paymentMethod
                      }
                    </span>
                  </div>
                )}
                <InvoiceTemplate invoice={selectedInvoice} />
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => downloadPdf(selectedInvoice)}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                >
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100vw-32px)] max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel 
              onClick={() => setInvoiceToDelete(null)}
              className="text-xs sm:text-sm h-8 sm:h-10 mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm h-8 sm:h-10"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PaymentMethodDialog
        open={isPaymentMethodDialogOpen}
        onOpenChange={setIsPaymentMethodDialogOpen}
        onConfirm={handlePaymentMethodConfirm}
        initialPaymentMethod=""
      />
    </div>
    
  );
  
};

export default Invoices;