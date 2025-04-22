import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Printer,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import InvoiceTemplate from './InvoiceTemplate';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData } from '@/contexts/DataContext';
import { useViewport } from '@/contexts/ViewportContext';
import { cn } from '@/lib/utils';
import PaymentMethodDialog, { PAYMENT_METHODS } from './PaymentMethodDialog';


const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const { getCompleteInvoice, updateInvoice } = useData();
  const { isMobile, isTablet } = useViewport();
  const [scrolled, setScrolled] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Get invoice data using the getCompleteInvoice function
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const completeInvoice = await getCompleteInvoice(id);
        if (completeInvoice) {
          // Convert to the format expected by InvoiceTemplate
          const templateData = {
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
              }
            },
            company: completeInvoice.company,
            amount: completeInvoice.totalAmount,
            status: completeInvoice.status,
            paymentDate: completeInvoice.paymentDate,
            entries: completeInvoice.diamondDetails.map(diamond => ({
              id: diamond.id,
              kapanId: diamond.kapanId,
              weight: diamond.weightInKarats,
              numberOfDiamonds: diamond.numberOfDiamonds,
              category: diamond.category,
              rate: diamond.category === '4P Plus'
                ? Math.round(diamond.totalValue / diamond.weightInKarats)
                : Math.round(diamond.totalValue / diamond.numberOfDiamonds),
              totalValue: diamond.totalValue
            }))
          };
          
          setInvoiceData(templateData);
        } else {
          toast({
            title: "Error",
            description: "Invoice not found",
            variant: "destructive",
          });
          navigate('/invoices');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [id, getCompleteInvoice, navigate]);
  
  const handleTogglePending = () => {
    if (invoiceData?.status === 'paid') {
      togglePaymentStatus(undefined); // This will mark it as pending
    }
  };
  
  const handleOpenPaymentDialog = () => {
    if (invoiceData?.status !== 'paid') {
      setIsPaymentMethodDialogOpen(true);
    }
  };

  // Toggle payment status
  const togglePaymentStatus = async (paymentMethod?: string) => {
    if (!invoiceData) return;
    
    const newStatus = invoiceData.status === 'paid' ? 'pending' : 'paid';
    const paymentDate = newStatus === 'paid' ? new Date().toISOString() : null;
    
    try {
      await updateInvoice({
        ...invoiceData,
        status: newStatus,
        paymentDate,
        paymentMethod: newStatus === 'paid' ? paymentMethod : null,
        diamonds: invoiceData.entries.map((entry: any) => entry.id)
      });
      
      setInvoiceData({ 
        ...invoiceData, 
        status: newStatus, 
        paymentDate,
        paymentMethod: newStatus === 'paid' ? paymentMethod : null 
      });
      
      toast({
        title: "Payment Status Updated",
        description: `Invoice ${invoiceData.invoiceNumber} has been marked as ${newStatus}`,
        variant: newStatus === 'paid' ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle printing the invoice
  // Full printInvoice function for InvoiceDetail.tsx
  const printInvoice = () => {
    // Create a new window for the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Failed to open print window. Please check your popup blocker settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Format currency consistently
    const formatCurrency = (amount) => {
      return '₹' + amount.toLocaleString('en-IN');
    };
    
    // Generate diamond rows HTML with more compact layout
    const diamondRowsHtml = invoiceData.entries.map((entry, index) => `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="p-1 text-xs text-center">${index + 1}</td>
        <td class="p-1 text-xs">${entry.id || 'N/A'}</td>
        <td class="p-1 text-xs">${entry.kapanId || 'N/A'}</td>
        <td class="p-1 text-xs">
          <span class="px-1 py-0.5 rounded-full text-xs ${
            (entry.category === '4P Plus' || entry.category === '4p Plus')
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-blue-100 text-blue-800'
          }">
            ${entry.category || 'N/A'}
          </span>
        </td>
        <td class="p-1 text-xs text-right">${entry.numberOfDiamonds || 0}</td>
        <td class="p-1 text-xs text-right">${entry.weight ? entry.weight.toFixed(2) : '0.00'}</td>
        <td class="p-1 text-xs text-right">${formatCurrency(entry.rate || 0)}</td>
        <td class="p-1 text-xs text-right font-medium">${formatCurrency(entry.totalValue || 0)}</td>
      </tr>
    `).join('');
    
    // Calculate category totals
    const fourPPlusEntries = invoiceData.entries.filter(entry => 
      entry && (entry.category === '4P Plus' || entry.category === '4p Plus')
    );
    
    const fourPMinusEntries = invoiceData.entries.filter(entry => 
      entry && (entry.category === '4P Minus' || entry.category === '4p Minus')
    );
    
    const fourPPlusTotal = fourPPlusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
    const fourPMinusTotal = fourPMinusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
    const total = invoiceData.amount || (fourPPlusTotal + fourPMinusTotal);
    
    const fourPPlusTotalCount = fourPPlusEntries.reduce((sum, entry) => sum + (entry.numberOfDiamonds || 0), 0);
    const fourPMinusTotalCount = fourPMinusEntries.reduce((sum, entry) => sum + (entry.numberOfDiamonds || 0), 0);
    
    const fourPPlusTotalWeight = fourPPlusEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    const fourPMinusTotalWeight = fourPMinusEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    
    const fourPPlusAvgRate = fourPPlusTotalWeight > 0 
      ? Math.round(fourPPlusTotal / fourPPlusTotalWeight) 
      : 0;
      
    const fourPMinusAvgRate = fourPMinusTotalCount > 0 
      ? Math.round(fourPMinusTotal / fourPMinusTotalCount) 
      : 0;
    
    // Get payment method label
    const paymentMethodLabel = invoiceData.paymentMethod ? 
      (PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || 'Other Payment Method') : 
      'Other Method';
    
    // Invoice HTML template with compact layout
    const invoiceHTML = `
      <div class="max-w-4xl mx-auto bg-white">
        <!-- Header -->
        <div class="bg-indigo-800 text-white py-2 px-3">
          <div class="flex justify-between items-center">
            <h1 class="text-base font-bold">INVOICE</h1>
            <div>
              <p class="text-xs text-right">#${invoiceData.invoiceNumber}</p>
              <div class="inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                invoiceData.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }">
                <span class="font-medium">${invoiceData.status === 'paid' ? 'Paid' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Company and Client Information + Dates (combined for space efficiency) -->
        <div class="grid grid-cols-12 gap-2 p-2">
          <!-- Company info -->
          <div class="col-span-4">
            <h3 class="text-xs font-bold text-gray-700">From:</h3>
            <div class="text-xs">
              <p class="font-medium">${invoiceData.company?.companyName || 'Rashi Diamonds'}</p>
              <p>${invoiceData.company?.address || 'Bamanji Ni seri, Rushab Tower'}</p>
              <p>Ph: ${invoiceData.company?.phone || '9879225849'}</p>
              <p>Email: ${invoiceData.company?.email || 'hirenpatel@gmail.com'}</p>
            </div>
          </div>
          
          <!-- Client info -->
          <div class="col-span-4">
            <h3 class="text-xs font-bold text-gray-700">To:</h3>
            <div class="text-xs">
              <p class="font-medium">${invoiceData.clientName}</p>
              <p>${invoiceData.clientDetails?.company || 'N/A'}</p>
              <p>Contact: ${invoiceData.clientDetails?.contactPerson || 'N/A'}</p>
              <p>Ph: ${invoiceData.clientDetails?.phone || 'N/A'}</p>
            </div>
          </div>
          
          <!-- Invoice Details -->
          <div class="col-span-4 text-xs bg-gray-50 p-2 rounded">
            <div class="grid grid-cols-2 gap-1">
              <div>
                <p class="text-gray-500">Issue Date:</p>
                <p class="font-medium">${format(new Date(invoiceData.date), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p class="text-gray-500">Due Date:</p>
                <p class="font-medium">${format(new Date(invoiceData.dueDate), 'dd/MM/yyyy')}</p>
              </div>
              ${invoiceData.status === 'paid' && invoiceData.paymentDate ? `
                <div>
                  <p class="text-gray-500">Payment Date:</p>
                  <p class="font-medium">${format(new Date(invoiceData.paymentDate), 'dd/MM/yyyy')}</p>
                </div>
              ` : ''}
              ${invoiceData.status === 'paid' && invoiceData.paymentMethod ? `
                <div>
                  <p class="text-gray-500">Payment Method:</p>
                  <p class="font-medium">${paymentMethodLabel}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Payment Received Banner - More compact for paid invoices -->
        ${invoiceData.status === 'paid' ? `
          <div class="px-2 py-1 mx-2 mb-1 bg-green-50 border border-green-200 rounded-md">
            <div class="flex items-center text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 mr-1">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span class="font-medium text-green-800">
                Payment Received via ${paymentMethodLabel} ${invoiceData.paymentDate ? `on ${format(new Date(invoiceData.paymentDate), 'dd/MM/yyyy')}` : ''}
              </span>
            </div>
          </div>
        ` : ''}
        
        <!-- Diamond Summary Section - Compact horizontal layout -->
        ${invoiceData.entries && invoiceData.entries.length > 0 ? `
          <div class="px-2 py-1">
            <h3 class="text-xs font-bold text-gray-700 mb-1">Diamond Summary:</h3>
            <div class="flex gap-2">
              <!-- 4P Plus summary -->
              ${fourPPlusEntries.length > 0 ? `
                <div class="flex-1 border rounded overflow-hidden text-xs">
                  <div class="bg-indigo-800 text-white px-2 py-0.5">
                    <h4 class="font-medium">4P Plus</h4>
                  </div>
                  <div class="p-1 bg-indigo-50 grid grid-cols-2 gap-1">
                    <div>
                      <p class="text-gray-500">Count: ${fourPPlusTotalCount}</p>
                      <p class="text-gray-500">Weight: ${fourPPlusTotalWeight.toFixed(2)} ct</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Rate: ₹${fourPPlusAvgRate.toLocaleString('en-IN')}/ct</p>
                      <p class="font-medium text-gray-900">₹${fourPPlusTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <!-- 4P Minus summary -->
              ${fourPMinusEntries.length > 0 ? `
                <div class="flex-1 border rounded overflow-hidden text-xs">
                  <div class="bg-indigo-700 text-white px-2 py-0.5">
                    <h4 class="font-medium">4P Minus</h4>
                  </div>
                  <div class="p-1 bg-indigo-50 grid grid-cols-2 gap-1">
                    <div>
                      <p class="text-gray-500">Count: ${fourPMinusTotalCount}</p>
                      <p class="text-gray-500">Weight: ${fourPMinusTotalWeight.toFixed(2)} ct</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Rate: ₹${fourPMinusAvgRate.toLocaleString('en-IN')}/pc</p>
                      <p class="font-medium text-gray-900">₹${fourPMinusTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <!-- Total summary -->
              <div class="flex-1 border rounded overflow-hidden text-xs border-gray-300">
                <div class="bg-gray-200 text-gray-800 px-2 py-0.5">
                  <h4 class="font-medium">Total Amount</h4>
                </div>
                <div class="p-1 bg-gray-50 flex items-center justify-center">
                  <div class="text-center">
                    <p class="text-lg font-bold text-gray-900">₹${total.toLocaleString('en-IN')}</p>
                    <p class="text-xs text-gray-500">Combined value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Diamond Entries Table - Compact version -->
        <div class="px-2 py-1">
          <h3 class="text-xs font-bold text-gray-700 mb-1">Diamond Details:</h3>
          <div class="border rounded overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-indigo-800 text-white">
                <tr>
                  <th class="p-1 text-left text-xs font-medium uppercase w-5">#</th>
                  <th class="p-1 text-left text-xs font-medium uppercase">ID</th>
                  <th class="p-1 text-left text-xs font-medium uppercase">Kapan</th>
                  <th class="p-1 text-left text-xs font-medium uppercase">Cat.</th>
                  <th class="p-1 text-right text-xs font-medium uppercase">Count</th>
                  <th class="p-1 text-right text-xs font-medium uppercase">Weight</th>
                  <th class="p-1 text-right text-xs font-medium uppercase">Rate</th>
                  <th class="p-1 text-right text-xs font-medium uppercase">Amount</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${diamondRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Payment Summary and Bank Details - Horizontal layout -->
        <div class="px-2 py-1 grid grid-cols-12 gap-2">
          <div class="col-span-7">
            <!-- Bank Details -->
            <div class="text-xs">
              <h3 class="font-bold text-gray-700 mb-1">Bank Details:</h3>
              <div class="bg-gray-50 p-1 rounded border border-gray-100">
                <div class="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <div>
                    <span class="text-gray-500">Bank:</span>
                    <span class="font-medium">${invoiceData.company?.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">A/C No:</span>
                    <span class="font-medium">${invoiceData.company?.accountNumber || '12312312311'}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Name:</span>
                    <span class="font-medium">${invoiceData.company?.accountHolderName || 'Hirenbhai R Patel'}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">IFSC:</span>
                    <span class="font-medium">${invoiceData.company?.ifscCode || 'HDFC0001234'}</span>
                  </div>
                </div>
              </div>
              
              <!-- Payment Terms -->
              <h3 class="font-bold text-gray-700 mt-1 mb-1">Payment Terms:</h3>
              <p class="text-xs text-gray-600 bg-gray-50 p-1 rounded border border-gray-100">
                ${invoiceData.clientDetails?.paymentTerms || 'Payment is due within 30 days of invoice date.'}
              </p>
            </div>
          </div>
          
          <!-- Totals -->
          <div class="col-span-5 flex items-start justify-end">
            <div class="bg-gray-50 p-2 rounded-md border border-gray-200 w-full">
              <div class="space-y-0.5 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">4P Plus Subtotal:</span>
                  <span class="font-medium text-gray-900">₹${fourPPlusTotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">4P Minus Subtotal:</span>
                  <span class="font-medium text-gray-900">₹${fourPMinusTotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="h-px bg-gray-300 my-0.5"></div>
                <div class="flex justify-between items-center">
                  <span class="font-bold text-gray-800">Total:</span>
                  <span class="font-bold text-gray-900">₹${total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              ${invoiceData.status === 'paid' ? `
                <div class="mt-1 text-center py-0.5 bg-green-100 text-green-800 rounded text-xs">
                  Payment Received
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="py-1 px-3 bg-indigo-800 text-white text-xs text-center mt-1">
          <p>${invoiceData.company?.companyName || 'Rashi Diamonds'} • ${invoiceData.company?.phone || '9879225849'}</p>
        </div>
      </div>
    `;
    
    // Add necessary styles for printing
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.2;
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
              font-size: 0.65rem;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              padding: 0.25rem;
              font-weight: bold;
            }
            
            td {
              padding: 0.25rem;
              border-top: 1px solid #e5e7eb;
              font-size: 0.65rem;
            }
            
            .text-xs {
              font-size: 0.65rem;
            }
            
            .bg-indigo-800 {
              background-color: #4338ca !important;
              color: white !important;
            }
            
            .bg-indigo-700 {
              background-color: #4f46e5 !important;
              color: white !important;
            }
            
            .bg-indigo-100 {
              background-color: #e0e7ff !important;
            }
            
            .bg-indigo-50 {
              background-color: #eef2ff !important;
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
            
            .bg-green-50 {
              background-color: #f0fdf4 !important;
            }
            
            .text-green-600 {
              color: #16a34a !important;
            }
            
            .text-green-700 {
              color: #15803d !important;
            }
            
            .bg-amber-100 {
              background-color: #fef3c7 !important;
            }
            
            .text-amber-800 {
              color: #92400e !important;
            }
            
            .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            
            .border-green-200 {
              border-color: #bbf7d0 !important;
            }
            
            .print-button {
              position: fixed;
              bottom: 20px;
              right: 20px;
              padding: 10px 20px;
              background-color: #4338ca;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            @media print {
              .no-print, .print-button {
                display: none !important;
              }
              
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body class="bg-white">
          <div id="invoice-content" class="p-1">${invoiceHTML}</div>
          
          <button class="print-button no-print" onclick="window.print()">
            Print Invoice
          </button>
          
          <script>
            window.onload = function() {
              // Wait for all styles to load
              setTimeout(function() {
                // Auto-print on desktop, but not on mobile (let user decide)
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (!isMobile) {
                  window.print();
                }
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    
    // Close the document
    printWindow.document.close();
    
    // Focus the print window
    printWindow.focus();
    
    toast({
      title: "Print Ready",
      description: "Print dialog opened",
      variant: "default",
    });
  };
  
  // Function to generate PDF of the invoice
  const downloadPdf = () => {
    // Create a new window for the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Failed to open print window. Please check your popup blocker settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Add necessary styles for printing
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: white;
              margin: 0;
              padding: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 20px;
              background-color: #4f46e5;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div id="invoice-content" class="p-4 max-w-4xl mx-auto"></div>
          <button class="print-button" onclick="window.print(); return false;">Print / Save as PDF</button>
          
          <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
        </body>
      </html>
    `);
    
    // Create a simplified version of the invoice data
    const printableInvoice = {
      ...invoiceData,
      company: invoiceData.company || {
        companyName: 'Rashi Diamonds',
        address: 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat',
        phone: '9879225849',
        email: 'hirenpatel29111997@gmail.com',
        gstNumber: '27ABCDE1234F1Z5',
        bankName: 'BOB Bank',
        accountNumber: '12341234123',
        ifscCode: 'BARB0KIMXXX',
        branch: 'Kim Branch'
      }
    };
    
    // Render a simplified version of the invoice for printing
    const invoiceHTML = `
      <div class="max-w-4xl mx-auto bg-white">
        <!-- Header -->
        <div class="bg-indigo-800 text-white p-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold">INVOICE</h1>
            <div>
              <p class="text-sm text-right">#${invoiceData.invoiceNumber}</p>
              <div class="inline-flex items-center px-3 py-1 rounded-full text-sm ${
                invoiceData.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }">
                <span class="font-medium">${invoiceData.status === 'paid' ? 'Paid' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Payment Method Banner for paid invoices -->
        ${invoiceData.status === 'paid' ? `
          <div class="p-3 bg-green-50 border border-green-200">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 mr-2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <div>
                <span class="font-medium text-green-800">
                  Payment Received via ${invoiceData.paymentMethod ? 
                    PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || 'Other Payment Method' : 
                    'Other Method'}
                </span>
                ${invoiceData.paymentDate ? `
                  <span class="text-sm text-green-700 ml-2">
                    on ${format(new Date(invoiceData.paymentDate), 'dd MMM yyyy')}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Rest of the invoice content... -->
        <!-- Company and Client Information -->
        <div class="p-4 grid grid-cols-2 gap-4">
          <!-- Company info -->
          <div>
            <h3 class="font-bold text-gray-700 mb-2">From:</h3>
            <div class="text-sm">
              <p class="font-medium">${printableInvoice.company.companyName}</p>
              <p>${printableInvoice.company.address}</p>
              <p>Phone: ${printableInvoice.company.phone}</p>
              <p>Email: ${printableInvoice.company.email}</p>
              <p>GST: ${printableInvoice.company.gstNumber}</p>
            </div>
          </div>
          
          <!-- Client info -->
          <div>
            <h3 class="font-bold text-gray-700 mb-2">To:</h3>
            <div class="text-sm">
              <p class="font-medium">${invoiceData.clientName}</p>
              <p>${invoiceData.clientDetails?.company || 'N/A'}</p>
              <p>Contact: ${invoiceData.clientDetails?.contactPerson || 'N/A'}</p>
              <p>Phone: ${invoiceData.clientDetails?.phone || 'N/A'}</p>
              <p>Email: ${invoiceData.clientDetails?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div class="px-4 py-2 bg-gray-50 grid grid-cols-4 gap-4">
          <div>
            <p class="text-sm text-gray-500">Issue Date</p>
            <p class="font-medium">${format(new Date(invoiceData.date), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Due Date</p>
            <p class="font-medium">${format(new Date(invoiceData.dueDate), 'dd MMM yyyy')}</p>
          </div>
          ${invoiceData.status === 'paid' && invoiceData.paymentDate ? `
            <div>
              <p class="text-sm text-gray-500">Payment Date</p>
              <p class="font-medium">${format(new Date(invoiceData.paymentDate), 'dd MMM yyyy')}</p>
            </div>
          ` : ''}
          ${invoiceData.status === 'paid' && invoiceData.paymentMethod ? `
            <div>
              <p class="text-sm text-gray-500">Payment Method</p>
              <p class="font-medium">
                ${PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || 'Other Method'}
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Table and rest of invoice content... -->
        <!-- Generate the table dynamically based on your data -->
      </div>
    `;
    
    printWindow.document.getElementById('invoice-content').innerHTML = invoiceHTML;
    
    // Close the document and focus the window
    printWindow.document.close();
    printWindow.focus();
    
    toast({
      title: "PDF Download",
      description: "Print dialog opened. Save as PDF to download.",
      variant: "default",
    });
  };
  
  // Render a loading state if the invoice is not yet loaded
  if (loading || !invoiceData) {
    return (
      <div className="container-responsive mx-auto p-3 sm:p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-700"></div>
        </div>
      </div>
    );
  }
  
  // Status indicator for the header
  const StatusIndicator = () => {
    const now = new Date();
    const due = new Date(invoiceData.dueDate);
    const isPastDue = now > due;
    
    if (invoiceData.status === 'paid') {
      const paymentMethod = invoiceData.paymentMethod ? 
        PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || 'Payment' : 
        'Payment';
      
      return (
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 sm:ml-2 font-medium">Paid</span>
          {invoiceData.paymentMethod && (
            <span className="ml-1 text-xs">via {paymentMethod}</span>
          )}
        </div>
      );
    } else if (isPastDue) {
      return (
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-red-100 text-red-800 border-red-200">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 sm:ml-2 font-medium">Past Due</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-amber-100 text-amber-800 border-amber-200">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 sm:ml-2 font-medium">Pending</span>
        </div>
      );
    }
  };

  {invoiceData.status === 'paid' && invoiceData.paymentMethod && (
    <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg shadow-sm">
      <div className="flex items-center">
        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
        <div>
          <h3 className="font-medium text-green-800">
            Payment Received via {PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || 'Other Payment Method'}
          </h3>
          {invoiceData.paymentDate && (
            <p className="text-xs text-green-700 mt-0.5">
              on {format(new Date(invoiceData.paymentDate), 'dd MMMM yyyy')}
            </p>
          )}
        </div>
      </div>
    </div>
  )}
  
  
  
  return (
    <div className="container-responsive mx-auto p-3 sm:p-4">
      {/* Sticky header for mobile */}
      {isMobile && (
        <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">{invoiceData.clientName}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(invoiceData.date), 'dd MMM yyyy')}
              </p>
            </div>
            <StatusIndicator />
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium">₹{invoiceData.amount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{format(new Date(invoiceData.dueDate), 'dd MMM yyyy')}</p>
            </div>
            {invoiceData.status === 'paid' && invoiceData.paymentMethod ? (
              <div>
                <p className="text-gray-500">Payment</p>
                <p className="font-medium">
                  {PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || invoiceData.paymentMethod}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500">Entries</p>
                <p className="font-medium">{invoiceData.entries.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Content with proper mobile padding */}
      <div className={isMobile ? "pt-16" : ""}>
        {/* Breadcrumb Navigation - Hide on mobile */}
        <div className="hidden sm:block mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{invoiceData.invoiceNumber}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Invoice Header - Desktop & Tablet */}
        {!isMobile && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/invoices')}
                className="mr-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Invoice {invoiceData.invoiceNumber}</h1>
                <div className="flex flex-wrap items-center mt-1 text-xs sm:text-sm text-gray-500">
                  <span className="mr-3">Client: {invoiceData.clientName}</span>
                  <span className="mr-3">Date: {format(new Date(invoiceData.date), 'dd MMM yyyy')}</span>
                  {invoiceData.status === 'paid' && invoiceData.paymentMethod && (
                    <span className="mr-3 text-green-600 font-medium">
                      Via: {PAYMENT_METHODS.find(m => m.id === invoiceData.paymentMethod)?.label || invoiceData.paymentMethod}
                    </span>
                  )}
                  <StatusIndicator />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={printInvoice}
                className="h-9 text-xs sm:text-sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              
              <Button 
                variant="outline"
                onClick={invoiceData?.status === 'paid' ? handleTogglePending : handleOpenPaymentDialog}
                className="h-9 text-xs sm:text-sm"
              >
                {invoiceData?.status === 'paid' ? 
                  <><Clock className="h-4 w-4 mr-2" />Mark as Pending</> : 
                  <><CheckCircle2 className="h-4 w-4 mr-2" />Mark as Paid</>
                }
              </Button> 
              
              {/* <Button 
                onClick={downloadPdf}
                className="h-9 text-xs sm:text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button> */}
            </div>
          </div>
        )}
        
        {/* Client Info Card - Mobile Only */}
        {isMobile && (
          <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">{invoiceData.clientName}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(invoiceData.date), 'dd MMM yyyy')}
                </p>
              </div>
              <StatusIndicator />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">₹{invoiceData.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium">{format(new Date(invoiceData.dueDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500">Entries</p>
                <p className="font-medium">{invoiceData.entries.length}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Invoice Content */}
        <div className="print:shadow-none bg-white rounded-lg shadow-sm overflow-hidden">
          <InvoiceTemplate invoice={invoiceData} />
        </div>
      </div>
      
      {/* Invoice Actions Card for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-md z-10">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            <Button variant="outline" onClick={printInvoice} className="h-10 text-xs">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            
            <Button variant="outline" onClick={invoiceData?.status === 'paid' ? handleTogglePending : handleOpenPaymentDialog} className="h-10 text-xs">
              {invoiceData.status === 'paid' ? 
                <><Clock className="h-4 w-4 mr-1" />Pending</> : 
                <><CheckCircle2 className="h-4 w-4 mr-1" />Paid</>
              }
            </Button>
            
            <Button onClick={downloadPdf} className="h-10 text-xs">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      )}
      
      {/* Add bottom padding on mobile to account for fixed action bar */}
      {isMobile && <div className="h-16"></div>}

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={isPaymentMethodDialogOpen}
        onOpenChange={setIsPaymentMethodDialogOpen}
        onConfirm={(method) => togglePaymentStatus(method)}
        initialPaymentMethod={invoiceData?.paymentMethod || ''}
      />
    </div>
    
  );
};

export default InvoiceDetails;