import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { toast } from 'sonner';

interface MarketRateFormData {
  fourPPlusRate: number;
  fourPMinusRate: number;
  date: string;
}

const MarketRateForm = () => {
  const { updateMarketRate, marketRates } = useData();
  const [submitting, setSubmitting] = useState(false);

  // Set default values with today's date and last known rates
  const today = new Date().toISOString().split('T')[0];
  const latestRates = marketRates[0] || { fourPPlusRate: 0, fourPMinusRate: 0 };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MarketRateFormData>({
    defaultValues: {
      fourPPlusRate: latestRates.fourPPlusRate,
      fourPMinusRate: latestRates.fourPMinusRate,
      date: today
    }
  });

  const onSubmit = async (data: MarketRateFormData) => {
    setSubmitting(true);
    try {
      await updateMarketRate({
        date: data.date,
        fourPPlusRate: parseFloat(data.fourPPlusRate.toString()),
        fourPMinusRate: parseFloat(data.fourPMinusRate.toString())
      });

      toast('Market rates updated successfully');
      
      // Reset the form with new default values
      reset({
        fourPPlusRate: parseFloat(data.fourPPlusRate.toString()),
        fourPMinusRate: parseFloat(data.fourPMinusRate.toString()),
        date: today
      });
    } catch (error) {
      toast('Failed to update market rates');
      console.error('Error updating market rates:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Update Market Rates</CardTitle>
        <CardDescription>
          Enter today's 4P diamond market rates to keep your dashboard accurate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fourPPlusRate">4P Plus Rate (₹/karat)</Label>
              <Input
                id="fourPPlusRate"
                type="number"
                step="0.01"
                {...register('fourPPlusRate', {
                  required: '4P Plus Rate is required',
                  min: { value: 0, message: 'Rate must be positive' }
                })}
                className={errors.fourPPlusRate ? 'border-red-500' : ''}
              />
              {errors.fourPPlusRate && (
                <p className="text-xs text-red-500">{errors.fourPPlusRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fourPMinusRate">4P Minus Rate (₹/karat)</Label>
              <Input
                id="fourPMinusRate"
                type="number"
                step="0.01"
                {...register('fourPMinusRate', {
                  required: '4P Minus Rate is required',
                  min: { value: 0, message: 'Rate must be positive' }
                })}
                className={errors.fourPMinusRate ? 'border-red-500' : ''}
              />
              {errors.fourPMinusRate && (
                <p className="text-xs text-red-500">{errors.fourPMinusRate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Market Rates'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MarketRateForm;