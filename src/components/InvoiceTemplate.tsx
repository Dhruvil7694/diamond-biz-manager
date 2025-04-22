import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useViewport } from '@/contexts/ViewportContext';
import { cn } from '@/lib/utils';
import { PAYMENT_METHODS } from './PaymentMethodDialog';

// Define interface for the invoice and its entries
interface DiamondEntry {
  id: string;
  kapanId?: string;
  weight?: number;
  numberOfDiamonds?: number;
  category?: '4P Plus' | '4P Minus' | '4p Plus' | '4p Minus' | string;
  color?: string;
  clarity?: string;
  cut?: string;
  rate?: number;
  totalValue?: number;
}


interface ClientDetails {
  isPremium: any;
  name: string;
  company?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  rates?: {
    fourPPlus: number;
    fourPMinus: number;
  };
  paymentTerms?: string;
}

interface CompanyDetails {
  companyName: string;
  address: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountHolderName: string;
}

interface InvoiceProps {
  invoice: {
    id: number | string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    clientId: string;
    clientName: string;
    clientDetails?: ClientDetails;
    company?: CompanyDetails;
    amount: number;
    status: string;
    paymentDate?: string | null;
    paymentMethod?: string | null;
    entries: DiamondEntry[];

  };
}

// Component for generating invoice template
const InvoiceTemplate = ({ invoice }: InvoiceProps) => {
  const { isMobile, isTablet } = useViewport();
  
  // Check if entries exist and are valid
  const hasValidEntries = Array.isArray(invoice.entries) && invoice.entries.length > 0;

  // Calculate subtotals by category
  const fourPPlusEntries = hasValidEntries 
    ? invoice.entries.filter(entry => 
        entry && (entry.category === '4P Plus' || entry.category === '4p Plus'))
    : [];
    
  const fourPMinusEntries = hasValidEntries 
    ? invoice.entries.filter(entry => 
        entry && (entry.category === '4P Minus' || entry.category === '4p Minus'))
    : [];
  
  const fourPPlusTotal = fourPPlusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
  const fourPMinusTotal = fourPMinusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
  
  const fourPPlusTotalWeight = fourPPlusEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
  const fourPMinusTotalWeight = fourPMinusEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
  
  const fourPPlusTotalCount = fourPPlusEntries.reduce((sum, entry) => sum + (entry.numberOfDiamonds || 0), 0);
  const fourPMinusTotalCount = fourPMinusEntries.reduce((sum, entry) => sum + (entry.numberOfDiamonds || 0), 0);
  
  // Calculate grand total
  const total = invoice.amount || (fourPPlusTotal + fourPMinusTotal);

  // Calculate average rates
  const fourPPlusAvgRate = fourPPlusTotalWeight > 0 
    ? Math.round(fourPPlusTotal / fourPPlusTotalWeight) 
    : invoice.clientDetails?.rates?.fourPPlus || 0;
    
  const fourPMinusAvgRate = fourPMinusTotalCount > 0 
    ? Math.round(fourPMinusTotal / fourPMinusTotalCount) 
    : invoice.clientDetails?.rates?.fourPMinus || 0;

  // Format dates for display with fallbacks
  const formatDateWithFallback = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), isMobile ? 'dd/MM/yy' : 'dd MMM yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return 'Invalid date';
    }
  };

  // Status indicator component
  const StatusIndicator = () => {
    const getStatusDetails = () => {
      const now = new Date();
      const due = new Date(invoice.dueDate);
      const isPastDue = now > due;
      
      if (invoice.status === 'paid') {
        const paymentMethodObj = invoice.paymentMethod ? 
          PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod) : null;
          
        return {
          label: 'Paid',
          icon: <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          paymentMethod: paymentMethodObj?.label
        };
      } else if (isPastDue) {
        return {
          label: 'Past Due',
          icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />,
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      } else {
        return {
          label: 'Pending',
          icon: <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />,
          color: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      }
    };
    
    const status = getStatusDetails();
    
    return (
      <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs ${status.color}`}>
        {status.icon}
        <span className="ml-1 sm:ml-2 font-medium">{status.label}</span>
      </div>
    );
  };

  

  return (
    <div className="bg-white rounded-lg shadow-md w-full overflow-hidden print:shadow-none print:my-0 print:w-full">
      {/* Header */}
      <div className="bg-indigo-800 text-white p-3 sm:p-4 print:p-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold">INVOICE</h1>
          <div>
            <p className="text-xs sm:text-sm text-right">#{invoice.invoiceNumber}</p>
            <StatusIndicator />
          </div>
        </div>
      </div>
      
      {/* Company and Client Information */}
      <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-100 shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Company Information */}
          <div className="space-y-3">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">From</h3>
              <div className="h-px bg-gray-200 flex-1 ml-3"></div>
            </div>
            
            {invoice.company ? (
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-900">{invoice.company.companyName}</p>
                <div className="text-gray-700">
                  <p>{invoice.company.address}</p>
                  {invoice.company.phone && (
                    <div className="flex items-start mt-2">
                      <span className="text-gray-500 w-16 flex-shrink-0">Phone:</span>
                      <span>{invoice.company.phone}</span>
                    </div>
                  )}
                  {invoice.company.email && (
                    <div className="flex items-start mt-1">
                      <span className="text-gray-500 w-16 flex-shrink-0">Email:</span>
                      <span className="text-gray-900">{invoice.company.email}</span>
                    </div>
                  )}
                  {invoice.company.gstNumber && (
                    <div className="flex items-start mt-1">
                      <span className="text-gray-500 w-16 flex-shrink-0">GST:</span>
                      <span className="font-medium">{invoice.company.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-900">Diamond Business</p>
                <div className="text-gray-700">
                  <p>Mumbai, Maharashtra</p>
                  <div className="flex items-start mt-2">
                    <span className="text-gray-500 w-16 flex-shrink-0">Phone:</span>
                    <span>+91 22 1234 5678</span>
                  </div>
                  <div className="flex items-start mt-1">
                    <span className="text-gray-500 w-16 flex-shrink-0">Email:</span>
                    <span className="text-gray-900">contact@diamondbusiness.com</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Client Information */}
          <div className="space-y-3">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Bill To</h3>
              <div className="h-px bg-gray-200 flex-1 ml-3"></div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-900">{invoice.clientName}</p>
              {invoice.clientDetails?.company && (
                <p className="text-gray-700">{invoice.clientDetails.company}</p>
              )}
              
              <div className="mt-2">
                {invoice.clientDetails?.contactPerson && (
                  <div className="flex items-start">
                    <span className="text-gray-500 w-16 flex-shrink-0">Contact:</span>
                    <span className="text-gray-700">{invoice.clientDetails.contactPerson}</span>
                  </div>
                )}
                
                {invoice.clientDetails?.phone && (
                  <div className="flex items-start mt-1">
                    <span className="text-gray-500 w-16 flex-shrink-0">Phone:</span>
                    <span className="text-gray-700">{invoice.clientDetails.phone}</span>
                  </div>
                )}
                
                {invoice.clientDetails?.email && (
                  <div className="flex items-start mt-1">
                    <span className="text-gray-500 w-16 flex-shrink-0">Email:</span>
                    <span className="text-gray-700 break-all">{invoice.clientDetails.email}</span>
                  </div>
                )}
                
                <div className="flex items-start mt-1">
                  <span className="text-gray-500 w-16 flex-shrink-0">Client ID:</span>
                  <span className="text-gray-700 font-medium">{invoice.clientId}</span>
                </div>
              </div>
            </div>
            
            {/* Option: Display a badge for good clients */}
            {invoice.clientDetails?.isPremium && (
              <div className="mt-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Premium Client
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details and Dates */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 shadow-sm my-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {/* Issue Date */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1.5">
              <span className="h-3 w-3 bg-indigo-100 rounded-full mr-2"></span>
              <p className="text-gray-500 text-xs sm:text-sm">Issue Date</p>
            </div>
            <p className="font-medium text-gray-900 text-sm sm:text-base pl-5">
              {formatDateWithFallback(invoice.date)}
            </p>
          </div>
          
          {/* Due Date */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1.5">
              <span className="h-3 w-3 bg-amber-100 rounded-full mr-2"></span>
              <p className="text-gray-500 text-xs sm:text-sm">Due Date</p>
            </div>
            <p className="font-medium text-gray-900 text-sm sm:text-base pl-5">
              {formatDateWithFallback(invoice.dueDate)}
            </p>
          </div>
          
          {/* Payment Date - Only shown when paid */}
          {invoice.status === 'paid' && invoice.paymentDate && (
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <span className="h-3 w-3 bg-green-100 rounded-full mr-2"></span>
                <p className="text-gray-500 text-xs sm:text-sm">Payment Date</p>
              </div>
              <p className="font-medium text-green-700 text-sm sm:text-base pl-5">
                {formatDateWithFallback(invoice.paymentDate)}
              </p>
            </div>
          )}
          
          {/* Payment Method - Only shown when paid */}
          {invoice.status === 'paid' && invoice.paymentMethod && (
            <div className="flex flex-col">
              <div className="flex items-center mb-1.5">
                <span className="h-3 w-3 bg-green-100 rounded-full mr-2"></span>
                <p className="text-gray-500 text-xs sm:text-sm">Payment Method</p>
              </div>
              <div className="font-medium text-green-700 text-sm sm:text-base pl-5 flex items-center">
                {(() => {
                  const method = PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod);
                  if (method) {
                    const Icon = method.icon;
                    return (
                      <>
                        <Icon className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>{method.label}</span>
                      </>
                    );
                  }
                  return invoice.paymentMethod;
                })()}
              </div>
            </div>
          )}
        </div>
        
        {/* Payment Status Banner - Only shown when paid */}
        {invoice.status === 'paid' && invoice.paymentMethod && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-green-50 rounded-md px-3 py-2 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-green-800 font-medium text-sm">
                  Payment Received via {
                    PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || 
                    invoice.paymentMethod
                  }
                </p>
                {invoice.paymentDate && (
                  <p className="text-green-600 text-xs">
                    on {formatDateWithFallback(invoice.paymentDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Category Summary Section */}
      {hasValidEntries && (
  <div className="px-5 py-4 bg-white rounded-lg border border-gray-100 shadow-sm my-4">
    <div className="flex items-center mb-4">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <h3 className="font-bold text-gray-800 text-base sm:text-lg">Diamond Summary</h3>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 print:grid-cols-3">
      {/* 4P Plus summary */}
      {fourPPlusEntries.length > 0 && (
        <div className="sm:col-span-1 rounded-xl overflow-hidden border border-indigo-100 shadow-sm">
          <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white px-3 py-2 flex items-center">
            <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-1.5">
              <span className="font-semibold text-xs">4P+</span>
            </div>
            <h4 className="font-medium text-sm">4P Plus Diamonds</h4>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-indigo-400 text-xs uppercase tracking-wide mb-0.5">Count</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">{fourPPlusTotalCount}</p>
                  <p className="text-gray-500 text-xs ml-1">pcs</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-indigo-400 text-xs uppercase tracking-wide mb-0.5">Weight</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">{fourPPlusTotalWeight.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs ml-1">ct</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-indigo-400 text-xs uppercase tracking-wide mb-0.5">Rate</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">₹{fourPPlusAvgRate.toLocaleString('en-IN')}</p>
                  <p className="text-gray-500 text-xs ml-1">/ct</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-indigo-400 text-xs uppercase tracking-wide mb-0.5">Amount</p>
                <p className="font-semibold text-gray-900 text-sm">₹{fourPPlusTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 4P Minus summary */}
      {fourPMinusEntries.length > 0 && (
        <div className="sm:col-span-1 rounded-xl overflow-hidden border border-blue-100 shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 py-2 flex items-center">
            <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-1.5">
              <span className="font-semibold text-xs">4P-</span>
            </div>
            <h4 className="font-medium text-sm">4P Minus Diamonds</h4>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Count</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">{fourPMinusTotalCount}</p>
                  <p className="text-gray-500 text-xs ml-1">pcs</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Weight</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">{fourPMinusTotalWeight.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs ml-1">ct</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Rate</p>
                <div className="flex items-baseline">
                  <p className="font-semibold text-gray-900 text-sm">₹{fourPMinusAvgRate.toLocaleString('en-IN')}</p>
                  <p className="text-gray-500 text-xs ml-1">/pc</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <p className="text-blue-400 text-xs uppercase tracking-wide mb-0.5">Amount</p>
                <p className="font-semibold text-gray-900 text-sm">₹{fourPMinusTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Total Summary - Now placed in the same row */}
      <div className="sm:col-span-1 flex items-center">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm w-full h-full p-4 flex flex-col justify-center">
          <div className="mb-1 flex justify-between items-center">
            <div className="flex items-center">
              <h4 className="font-medium text-gray-700 text-sm">Total Amount</h4>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-md">Invoice Value</span>
          </div>
          
          <div className="mt-2 text-center">
            <p className="font-bold text-gray-900 text-2xl">₹{(fourPPlusTotal + fourPMinusTotal).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-1">Combined value of all diamonds</p>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-xs text-gray-500">4P Plus</p>
                <p className="font-medium text-gray-800 text-sm">₹{fourPPlusTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">4P Minus</p>
                <p className="font-medium text-gray-800 text-sm">₹{fourPMinusTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
)}
    
      {/* Diamond Entries Table/List */}
      <div className="px-3 sm:px-4 py-2">
        <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Diamond Details:</h3>
        
        {/* Mobile: Card-based list view */}
        {isMobile && (
          <div className="border rounded-md overflow-hidden">
            {hasValidEntries ? (
              <div className="divide-y">
                {invoice.entries.map((entry, index) => (
                  <div 
                    key={entry.id || index}
                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} p-3`}
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (entry.category === '4P Plus' || entry.category === '4p Plus')
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.category || 'N/A'}
                        </span>
                      </div>
                      <div className="font-semibold text-sm">
                        ₹{(entry.totalValue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-gray-500">ID:</span> {entry.id || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Kapan:</span> {entry.kapanId || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Count:</span> {entry.numberOfDiamonds ?? 0}
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span> {entry.weight !== undefined ? entry.weight.toFixed(2) : '0.00'} ct
                      </div>
                      <div>
                        <span className="text-gray-500">Rate:</span> ₹{entry.rate?.toLocaleString('en-IN') || 0}
                      </div>
                      {entry.color && (
                        <div>
                          <span className="text-gray-500">Specs:</span> {entry.color}/{entry.clarity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-xs sm:text-sm text-center text-gray-500">
                No diamond entries found for this invoice.
              </div>
            )}
          </div>
        )}
        
        {/* Desktop & Tablet: Table view */}
        {!isMobile && (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider w-10">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Diamond ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Kapan ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Count</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Weight</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hasValidEntries ? (
                    invoice.entries.map((entry, index) => (
                      <tr key={entry.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-center">{index + 1}</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{entry.id || 'N/A'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{entry.kapanId || 'N/A'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (entry.category === '4P Plus' || entry.category === '4p Plus')
                              ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {entry.numberOfDiamonds ?? 0}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {entry.weight !== undefined ? entry.weight.toFixed(2) : '0.00'} ct
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          ₹{entry.rate?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                          ₹{(entry.totalValue || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-sm text-center text-gray-500">
                        No diamond entries found for this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      
      {/* Payment Summary and Bank Details */}
      {/* Payment Summary and Bank Details */}
<div className="px-5 py-4 bg-white rounded-lg border border-gray-100 shadow-sm my-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <div>
      {/* Bank Details with updated fields */}
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-2">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3 className="font-semibold text-gray-800 text-base">Bank Details</h3>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 p-4">
          {invoice.company ? (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Bank Name:</span>
                <span className="text-gray-900 font-medium col-span-2">{invoice.company.bankName}</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Account No:</span>
                <span className="text-gray-900 font-medium col-span-2">{invoice.company.accountNumber}</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Account Name:</span>
                <span className="text-gray-900 font-medium col-span-2">{invoice.company.accountHolderName || 'Hirenbhai R Patel'}</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">IFSC Code:</span>
                <span className="text-gray-900 font-medium col-span-2">{invoice.company.ifscCode}</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Branch:</span>
                <span className="text-gray-900 font-medium col-span-2">{invoice.company.branch}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Bank Name:</span>
                <span className="text-gray-900 font-medium col-span-2">HDFC Bank</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Account No:</span>
                <span className="text-gray-900 font-medium col-span-2">12312312311</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Account Name:</span>
                <span className="text-gray-900 font-medium col-span-2">Hirenbhai R Patel</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">IFSC Code:</span>
                <span className="text-gray-900 font-medium col-span-2">HDFC0001234</span>
              </div>
              <div className="grid grid-cols-3 items-baseline">
                <span className="text-gray-500 col-span-1">Branch:</span>
                <span className="text-gray-900 font-medium col-span-2">Main Branch</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment Terms */}
      <div>
        <div className="flex items-center mb-3">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3 className="font-semibold text-gray-800 text-base">Payment Terms</h3>
        </div>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {invoice.clientDetails?.paymentTerms || 'Payment is due within 30 days of invoice date.'}
        </p>
      </div>
    </div>
    
    {/* Total Summary */}
    <div className="flex flex-col items-end justify-end">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-gray-600">4P Plus Subtotal:</span>
            <span className="font-medium text-gray-900">₹{fourPPlusTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-gray-600">4P Minus Subtotal:</span>
            <span className="font-medium text-gray-900">₹{fourPMinusTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-gray-800 text-base">Total:</span>
            <span className="font-bold text-gray-900 text-lg">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        {invoice.status === 'paid' && (
          <div className="mt-3 text-center py-2 bg-green-100 text-green-800 rounded-md border border-green-200 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
            <span className="font-medium text-sm">
              {invoice.paymentMethod ? 
                `Payment Received via ${PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || invoice.paymentMethod}` : 
                'Payment Received'}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-right px-2">
        Thank you for your business!
      </div>
    </div>
  </div>
</div>
      
      {/* Footer */}
      <div className="py-2 sm:py-3 px-3 sm:px-4 bg-indigo-800 text-white text-xs text-center mt-1">
        {invoice.company ? (
          <p>{invoice.company.companyName} • {invoice.company.address} • {invoice.company.email || ''} • {invoice.company.phone || ''}</p>
        ) : (
          <p>Diamond Business • Mumbai, Maharashtra • contact@diamondbusiness.com • +91 22 1234 5678</p>
        )}
      </div>

      {/* Print Styles (these will only apply when printing) */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:my-0 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          .print\\:w-full {
            width: 100% !important;
          }
          
          .print\\:p-3 {
            padding: 0.75rem !important;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .bg-indigo-800 {
            background-color: #4338ca !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-indigo-700 {
            background-color: #4f46e5 !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-indigo-50 {
            background-color: #eef2ff !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-indigo-100 {
            background-color: #e0e7ff !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-blue-100 {
            background-color: #dbeafe !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-green-100 {
            background-color: #dcfce7 !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-amber-100 {
            background-color: #fef3c7 !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-red-100 {
            background-color: #fee2e2 !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceTemplate;