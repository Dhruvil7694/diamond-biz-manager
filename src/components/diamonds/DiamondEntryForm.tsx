
import React, { useState } from 'react';
import { useData, Client } from '@/contexts/DataContext';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

const DiamondEntryForm = () => {
  const { clients, marketRates, addDiamond } = useData();
  
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [clientId, setClientId] = useState<string>('');
  const [kapanId, setKapanId] = useState<string>('');
  const [numberOfDiamonds, setNumberOfDiamonds] = useState<number>(0);
  const [weightInKarats, setWeightInKarats] = useState<number>(0);
  const [rawDamageWeight, setRawDamageWeight] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Get current market rate
  const currentMarketRate = marketRates[0];
  
  // Calculate estimates
  const selectedClient = clients.find(c => c.id === clientId);
  const weightPerDiamond = numberOfDiamonds > 0 ? weightInKarats / numberOfDiamonds : 0;
  const category = weightPerDiamond > 0.15 ? '4P Plus' : '4P Minus';
  const estimatedValue = calculateEstimatedValue(category, selectedClient, numberOfDiamonds, weightInKarats, rawDamageWeight);
  
  function calculateEstimatedValue(
    category: '4P Plus' | '4P Minus',
    client: Client | undefined,
    numberOfDiamonds: number,
    weightInKarats: number,
    rawDamageWeight: number | undefined
  ): number {
    if (!client) return 0;
    
    const adjustedWeight = rawDamageWeight ? weightInKarats - rawDamageWeight : weightInKarats;
    
    if (category === '4P Plus') {
      return adjustedWeight * client.rates.fourPPlus;
    } else {
      return numberOfDiamonds * client.rates.fourPMinus;
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !kapanId || numberOfDiamonds <= 0 || weightInKarats <= 0) {
      toast.error("Please fill all required fields with valid values");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      addDiamond({
        entryDate: entryDate.toISOString(),
        clientId,
        kapanId,
        numberOfDiamonds,
        weightInKarats,
        marketRate: currentMarketRate.fourPPlusRate,
        rawDamageWeight: rawDamageWeight || undefined,
      });
      
      toast.success("Diamond entry added successfully");
      
      // Reset form
      setKapanId('');
      setNumberOfDiamonds(0);
      setWeightInKarats(0);
      setRawDamageWeight(undefined);
      
    } catch (error) {
      toast.error("Failed to add diamond entry");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Diamond Entry</CardTitle>
        <CardDescription>
          Add a new diamond entry to your inventory
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Entry */}
            <div className="space-y-2">
              <Label htmlFor="entry-date">Date of Entry</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => date && setEntryDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select 
                value={clientId} 
                onValueChange={setClientId}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Kapan ID */}
          <div className="space-y-2">
            <Label htmlFor="kapan-id">Kapan ID/Name</Label>
            <Input
              id="kapan-id"
              placeholder="e.g. 203A"
              value={kapanId}
              onChange={(e) => setKapanId(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number of Diamonds */}
            <div className="space-y-2">
              <Label htmlFor="diamond-count">Number of Diamonds</Label>
              <Input
                id="diamond-count"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 50"
                value={numberOfDiamonds || ''}
                onChange={(e) => setNumberOfDiamonds(parseInt(e.target.value) || 0)}
              />
            </div>
            
            {/* Weight in Karats */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight in Karats</Label>
              <Input
                id="weight"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 10.5"
                value={weightInKarats || ''}
                onChange={(e) => setWeightInKarats(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          {/* Raw/Damaged Weight */}
          <div className="space-y-2">
            <Label htmlFor="raw-damage-weight">
              Raw/Damaged Weight (Optional)
            </Label>
            <Input
              id="raw-damage-weight"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 0.5"
              value={rawDamageWeight || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setRawDamageWeight(isNaN(value) ? undefined : value);
              }}
            />
          </div>
          
          {/* Calculation Preview */}
          {clientId && numberOfDiamonds > 0 && weightInKarats > 0 && (
            <div className="p-4 bg-diamond-50 rounded-md border border-diamond-100">
              <h4 className="font-medium text-diamond-800 mb-2">Calculation Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Weight per diamond:</div>
                <div className="font-medium">{weightPerDiamond.toFixed(3)} karats</div>
                
                <div>Category:</div>
                <div className="font-medium">{category}</div>
                
                {category === '4P Plus' ? (
                  <>
                    <div>Rate (per karat):</div>
                    <div className="font-medium">
                      ${selectedClient?.rates.fourPPlus.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <div>Rate (per piece):</div>
                    <div className="font-medium">
                      ${selectedClient?.rates.fourPMinus.toLocaleString()}
                    </div>
                  </>
                )}
                
                <div>Estimated Value:</div>
                <div className="font-medium">${estimatedValue.toLocaleString()}</div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Diamond Entry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DiamondEntryForm;
