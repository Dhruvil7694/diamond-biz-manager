import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, FormProvider } from 'react-hook-form';
import { useData, Client } from '@/contexts/DataContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useViewport } from '@/contexts/ViewportContext';
import { cn } from '@/lib/utils';
import { 
  Save, 
  Trash2, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  DollarSign, 
  CalendarClock, 
  StickyNote, 
  X, 
  PlusCircle, 
  Loader2,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditClientDialogProps {
  client?: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClientFormData {
  name: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  rates: {
    fourPPlus: number;
    fourPMinus: number;
  };
  paymentTerms: string;
  notes: string;
}

const EditClientDialog = ({ client, open, onOpenChange }: EditClientDialogProps) => {
  const methods = useForm<ClientFormData>({
    defaultValues: client ? {
      name: client.name,
      company: client.company,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      rates: {
        fourPPlus: client.rates.fourPPlus,
        fourPMinus: client.rates.fourPMinus
      },
      paymentTerms: client.paymentTerms,
      notes: client.notes
    } : {
      name: '',
      company: '',
      contactPerson: '',
      email: '',
      phone: '',
      rates: {
        fourPPlus: 0,
        fourPMinus: 0
      },
      paymentTerms: 'Net 30',
      notes: ''
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset, watch } = methods;
  const { updateClient, deleteClient, addClient } = useData();
  const { isMobile } = useViewport();
  
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Watch values for live preview
  const watchName = watch('name');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');
  const watchRateFourPPlus = watch('rates.fourPPlus');
  const watchRateFourPMinus = watch('rates.fourPMinus');
  const watchPaymentTerms = watch('paymentTerms');

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        company: client.company,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        rates: {
          fourPPlus: client.rates.fourPPlus,
          fourPMinus: client.rates.fourPMinus
        },
        paymentTerms: client.paymentTerms,
        notes: client.notes
      });
    } else {
      reset({
        name: '',
        company: '',
        contactPerson: '',
        email: '',
        phone: '',
        rates: {
          fourPPlus: 0,
          fourPMinus: 0
        },
        paymentTerms: 'Net 30',
        notes: ''
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client) {
        await updateClient({
          ...client,
          ...data,
          rates: {
            fourPPlus: parseFloat(data.rates.fourPPlus.toString()),
            fourPMinus: parseFloat(data.rates.fourPMinus.toString())
          }
        });
        toast.success('Client updated successfully');
      } else {
        await addClient({
          ...data,
          rates: {
            fourPPlus: parseFloat(data.rates.fourPPlus.toString()),
            fourPMinus: parseFloat(data.rates.fourPMinus.toString())
          }
        });
        toast.success('Client added successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async () => {
    if (client) {
      try {
        await deleteClient(client.id);
        toast.success('Client deleted successfully');
        setShowDeleteAlert(false);
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return phone;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "sm:max-w-[500px] md:max-w-[600px] p-0 overflow-hidden",
          isMobile && "w-[calc(100vw-32px)] h-[calc(100vh-100px)] max-h-none"
        )}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-indigo-600" />
                  {client ? 'Edit Client' : 'Add Client'}
                </DialogTitle>
                <DialogDescription>
                  {client ? 'Update the details of this client' : 'Enter information for the new client'}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="basic" className="text-sm">
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="text-sm">
                      Rates & Terms
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className={cn(
                  "px-6 overflow-y-auto",
                  isMobile ? "max-h-[calc(100vh-240px)]" : "max-h-[400px]"
                )}>
                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="mt-0 space-y-4 p-1">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Client Preview Card */}
                      {(watchName || client) && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="overflow-hidden border border-indigo-100 bg-indigo-50/50">
                              <CardContent className="p-3">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 bg-indigo-600 text-white h-10 w-10 rounded-full flex items-center justify-center">
                                    {watchName ? watchName.charAt(0).toUpperCase() : 'C'}
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium text-sm">{watchName || 'Client Name'}</p>
                                    <div className="flex gap-2 text-xs text-gray-600">
                                      {watchEmail && <span className="flex items-center"><Mail className="h-3 w-3 mr-1" />{watchEmail}</span>}
                                      {watchPhone && <span className="flex items-center"><Phone className="h-3 w-3 mr-1" />{formatPhoneNumber(watchPhone)}</span>}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </AnimatePresence>
                      )}
                      
                      {/* Name field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center">
                          <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Client Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter client name"
                          {...register('name', { 
                            required: 'Name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' }
                          })}
                          className={cn(
                            errors.name ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      
                      {/* Company field */}
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Company *
                        </Label>
                        <Input
                          id="company"
                          placeholder="Enter company name"
                          {...register('company', { 
                            required: 'Company is required' 
                          })}
                          className={cn(
                            errors.company ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.company && (
                          <p className="text-sm text-red-500">{errors.company.message}</p>
                        )}
                      </div>
                      
                      {/* Contact Person field */}
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-sm font-medium flex items-center">
                          <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Contact Person *
                        </Label>
                        <Input
                          id="contactPerson"
                          placeholder="Enter contact person name"
                          {...register('contactPerson', { 
                            required: 'Contact person is required' 
                          })}
                          className={cn(
                            errors.contactPerson ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.contactPerson && (
                          <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
                        )}
                      </div>
                      
                      {/* Email field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Please enter a valid email'
                            }
                          })}
                          className={cn(
                            errors.email ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                      </div>
                      
                      {/* Phone field */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Phone *
                        </Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          {...register('phone', { 
                            required: 'Phone is required',
                            pattern: {
                              value: /^[0-9+\- ]{10,15}$/,
                              message: 'Please enter a valid phone number'
                            }
                          })}
                          className={cn(
                            errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Rates & Terms Tab */}
                  <TabsContent value="financial" className="mt-0 space-y-4 p-1">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Rates Summary Card */}
                      {(watchRateFourPPlus > 0 || watchRateFourPMinus > 0) && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="bg-indigo-600 text-white p-3">
                                  <h3 className="text-sm font-medium flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Rate Summary
                                  </h3>
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                                  <div className="bg-indigo-50 p-2 rounded-md">
                                    <p className="text-gray-600">4P Plus Rate:</p>
                                    <p className="font-medium text-sm">₹{Number(watchRateFourPPlus).toLocaleString('en-IN')}/ct</p>
                                  </div>
                                  <div className="bg-blue-50 p-2 rounded-md">
                                    <p className="text-gray-600">4P Minus Rate:</p>
                                    <p className="font-medium text-sm">₹{Number(watchRateFourPMinus).toLocaleString('en-IN')}/pc</p>
                                  </div>
                                  {watchPaymentTerms && (
                                    <div className="col-span-2 p-2 bg-gray-50 rounded-md flex items-center">
                                      <CalendarClock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span>{watchPaymentTerms}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </AnimatePresence>
                      )}
                      
                      {/* 4P Plus Rate field */}
                      <div className="space-y-2">
                        <Label htmlFor="fourPPlus" className="text-sm font-medium flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          4P Plus Rate (₹ per carat) *
                        </Label>
                        <div className="relative">
                          <Input
                            id="fourPPlus"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('rates.fourPPlus', {
                              required: '4P Plus rate is required',
                              min: { value: 0, message: 'Rate must be positive' },
                              valueAsNumber: true
                            })}
                            className={cn(
                              "pl-7",
                              errors.rates?.fourPPlus ? 'border-red-500 focus:ring-red-500' : ''
                            )}
                          />
                          <div className="absolute left-3 top-2.5 text-gray-500">₹</div>
                        </div>
                        {errors.rates?.fourPPlus && (
                          <p className="text-sm text-red-500">{errors.rates.fourPPlus.message}</p>
                        )}
                        <p className="text-xs text-gray-500">Rate charged per carat for 4P Plus diamonds</p>
                      </div>
                      
                      {/* 4P Minus Rate field */}
                      <div className="space-y-2">
                        <Label htmlFor="fourPMinus" className="text-sm font-medium flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          4P Minus Rate (₹ per piece) *
                        </Label>
                        <div className="relative">
                          <Input
                            id="fourPMinus"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('rates.fourPMinus', {
                              required: '4P Minus rate is required',
                              min: { value: 0, message: 'Rate must be positive' },
                              valueAsNumber: true
                            })}
                            className={cn(
                              "pl-7",
                              errors.rates?.fourPMinus ? 'border-red-500 focus:ring-red-500' : ''
                            )}
                          />
                          <div className="absolute left-3 top-2.5 text-gray-500">₹</div>
                        </div>
                        {errors.rates?.fourPMinus && (
                          <p className="text-sm text-red-500">{errors.rates.fourPMinus.message}</p>
                        )}
                        <p className="text-xs text-gray-500">Rate charged per piece for 4P Minus diamonds</p>
                      </div>
                      
                      {/* Payment Terms field */}
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms" className="text-sm font-medium flex items-center">
                          <CalendarClock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Payment Terms *
                        </Label>
                        <Input
                          id="paymentTerms"
                          placeholder="e.g., Net 30, COD"
                          {...register('paymentTerms', { required: 'Payment terms are required' })}
                          className={cn(
                            errors.paymentTerms ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.paymentTerms && (
                          <p className="text-sm text-red-500">{errors.paymentTerms.message}</p>
                        )}
                        <p className="text-xs text-gray-500">Standard payment terms for this client</p>
                      </div>
                      
                      {/* Notes field */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium flex items-center">
                          <StickyNote className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          Notes
                        </Label>
                        <textarea
                          id="notes"
                          placeholder="Additional notes about the client..."
                          {...register('notes')}
                          className={cn(
                            "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            errors.notes ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.notes && (
                          <p className="text-sm text-red-500">{errors.notes.message}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
                
                <DialogFooter className="px-6 py-4 flex-shrink-0 border-t mt-4">
                  <div className="flex w-full justify-between items-center">
                    {client ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteAlert(true)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button 
                              type="submit" 
                              disabled={isSubmitting || (!isDirty && !!client)} 
                              className="flex items-center"
                              size="sm"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : client ? (
                                <Save className="h-4 w-4 mr-1" />
                              ) : (
                                <PlusCircle className="h-4 w-4 mr-1" />
                              )}
                              {client ? 'Update' : 'Add'}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!isDirty && client ? 'No changes to save' : client ? 'Save changes' : 'Add new client'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </DialogFooter>
              </Tabs>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete 
              <span className="font-medium"> {client?.name}</span> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditClientDialog;