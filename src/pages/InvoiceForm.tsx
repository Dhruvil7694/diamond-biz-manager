import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useViewport } from '@/contexts/ViewportContext';
import { Checkbox } from '@/components/ui/checkbox';

interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  diamonds: string[];
  notes: string;
}

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, diamonds, invoices, addInvoice, updateInvoice, deleteInvoice } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile, isTablet } = useViewport();

  const currentInvoice = id ? invoices.find(inv => inv.id === id) : undefined;
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm<InvoiceFormData>({
    defaultValues: currentInvoice ? {
      clientId: currentInvoice.clientId,
      issueDate: currentInvoice.issueDate.substring(0, 10), // Format as YYYY-MM-DD
      dueDate: currentInvoice.dueDate.substring(0, 10), // Format as YYYY-MM-DD
      diamonds: currentInvoice.diamonds || [],
      notes: currentInvoice.notes || '',
    } : {
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
      diamonds: [],
      notes: '',
    }
  });

  // Reset form when invoice changes
  useEffect(() => {
    if (currentInvoice) {
      reset({
        clientId: currentInvoice.clientId,
        issueDate: currentInvoice.issueDate.substring(0, 10),
        dueDate: currentInvoice.dueDate.substring(0, 10),
        diamonds: currentInvoice.diamonds || [],
        notes: currentInvoice.notes || '',
      });
      setSelectedClientId(currentInvoice.clientId);
    }
  }, [currentInvoice, reset]);

  // Watch for form values changes
  const watchClientId = watch('clientId');
  const watchDiamonds = watch('diamonds');
  
  // Set selected client ID when it changes in the form
  useEffect(() => {
    if (watchClientId && watchClientId !== selectedClientId) {
      setSelectedClientId(watchClientId);
      // Clear selected diamonds when client changes
      setValue('diamonds', []);
    }
  }, [watchClientId, selectedClientId, setValue]);

  // Filter diamonds based on selected client
  const clientDiamonds = React.useMemo(() => 
    diamonds.filter(d => d.clientId === selectedClientId),
    [diamonds, selectedClientId]
  );

  // Calculate totals based on selected diamonds
  const totals = React.useMemo(() => {
    const selected = watchDiamonds?.length 
      ? diamonds.filter(d => watchDiamonds.includes(d.id))
      : [];
    
    return {
      pieces: selected.reduce((sum, d) => sum + d.numberOfDiamonds, 0),
      weight: selected.reduce((sum, d) => sum + d.weightInKarats, 0),
      value: selected.reduce((sum, d) => sum + d.totalValue, 0),
    };
  }, [diamonds, watchDiamonds]);

  // Toggle a diamond selection
  const toggleDiamond = (diamondId: string, isChecked: boolean) => {
    const currentValues = watchDiamonds || [];
    
    if (isChecked) {
      // Add diamond to selection
      setValue('diamonds', [...currentValues, diamondId]);
    } else {
      // Remove diamond from selection
      setValue('diamonds', currentValues.filter(id => id !== diamondId));
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      console.log("Form submission with data:", data);
      
      if (!data.diamonds || data.diamonds.length === 0) {
        toast.warning("Please select at least one diamond");
        return;
      }

      setIsSubmitting(true);
      
      if (currentInvoice) {
        // For updating existing invoice
        await updateInvoice({
          ...currentInvoice,
          clientId: data.clientId,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          diamonds: data.diamonds,
          notes: data.notes,
          totalAmount: totals.value,
        });
        toast.success("Invoice updated successfully");
      } else {
        // For creating new invoice
        await addInvoice({
          clientId: data.clientId,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          diamonds: data.diamonds,
          notes: data.notes,
          totalAmount: totals.value,
          status: 'pending',
        });
        toast.success("Invoice created successfully");
      }
      navigate('/invoices');
    } catch (error: any) {
      console.error("Error submitting invoice:", error);
      toast.error(error.message || "Failed to save invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (currentInvoice && window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(currentInvoice.id);
        navigate('/invoices');
      } catch (error) {
        // Error is handled by the DataContext
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-diamond-900">
            {id ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create or edit an invoice</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')}
          className="w-full sm:w-auto justify-center text-sm sm:text-base"
        >
          <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Back to Invoices
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Invoice Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter the basic invoice information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="clientId" className="text-xs sm:text-sm">Client</Label>
                  <Controller
                    name="clientId"
                    control={control}
                    rules={{ required: 'Client is required' }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger 
                          className={`h-8 sm:h-10 text-xs sm:text-sm ${errors.clientId ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id} className="text-xs sm:text-sm">
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.clientId && (
                    <p className="text-xs text-red-500">{errors.clientId.message}</p>
                  )}
                </div>

                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="issueDate" className="text-xs sm:text-sm">Invoice Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    {...register('issueDate', { required: 'Invoice date is required' })}
                    className={`h-8 sm:h-10 text-xs sm:text-sm ${errors.issueDate ? 'border-red-500' : ''}`}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-red-500">{errors.issueDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="grid gap-1 sm:gap-2">
                  <Label htmlFor="dueDate" className="text-xs sm:text-sm">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    className={`h-8 sm:h-10 text-xs sm:text-sm ${errors.dueDate ? 'border-red-500' : ''}`}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-red-500">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Diamonds</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Select diamonds to include in this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid gap-3 sm:gap-4">
                <div className="border rounded-lg p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-medium mb-3">Available Diamonds:</h4>
                  
                  {!selectedClientId && (
                    <p className="text-xs sm:text-sm text-center text-muted-foreground p-3">
                      Please select a client first
                    </p>
                  )}
                  
                  {selectedClientId && clientDiamonds.length === 0 && (
                    <p className="text-xs sm:text-sm text-center text-muted-foreground p-3">
                      No diamonds available for this client
                    </p>
                  )}
                  
                  {selectedClientId && clientDiamonds.length > 0 && (
                    <div className="max-h-60 overflow-y-auto">
                      {clientDiamonds.map(diamond => (
                        <div 
                          key={diamond.id} 
                          className="flex items-center space-x-2 py-2 border-b last:border-0"
                        >
                          <Checkbox
                            id={`diamond-${diamond.id}`}
                            checked={watchDiamonds?.includes(diamond.id) || false}
                            onCheckedChange={(checked) => toggleDiamond(diamond.id, !!checked)}
                          />
                          <Label
                            htmlFor={`diamond-${diamond.id}`}
                            className="flex-1 cursor-pointer text-xs sm:text-sm"
                          >
                            <div className="flex justify-between">
                              <span>
                                {diamond.kapanId} - {diamond.category} ({diamond.numberOfDiamonds} pcs, {diamond.weightInKarats.toFixed(2)} karats)
                              </span>
                              <span className="font-medium">
                                ₹{diamond.totalValue.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {watchDiamonds?.length > 0 && (
                  <div className="mt-2 sm:mt-4">
                    <h4 className="text-xs sm:text-sm font-medium mb-2">Selected Diamonds:</h4>
                    <div className="space-y-2">
                      {diamonds
                        .filter(d => watchDiamonds.includes(d.id))
                        .map(diamond => (
                          <div
                            key={diamond.id}
                            className="p-2 border rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs sm:text-sm font-medium">
                                {diamond.kapanId} - {diamond.numberOfDiamonds} pieces - {diamond.weightInKarats.toFixed(2)} karats
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Category: {diamond.category}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <p className="text-xs sm:text-sm font-medium mr-2">
                                ₹{diamond.totalValue.toLocaleString('en-IN')}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => toggleDiamond(diamond.id, false)}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* <Separator className="my-3 sm:my-4" /> */}

                <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-card border border-border shadow-sm p-3 sm:p-4 rounded-lg">
                  <div className="bg-primary/5 hover:bg-primary/10 transition-colors p-2 sm:p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Total Pieces</p>
                    <p className="text-sm sm:text-lg font-semibold text-foreground">{totals.pieces}</p>
                  </div>
                  <div className="bg-primary/5 hover:bg-primary/10 transition-colors p-2 sm:p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Total Weight</p>
                    <p className="text-sm sm:text-lg font-semibold text-foreground">{totals.weight.toFixed(2)} <span className="text-xs font-normal">ct</span></p>
                  </div>
                  <div className="bg-primary/5 hover:bg-primary/10 transition-colors p-2 sm:p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                    <p className="text-sm sm:text-lg font-semibold text-foreground">₹{totals.value.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg">Additional Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Add any notes or additional details
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid gap-1 sm:gap-2">
                <Label htmlFor="notes" className="text-xs sm:text-sm">Notes</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="min-h-[80px] sm:min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            {id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="text-xs sm:text-sm h-8 sm:h-10 order-last sm:order-first"
              >
                <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Delete Invoice
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="text-xs sm:text-sm h-8 sm:h-10"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;