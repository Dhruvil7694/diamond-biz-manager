// src/types/invoice.ts — legacy UI invoice shape (prefer DataContext types for app code)

export type StatusType = 'paid' | 'unpaid' | 'overdue' | 'partial';

export interface InvoiceLineItem {
  id: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  amount: number;
  status: StatusType;
  paymentDate?: string;
  entries: InvoiceLineItem[];
}
