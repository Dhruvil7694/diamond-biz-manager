// src/types/invoice.ts

export type StatusType = 'paid' | 'unpaid' | 'overdue' | 'partial';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  amount: number;
  status: StatusType;
  paymentDate?: string;
  entries: any[]; // Replace 'any' with a proper diamond/line item type if available
}
