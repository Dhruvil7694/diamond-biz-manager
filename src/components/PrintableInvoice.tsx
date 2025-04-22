import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { PAYMENT_METHODS } from './PaymentMethodDialog';

const PrintableInvoice = ({ invoice }) => {
  // Format functions
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };
  
  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch (e) {
      return dateStr || 'N/A';
    }
  };
  
  // Get 4P Plus and 4P Minus entries
  const fourPPlusEntries = invoice.entries.filter(entry => 
    entry && (entry.category === '4P Plus' || entry.category === '4p Plus')
  );
  
  const fourPMinusEntries = invoice.entries.filter(entry => 
    entry && (entry.category === '4P Minus' || entry.category === '4p Minus')
  );
  
  // Calculate subtotals
  const fourPPlusTotal = fourPPlusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
  const fourPMinusTotal = fourPMinusEntries.reduce((sum, entry) => sum + (entry.totalValue || 0), 0);
  const total = invoice.amount || (fourPPlusTotal + fourPMinusTotal);
  
  return (
    <div className="max-w-4xl mx-auto bg-white print:shadow-none print:my-0">
      {/* Header */}
      <div className="bg-indigo-800 text-white p-4 print:bg-indigo-800 print:text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">INVOICE</h1>
          <div>
            <p className="text-sm text-right">#{invoice.invoiceNumber}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 print:bg-green-100 print:text-green-800">
              <span className="font-medium">
                {invoice.status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Method Banner for paid invoices */}
      {invoice.status === 'paid' && (
        <div className="p-3 bg-green-50 border border-green-200 print:bg-green-50 print:border-green-200">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <span className="font-medium text-green-800">
                Payment Received via {invoice.paymentMethod ? 
                  PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || 'Other Payment Method' : 
                  'Other Method'}
              </span>
              {invoice.paymentDate && (
                <span className="text-sm text-green-700 ml-2">
                  on {formatDate(invoice.paymentDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Company and Client Information */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold text-gray-700 mb-2">From:</h3>
          <div className="text-sm">
            <p className="font-medium">{invoice.company?.companyName || 'Rashi Diamonds'}</p>
            <p>{invoice.company?.address || 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat'}</p>
            <p>Phone: {invoice.company?.phone || '9879225849'}</p>
            <p>Email: {invoice.company?.email || 'hirenpatel29111997@gmail.com'}</p>
            <p>GST: {invoice.company?.gstNumber || '27ABCDE1234F1Z5'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-700 mb-2">To:</h3>
          <div className="text-sm">
            <p className="font-medium">{invoice.clientName || 'N/A'}</p>
            <p>{invoice.clientDetails?.company || 'N/A'}</p>
            <p>Contact: {invoice.clientDetails?.contactPerson || 'N/A'}</p>
            <p>Phone: {invoice.clientDetails?.phone || 'N/A'}</p>
            <p>Email: {invoice.clientDetails?.email || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Invoice Details */}
      <div className="px-4 py-2 bg-gray-50 grid grid-cols-4 gap-4 print:bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">Issue Date</p>
          <p className="font-medium">{formatDate(invoice.date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="font-medium">{formatDate(invoice.dueDate)}</p>
        </div>
        {invoice.status === 'paid' && invoice.paymentDate && (
          <div>
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="font-medium">{formatDate(invoice.paymentDate)}</p>
          </div>
        )}
        {invoice.status === 'paid' && invoice.paymentMethod && (
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-medium">
              {PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.label || 'Other Method'}
            </p>
          </div>
        )}
      </div>
      
      {/* Diamond Entries Table */}
      <div className="px-4 py-4">
        <h3 className="font-bold text-gray-700 mb-3">Diamond Details:</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-800 text-white print:bg-indigo-800 print:text-white">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">DIAMOND ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">KAPAN ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">CATEGORY</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">COUNT</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">WEIGHT</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">RATE</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.entries.map((entry, index) => (
                <tr key={entry.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-center">{index + 1}</td>
                  <td className="px-3 py-2 text-sm font-medium">{entry.id || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm">{entry.kapanId || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (entry.category === '4P Plus' || entry.category === '4p Plus')
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-right">
                    {entry.numberOfDiamonds ?? 0}
                  </td>
                  <td className="px-3 py-2 text-sm text-right">
                    {entry.weight !== undefined ? entry.weight.toFixed(2) : '0.00'} ct
                  </td>
                  <td className="px-3 py-2 text-sm text-right">
                    ₹{entry.rate?.toLocaleString('en-IN') || 0}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-right">
                    ₹{(entry.totalValue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Summary */}
      <div className="px-4 py-3 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3">
            <h3 className="font-bold text-gray-700 mb-2">Bank Details:</h3>
            <p className="text-sm">Bank Name: {invoice.company?.bankName || 'HDFC Bank'}</p>
            <p className="text-sm">Account No: {invoice.company?.accountNumber || '12341234123'}</p>
            <p className="text-sm">IFSC Code: {invoice.company?.ifscCode || 'HDFC0001234'}</p>
            <p className="text-sm">Branch: {invoice.company?.branch || 'Main Branch'}</p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Payment Terms:</h3>
            <p className="text-sm text-gray-600">{invoice.clientDetails?.paymentTerms || 'Net 30'}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end justify-end">
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 w-full max-w-xs print:bg-gray-50 print:border-gray-200">
            <div className="space-y-1">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">4P Plus Subtotal:</span>
                <span className="font-medium">{formatCurrency(fourPPlusTotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">4P Minus Subtotal:</span>
                <span className="font-medium">{formatCurrency(fourPMinusTotal)}</span>
              </div>
              <div className="h-px bg-gray-300 my-1"></div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-gray-800">Grand Total:</span>
                <span className="font-bold text-gray-800">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Thank you for your business!
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-3 px-4 bg-indigo-800 text-white text-xs text-center mt-1 print:bg-indigo-800 print:text-white">
        <p>{invoice.company?.companyName || 'Rashi Diamonds'} • {invoice.company?.address || 'Surat'} • {invoice.company?.email || 'contact@example.com'} • {invoice.company?.phone || '9879225849'}</p>
      </div>
    </div>
  );
};

export default PrintableInvoice;