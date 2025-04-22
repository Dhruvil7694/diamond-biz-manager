import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useData, Diamond, Client } from '@/contexts/DataContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Trash2, Calculator, Diamond as DiamondIcon, PlusCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { useViewport } from '@/contexts/ViewportContext';

interface EditDiamondDialogProps {
  diamond?: Diamond;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiamondFormData {
  clientId: string;
  category: '4P Plus' | '4P Minus';
  numberOfDiamonds: number;
  weightInKarats: number;
  totalValue: number;
  kapanId: string;
  marketRate: number;
  rawDamageWeight?: number;
}

const EditDiamondDialog = ({ diamond, open, onOpenChange }: EditDiamondDialogProps) => {
  const methods = useForm<DiamondFormData>({
    defaultValues: diamond ? {
      clientId: diamond.clientId,
      category: diamond.category,
      numberOfDiamonds: diamond.numberOfDiamonds,
      weightInKarats: diamond.weightInKarats,
      totalValue: diamond.totalValue,
      kapanId: diamond.kapanId,
      marketRate: diamond.marketRate,
      rawDamageWeight: diamond.rawDamageWeight,
    } : {
      clientId: '',
      category: '4P Plus',
      numberOfDiamonds: 0,
      weightInKarats: 0,
      totalValue: 0,
      kapanId: '',
      marketRate: 0,
      rawDamageWeight: 0,
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isDirty }, reset, watch, setValue } = methods;
  const { clients, updateDiamond, deleteDiamond, addDiamond } = useData();
  const { isMobile } = useViewport();
  
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  // Watch form values for calculations
  const watchClientId = watch('clientId');
  const watchCategory = watch('category');
  const watchNumberOfDiamonds = watch('numberOfDiamonds');
  const watchWeightInKarats = watch('weightInKarats');
  const watchRawDamageWeight = watch('rawDamageWeight');

  // Reset form when diamond changes
  useEffect(() => {
    if (diamond) {
      reset({
        clientId: diamond.clientId,
        category: diamond.category,
        numberOfDiamonds: diamond.numberOfDiamonds,
        weightInKarats: diamond.weightInKarats,
        totalValue: diamond.totalValue,
        kapanId: diamond.kapanId,
        marketRate: diamond.marketRate,
        rawDamageWeight: diamond.rawDamageWeight,
      });
    } else {
      reset({
        clientId: '',
        category: '4P Plus',
        numberOfDiamonds: 0,
        weightInKarats: 0,
        totalValue: 0,
        kapanId: '',
        marketRate: 0,
        rawDamageWeight: 0,
      });
    }
  }, [diamond, reset]);

  // Update selected client when client ID changes
  useEffect(() => {
    if (watchClientId) {
      const client = clients.find(c => c.id === watchClientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [watchClientId, clients]);

  // Auto-calculate diamond value when relevant fields change
  useEffect(() => {
    if (selectedClient && watchNumberOfDiamonds > 0 && watchWeightInKarats > 0) {
      calculateValue();
    }
  }, [watchClientId, watchCategory, watchNumberOfDiamonds, watchWeightInKarats, watchRawDamageWeight, selectedClient]);

  const calculateValue = () => {
    if (!selectedClient || watchNumberOfDiamonds <= 0 || watchWeightInKarats <= 0) return;

    setIsCalculating(true);
    
    try {
      // Adjust weight if there's damage
      const adjustedWeight = watchRawDamageWeight ? 
        watchWeightInKarats - (watchRawDamageWeight || 0) : 
        watchWeightInKarats;
      
      // Calculate based on category
      let calculatedValue = 0;
      
      if (watchCategory === '4P Plus') {
        calculatedValue = adjustedWeight * selectedClient.rates.fourPPlus;
      } else {
        calculatedValue = watchNumberOfDiamonds * selectedClient.rates.fourPMinus;
      }
      
      setCalculatedValue(calculatedValue);
      setValue('totalValue', calculatedValue);
    } finally {
      setTimeout(() => {
        setIsCalculating(false);
      }, 600); // Add a slight delay to show the calculation animation
    }
  };

  const onSubmit = async (data: DiamondFormData) => {
    try {
      if (diamond) {
        await updateDiamond({
          ...diamond,
          ...data,
          numberOfDiamonds: parseInt(data.numberOfDiamonds.toString()),
          weightInKarats: parseFloat(data.weightInKarats.toString()),
          totalValue: parseFloat(data.totalValue.toString()),
          marketRate: parseFloat(data.marketRate.toString()),
          rawDamageWeight: data.rawDamageWeight ? parseFloat(data.rawDamageWeight.toString()) : undefined,
        });
        toast.success('Diamond updated successfully');
      } else {
        await addDiamond({
          ...data,
          entryDate: new Date().toISOString(),
          numberOfDiamonds: parseInt(data.numberOfDiamonds.toString()),
          weightInKarats: parseFloat(data.weightInKarats.toString()),
          marketRate: parseFloat(data.marketRate.toString()),
          rawDamageWeight: data.rawDamageWeight ? parseFloat(data.rawDamageWeight.toString()) : undefined,
        });
        toast.success('Diamond added successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save diamond');
    }
  };

  const handleDelete = async () => {
    if (diamond) {
      try {
        await deleteDiamond(diamond.id);
        toast.success('Diamond deleted successfully');
        setShowDeleteAlert(false);
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to delete diamond');
      }
    }
  };

  // Helper function to determine category based on weight per piece
  const getCategoryHint = () => {
    if (!watchNumberOfDiamonds || !watchWeightInKarats) return null;
    
    const weightPerDiamond = watchWeightInKarats / watchNumberOfDiamonds;
    const suggestedCategory = weightPerDiamond > 0.15 ? '4P Plus' : '4P Minus';
    
    if (watchCategory !== suggestedCategory) {
      return (
        <div className="mt-1 text-xs">
          <p className="text-amber-600">
            Based on weight per piece ({weightPerDiamond.toFixed(3)} ct), this might be a <strong>{suggestedCategory}</strong> diamond.
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  const getValuePerDiamond = () => {
    if (!watchNumberOfDiamonds || !watchTotalValue) return 0;
    return watchTotalValue / watchNumberOfDiamonds;
  };
  
  const getValuePerCarat = () => {
    if (!watchWeightInKarats || !watchTotalValue) return 0;
    return watchTotalValue / watchWeightInKarats;
  };
  
  const watchTotalValue = watch('totalValue');

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
                  <DiamondIcon className="h-5 w-5 text-indigo-600" />
                  {diamond ? 'Edit Diamond' : 'Add Diamond'}
                </DialogTitle>
                <DialogDescription>
                  {diamond ? 'Update the details of this diamond entry' : 'Enter information for the new diamond entry'}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="details" className="text-sm">
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="text-sm">
                      Pricing & Value
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className={cn(
                  "px-6 overflow-y-auto",
                  isMobile ? "max-h-[calc(100vh-240px)]" : "max-h-[400px]"
                )}>
                  <TabsContent value="details" className="mt-0 space-y-4 p-1">
                    <div className="space-y-4">
                      {/* Client Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="clientId" className="text-sm font-medium">Client *</Label>
                        <Controller
                          name="clientId"
                          control={control}
                          rules={{ required: 'Client is required' }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn(
                                "w-full",
                                errors.clientId ? 'border-red-500 focus:ring-red-500' : ''
                              )}>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.clientId && (
                          <p className="text-sm text-red-500">{errors.clientId.message}</p>
                        )}
                        {selectedClient && (
                          <div className="p-2 bg-gray-50 rounded-md text-xs text-gray-700">
                            <p>Rates: ₹{selectedClient.rates.fourPPlus.toLocaleString('en-IN')}/ct (4P+), 
                               ₹{selectedClient.rates.fourPMinus.toLocaleString('en-IN')}/pc (4P-)</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Diamond Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                        <Controller
                          name="category"
                          control={control}
                          rules={{ required: 'Category is required' }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn(
                                "w-full",
                                errors.category ? 'border-red-500 focus:ring-red-500' : ''
                              )}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="4P Plus">4P Plus</SelectItem>
                                <SelectItem value="4P Minus">4P Minus</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.category && (
                          <p className="text-sm text-red-500">{errors.category.message}</p>
                        )}
                        {getCategoryHint()}
                      </div>
                      
                      {/* Kapan ID */}
                      <div className="space-y-2">
                        <Label htmlFor="kapanId" className="text-sm font-medium">Kapan ID *</Label>
                        <Input
                          id="kapanId"
                          type="text"
                          {...register('kapanId', {
                            required: 'Kapan ID is required',
                          })}
                          className={cn(
                            errors.kapanId ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.kapanId && (
                          <p className="text-sm text-red-500">{errors.kapanId.message}</p>
                        )}
                      </div>
                      
                      {/* Diamond Count */}
                      <div className="space-y-2">
                        <Label htmlFor="numberOfDiamonds" className="text-sm font-medium">Number of Diamonds *</Label>
                        <Input
                          id="numberOfDiamonds"
                          type="number"
                          {...register('numberOfDiamonds', {
                            required: 'Number of diamonds is required',
                            min: { value: 1, message: 'Must have at least 1 diamond' },
                            valueAsNumber: true
                          })}
                          className={cn(
                            errors.numberOfDiamonds ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.numberOfDiamonds && (
                          <p className="text-sm text-red-500">{errors.numberOfDiamonds.message}</p>
                        )}
                      </div>
                      
                      {/* Weight */}
                      <div className="space-y-2">
                        <Label htmlFor="weightInKarats" className="text-sm font-medium">Weight in Carats *</Label>
                        <Input
                          id="weightInKarats"
                          type="number"
                          step="0.001"
                          {...register('weightInKarats', {
                            required: 'Weight is required',
                            min: { value: 0.001, message: 'Weight must be positive' },
                            valueAsNumber: true
                          })}
                          className={cn(
                            errors.weightInKarats ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.weightInKarats && (
                          <p className="text-sm text-red-500">{errors.weightInKarats.message}</p>
                        )}
                        
                        {watchNumberOfDiamonds > 0 && watchWeightInKarats > 0 && (
                          <div className="p-2 bg-gray-50 rounded-md text-xs text-gray-700">
                            <p>Average weight per diamond: <strong>{(watchWeightInKarats / watchNumberOfDiamonds).toFixed(3)} ct</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="mt-0 space-y-4 p-1">
                    <div className="space-y-4">
                      {/* Market Rate */}
                      <div className="space-y-2">
                        <Label htmlFor="marketRate" className="text-sm font-medium">Market Rate (₹) *</Label>
                        <Input
                          id="marketRate"
                          type="number"
                          step="0.01"
                          {...register('marketRate', {
                            required: 'Market rate is required',
                            min: { value: 0, message: 'Market rate must be positive' },
                            valueAsNumber: true
                          })}
                          className={cn(
                            errors.marketRate ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.marketRate && (
                          <p className="text-sm text-red-500">{errors.marketRate.message}</p>
                        )}
                      </div>
                      
                      {/* Damage Weight */}
                      <div className="space-y-2">
                        <Label htmlFor="rawDamageWeight" className="text-sm font-medium">
                          Raw Damage Weight (ct)
                          <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                        </Label>
                        <Input
                          id="rawDamageWeight"
                          type="number"
                          step="0.001"
                          {...register('rawDamageWeight', {
                            min: { value: 0, message: 'Damage weight must be positive' },
                            max: { 
                              value: watchWeightInKarats || 0, 
                              message: 'Damage cannot exceed total weight' 
                            },
                            valueAsNumber: true
                          })}
                          className={cn(
                            errors.rawDamageWeight ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        />
                        {errors.rawDamageWeight && (
                          <p className="text-sm text-red-500">{errors.rawDamageWeight.message}</p>
                        )}
                        
                        {watchRawDamageWeight > 0 && watchWeightInKarats > 0 && (
                          <div className="p-2 bg-gray-50 rounded-md text-xs text-gray-700">
                            <p>Effective weight after damage: <strong>{(watchWeightInKarats - watchRawDamageWeight).toFixed(3)} ct</strong></p>
                          </div>
                        )}
                      </div>
                      
                      {/* Total Value */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="totalValue" className="text-sm font-medium">Total Value (₹) *</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 text-xs"
                                  onClick={calculateValue}
                                  disabled={isCalculating || !selectedClient}
                                >
                                  {isCalculating ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Calculator className="h-3 w-3 mr-1" />
                                  )}
                                  Calculate
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Auto-calculate value based on weight, count and client rates</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="relative">
                          <Input
                            id="totalValue"
                            type="number"
                            step="0.01"
                            {...register('totalValue', {
                              required: 'Total value is required',
                              min: { value: 0, message: 'Value must be positive' },
                              valueAsNumber: true
                            })}
                            className={cn(
                              errors.totalValue ? 'border-red-500 focus:ring-red-500' : '',
                              calculatedValue !== null ? 'pr-10 border-green-500' : ''
                            )}
                          />
                          <AnimatePresence>
                            {calculatedValue !== null && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute right-2 top-2.5 text-green-600"
                              >
                                <Calculator className="h-4 w-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {errors.totalValue && (
                          <p className="text-sm text-red-500">{errors.totalValue.message}</p>
                        )}
                        
                        {watchTotalValue > 0 && (
                          <Card className="mt-2 border border-gray-200">
                            <CardContent className="p-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Value per diamond:</p>
                                  <p className="font-medium">₹{getValuePerDiamond().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Value per carat:</p>
                                  <p className="font-medium">₹{getValuePerCarat().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
                
                <DialogFooter className="px-6 py-4 flex-shrink-0 border-t mt-4">
                  <div className="flex w-full justify-between items-center">
                    {diamond ? (
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
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || (!isDirty && !!diamond)} 
                      className="flex items-center"
                      size="sm"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : diamond ? (
                        <Save className="h-4 w-4 mr-1" />
                      ) : (
                        <PlusCircle className="h-4 w-4 mr-1" />
                      )}
                      {diamond ? 'Update' : 'Add'}
                    </Button>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this diamond entry.
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

export default EditDiamondDialog;