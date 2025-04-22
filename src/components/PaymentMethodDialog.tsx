import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  BanknoteIcon,
  Building2,
  ScanLine,
  FileCheck,
  Wallet,
} from 'lucide-react';

// Define payment method options
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: BanknoteIcon },
  { id: 'cheque', label: 'Cheque', icon: FileCheck },
  { id: 'upi', label: 'UPI', icon: ScanLine },
  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
  { id: 'card', label: 'Card Payment', icon: CreditCard },
  { id: 'other', label: 'Other', icon: Wallet },
];

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: string) => void;
  initialPaymentMethod?: string;
}

const PaymentMethodDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialPaymentMethod = '',
}: PaymentMethodDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState(initialPaymentMethod);

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription>
            Select the payment method used for this invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedMethod}
            onValueChange={setSelectedMethod}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Payment Methods</SelectLabel>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMethod}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDialog;