
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ClientForm = () => {
  const { addClient } = useData();
  
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [fourPPlusRate, setFourPPlusRate] = useState<number>(5000);
  const [fourPMinusRate, setFourPMinusRate] = useState<number>(300);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contactPerson || !phone || !email || !company) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addClient({
        name,
        contactPerson,
        phone,
        email,
        company,
        rates: {
          fourPPlus: fourPPlusRate,
          fourPMinus: fourPMinusRate,
        },
        paymentTerms,
        notes,
      });
      
      toast.success('Client added successfully');
      
      // Reset form
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setCompany('');
      setFourPPlusRate(5000);
      setFourPMinusRate(300);
      setPaymentTerms('Net 30');
      setNotes('');
      
    } catch (error) {
      toast.error('Failed to add client');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Client</CardTitle>
        <CardDescription>
          Add a new client to your system
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Client Name & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                placeholder="Client Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input
                id="contact-person"
                placeholder="Contact Person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Negotiated Rates */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Negotiated Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="4p-plus-rate">4P Plus Rate (per karat)</Label>
                <Input
                  id="4p-plus-rate"
                  type="number"
                  min="1"
                  placeholder="Rate in USD"
                  value={fourPPlusRate || ''}
                  onChange={(e) => setFourPPlusRate(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="4p-minus-rate">4P Minus Rate (per piece)</Label>
                <Input
                  id="4p-minus-rate"
                  type="number"
                  min="1"
                  placeholder="Rate in USD"
                  value={fourPMinusRate || ''}
                  onChange={(e) => setFourPMinusRate(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Input
              id="payment-terms"
              placeholder="e.g. Net 30"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes/Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
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
            Add Client
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ClientForm;
