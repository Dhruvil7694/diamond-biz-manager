import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Define types for the data
export interface Diamond {
  id: string;
  entryDate: string;
  clientId: string;
  kapanId: string;
  numberOfDiamonds: number;
  weightInKarats: number;
  marketRate: number;
  category: '4P Plus' | '4P Minus';
  rawDamageWeight?: number;
  totalValue: number;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  company: string;
  rates: {
    fourPPlus: number; // Rate per karat
    fourPMinus: number; // Rate per piece
  };
  paymentTerms: string;
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientId: string;
  diamonds: string[]; // This will be used in the application but stored differently in DB
  totalAmount: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  notes?: string;
  paymentMethod?: string | null;  // Add this property
  accountHolderName?: string;
}

export interface MarketRate {
  date: string;
  fourPPlusRate: number;
  fourPMinusRate: number;
}

// Add CompanyDetails interface
export interface CompanyDetails {
  id: string;
  companyName: string;
  address: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountHolderName: string;
}

// Add CompleteInvoice interface for display purposes
export interface CompleteInvoice extends Invoice {
  client: Client;
  diamondDetails: Diamond[];
  company: CompanyDetails;
}

// Map types from Supabase to our application types
type SupabaseDiamond = Database['public']['Tables']['diamonds']['Row'];
type SupabaseClient = Database['public']['Tables']['clients']['Row'];
type SupabaseMarketRate = Database['public']['Tables']['market_rates']['Row'];
type SupabaseInvoice = Database['public']['Tables']['invoices']['Row'];
type SupabaseCompanyDetails = Database['public']['Tables']['company_details']['Row'];

interface DataContextType {
  diamonds: Diamond[];
  clients: Client[];
  marketRates: MarketRate[];
  invoices: Invoice[];
  companyDetails: CompanyDetails | null;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateDiamond: (diamond: Diamond) => Promise<void>;
  deleteDiamond: (id: string) => Promise<void>;
  addDiamond: (diamond: Omit<Diamond, 'id' | 'category' | 'totalValue'>) => Promise<void>;
  updateMarketRate: (rate: MarketRate) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  generateInvoiceNumber: () => Promise<string>;
  getCompleteInvoice: (invoiceId: string) => Promise<CompleteInvoice | null>;
  updateCompanyDetails: (details: Partial<CompanyDetails>) => Promise<void>;
  isLoading: boolean;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

// Map Supabase data to application data
const mapSupabaseDiamondToDiamond = (diamond: SupabaseDiamond): Diamond => ({
  id: diamond.id,
  entryDate: diamond.entry_date,
  clientId: diamond.client_id,
  kapanId: diamond.kapan_id,
  numberOfDiamonds: diamond.number_of_diamonds,
  weightInKarats: diamond.weight_in_karats,
  marketRate: diamond.market_rate,
  category: diamond.category as '4P Plus' | '4P Minus',
  rawDamageWeight: diamond.raw_damage_weight || undefined,
  totalValue: diamond.total_value,
});

const mapSupabaseClientToClient = (client: SupabaseClient): Client => ({
  id: client.id,
  name: client.name,
  contactPerson: client.contact_person,
  phone: client.phone,
  email: client.email,
  company: client.company,
  rates: {
    fourPPlus: client.four_p_plus_rate,
    fourPMinus: client.four_p_minus_rate,
  },
  paymentTerms: client.payment_terms,
  notes: client.notes,
});

const mapSupabaseMarketRateToMarketRate = (marketRate: SupabaseMarketRate): MarketRate => ({
  date: marketRate.date,
  fourPPlusRate: marketRate.four_p_plus_rate,
  fourPMinusRate: marketRate.four_p_minus_rate,
});

const mapSupabaseCompanyDetailsToCompanyDetails = (company: SupabaseCompanyDetails): CompanyDetails => ({
  id: company.id,
  companyName: company.company_name,
  address: company.address,
  phone: company.phone || undefined,
  email: company.email || undefined,
  gstNumber: company.gst_number || undefined,
  bankName: company.bank_name,
  accountNumber: company.account_number,
  accountHolderName: company.account_holder_name || 'Hirenbhai R Patel', // Add with fallback
  ifscCode: company.ifsc_code,
  branch: company.branch,
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { session } = useAuth();

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientsError) throw clientsError;
      
      // Fetch diamonds
      const { data: diamondsData, error: diamondsError } = await supabase
        .from('diamonds')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (diamondsError) throw diamondsError;
      
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });
      
      if (invoicesError) throw invoicesError;
      
      // Fetch market rates
      const { data: marketRatesData, error: marketRatesError } = await supabase
        .from('market_rates')
        .select('*')
        .order('date', { ascending: false });
      
      if (marketRatesError) throw marketRatesError;
      
      // Fetch invoice items to get diamond connections
      const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
        .from('invoice_items')
        .select('*');
      
      if (invoiceItemsError) throw invoiceItemsError;
      
      // Fetch company details with better error handling
      let companyData = null;
      const { data: fetchedCompanyData, error: companyError } = await supabase
        .from('company_details')
        .select('*')
        .single();
      
      // If no data exists, use default company data instead of failing
      if (companyError && companyError.code !== 'PGRST116') {
        throw companyError; // Only throw if it's not a "not found" error
      } else if (fetchedCompanyData) {
        companyData = fetchedCompanyData;
      } else {
        // Default company data when none exists
        companyData = {
          id: 'default',
          company_name: 'Rashi Diamonds',
          address: 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat',
          phone: '9879225849',
          email: 'hirenpatel29111997@gmail.com',
          gst_number: '27ABCDE1234F1Z5',
          bank_name: 'HDFC Bank', // Corrected from swapped value
          account_number: '12312312311', // Corrected from swapped value
          account_holder_name: 'Hirenbhai R Patel', // New field
          ifsc_code: 'BARB0KIMXXX',
          branch: 'Kim, Surat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
      }
      
      // Map data to application types
      setClients(clientsData ? clientsData.map(mapSupabaseClientToClient) : []);
      setDiamonds(diamondsData ? diamondsData.map(mapSupabaseDiamondToDiamond) : []);
      
      // Process invoices with diamond data from invoice_items
      if (invoicesData && invoiceItemsData) {
        const mappedInvoices = invoicesData.map(invoice => {
          // Find all invoice items for this invoice
          const items = invoiceItemsData.filter(item => item.invoice_id === invoice.id);
          // Extract diamond IDs from items
          const diamondIds = items.map(item => item.diamond_id);
          
          return {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            clientId: invoice.client_id,
            diamonds: diamondIds, // Store the diamond IDs for this invoice
            totalAmount: invoice.total_amount,
            status: invoice.status as 'pending' | 'paid',
            paymentDate: invoice.payment_date || undefined,
            notes: invoice.notes || undefined,
          };
        });
        
        setInvoices(mappedInvoices);
      } else {
        setInvoices([]);
      }
      
      setMarketRates(marketRatesData ? marketRatesData.map(mapSupabaseMarketRateToMarketRate) : []);
      setCompanyDetails(companyData ? mapSupabaseCompanyDetailsToCompanyDetails(companyData) : null);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get complete invoice details for display
  const getCompleteInvoice = async (invoiceId: string): Promise<CompleteInvoice | null> => {
    try {
      console.log(`Getting complete invoice details for ID: ${invoiceId}`);
      
      // Find the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        console.error(`Invoice with ID ${invoiceId} not found in context`);
        return null;
      }

      // Get client details
      const client = clients.find(c => c.id === invoice.clientId);
      if (!client) {
        console.error(`Client with ID ${invoice.clientId} not found for invoice ${invoiceId}`);
        return null;
      }

      // Get diamond details by directly checking the invoice_items table
      // This is more reliable than using the diamonds array in the invoice object
      const { data: invoiceItems, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
      
      if (itemsError) {
        console.error('Error fetching invoice items:', itemsError);
        throw itemsError;
      }
      
      console.log(`Found ${invoiceItems?.length || 0} invoice items for invoice ${invoiceId}:`, invoiceItems);
      
      // Get all diamond IDs from invoice items
      const diamondIds = invoiceItems?.map(item => item.diamond_id) || [];
      
      let diamondDetails = [];
      
      if (diamondIds.length > 0) {
        // First try to get diamonds from context
        const contextDiamonds = diamonds.filter(d => diamondIds.includes(d.id));
        
        if (contextDiamonds.length === diamondIds.length) {
          // All diamonds found in context
          diamondDetails = contextDiamonds;
        } else {
          // Some diamonds missing from context, fetch directly from database
          console.log("Some diamonds not found in context, fetching from database...");
          
          const { data: dbDiamonds, error: diamondsError } = await supabase
            .from('diamonds')
            .select('*')
            .in('id', diamondIds);
            
          if (diamondsError) {
            console.error('Error fetching diamonds from database:', diamondsError);
            throw diamondsError;
          }
          
          // Map database diamonds to app format
          diamondDetails = dbDiamonds?.map(d => ({
            id: d.id,
            entryDate: d.entry_date,
            clientId: d.client_id,
            kapanId: d.kapan_id,
            numberOfDiamonds: d.number_of_diamonds,
            weightInKarats: d.weight_in_karats,
            marketRate: d.market_rate,
            category: d.category,
            rawDamageWeight: d.raw_damage_weight || undefined,
            totalValue: d.total_value
          })) || [];
        }
      }
      
      console.log(`Found ${diamondDetails.length} diamond details for invoice ${invoiceId}:`, diamondDetails);

      // Return complete invoice data with diamonds
      return {
        ...invoice,
        client,
        diamondDetails,
        company: companyDetails as CompanyDetails,
      };
    } catch (error: any) {
      console.error(`Error fetching complete invoice: ${error.message}`, error);
      toast.error(`Error fetching invoice details: ${error.message}`);
      return null;
    }
  };

  // Function to update company details
  const updateCompanyDetails = async (details: Partial<CompanyDetails>) => {
    try {
      if (!companyDetails) {
        // Create new company details if none exist
        const { data, error } = await supabase
          .from('company_details')
          .insert({
            company_name: details.companyName!,
            address: details.address!,
            phone: details.phone || null,
            email: details.email || null,
            gst_number: details.gstNumber || null,
            bank_name: details.bankName!,
            account_number: details.accountNumber!,
            account_holder_name: details.accountHolderName!, // Add new field
            ifsc_code: details.ifscCode!,
            branch: details.branch!,
          })
          .select()
          .single();
  
        if (error) throw error;
      } else {
        // Update existing company details
        const { error } = await supabase
          .from('company_details')
          .update({
            company_name: details.companyName || companyDetails.companyName,
            address: details.address || companyDetails.address,
            phone: details.phone || companyDetails.phone,
            email: details.email || companyDetails.email,
            gst_number: details.gstNumber || companyDetails.gstNumber,
            bank_name: details.bankName || companyDetails.bankName,
            account_number: details.accountNumber || companyDetails.accountNumber,
            account_holder_name: details.accountHolderName || companyDetails.accountHolderName, // Add new field
            ifsc_code: details.ifscCode || companyDetails.ifscCode,
            branch: details.branch || companyDetails.branch,
          })
          .eq('id', companyDetails.id);
  
        if (error) throw error;
      }
  
      await fetchData();
      toast.success('Company details updated successfully');
    } catch (error: any) {
      toast.error(`Error updating company details: ${error.message}`);
      throw error;
    }
  };

  // Refetch data function exposed in the context
  const refetchData = fetchData;

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [session]);

  // Function to update a client
  const updateClient = async (updatedClient: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: updatedClient.name,
          contact_person: updatedClient.contactPerson,
          phone: updatedClient.phone,
          email: updatedClient.email,
          company: updatedClient.company,
          four_p_plus_rate: updatedClient.rates.fourPPlus,
          four_p_minus_rate: updatedClient.rates.fourPMinus,
          payment_terms: updatedClient.paymentTerms,
          notes: updatedClient.notes,
        })
        .eq('id', updatedClient.id);

      if (error) throw error;

      await fetchData(); // Refetch all data
      toast.success('Client updated successfully');
    } catch (error: any) {
      toast.error(`Error updating client: ${error.message}`);
      console.error('Error updating client:', error);
    }
  };

  // Function to delete a client
  const deleteClient = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Client deleted successfully');
    } catch (error: any) {
      toast.error(`Error deleting client: ${error.message}`);
      console.error('Error deleting client:', error);
    }
  };

  // Function to add a client
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          contact_person: clientData.contactPerson,
          phone: clientData.phone,
          email: clientData.email,
          company: clientData.company,
          four_p_plus_rate: clientData.rates.fourPPlus,
          four_p_minus_rate: clientData.rates.fourPMinus,
          payment_terms: clientData.paymentTerms,
          notes: clientData.notes,
        })
        .select();

      if (error) throw error;

      await fetchData(); // Refetch all data
      toast.success('Client added successfully');
    } catch (error: any) {
      toast.error(`Error adding client: ${error.message}`);
      throw error;
    }
  };

  // Function to determine diamond category based on weight per piece
  const determineDiamondCategory = (weightInKarats: number, numberOfDiamonds: number): '4P Plus' | '4P Minus' => {
    const weightPerDiamond = weightInKarats / numberOfDiamonds;
    return weightPerDiamond > 0.15 ? '4P Plus' : '4P Minus';
  };

  // Function to calculate diamond value
  const calculateDiamondValue = (
    category: '4P Plus' | '4P Minus',
    clientId: string,
    weightInKarats: number,
    numberOfDiamonds: number,
    rawDamageWeight?: number
  ): number => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 0;
    
    const adjustedWeight = rawDamageWeight ? weightInKarats - rawDamageWeight : weightInKarats;
    
    if (category === '4P Plus') {
      return adjustedWeight * client.rates.fourPPlus;
    } else {
      return numberOfDiamonds * client.rates.fourPMinus;
    }
  };

  // Function to update a diamond
  const updateDiamond = async (updatedDiamond: Diamond) => {
    try {
      const { data, error } = await supabase
        .from('diamonds')
        .update({
          id: updatedDiamond.id,
          entry_date: updatedDiamond.entryDate,
          client_id: updatedDiamond.clientId,
          kapan_id: updatedDiamond.kapanId,
          number_of_diamonds: updatedDiamond.numberOfDiamonds,
          weight_in_karats: updatedDiamond.weightInKarats,
          market_rate: updatedDiamond.marketRate,
          category: updatedDiamond.category,
          raw_damage_weight: updatedDiamond.rawDamageWeight || null,
          total_value: updatedDiamond.totalValue,
        } as Database['public']['Tables']['diamonds']['Update'])
        .select();
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Diamond updated successfully');
    } catch (error: any) {
      toast.error(`Error updating diamond: ${error.message}`);
      console.error('Error updating diamond:', error);
    }
  };

  // Function to delete a diamond
  const deleteDiamond = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('diamonds')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Diamond deleted successfully');
    } catch (error: any) {
      toast.error(`Error deleting diamond: ${error.message}`);
      console.error('Error deleting diamond:', error);
    }
  };

  // Function to add a diamond
  const addDiamond = async (diamondData: Omit<Diamond, 'id' | 'category' | 'totalValue'>) => {
    try {
      const category = determineDiamondCategory(diamondData.weightInKarats, diamondData.numberOfDiamonds);
      const totalValue = calculateDiamondValue(
        category,
        diamondData.clientId,
        diamondData.weightInKarats,
        diamondData.numberOfDiamonds,
        diamondData.rawDamageWeight
      );

      const { data, error } = await supabase
        .from('diamonds')
        .insert({
          entry_date: diamondData.entryDate,
          client_id: diamondData.clientId,
          kapan_id: diamondData.kapanId,
          number_of_diamonds: diamondData.numberOfDiamonds,
          weight_in_karats: diamondData.weightInKarats,
          market_rate: diamondData.marketRate,
          category,
          raw_damage_weight: diamondData.rawDamageWeight || null,
          total_value: totalValue,
        } as Database['public']['Tables']['diamonds']['Insert'])
        .select();
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Diamond entry added successfully');
    } catch (error: any) {
      toast.error(`Error adding diamond: ${error.message}`);
      throw error;
    }
  };

  // Function to update market rate
  const updateMarketRate = async (rate: MarketRate) => {
    try {
      const { data, error } = await supabase
        .from('market_rates')
        .insert({
          date: rate.date,
          four_p_plus_rate: rate.fourPPlusRate,
          four_p_minus_rate: rate.fourPMinusRate,
        } as Database['public']['Tables']['market_rates']['Insert'])
        .select();
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Market rate updated successfully');
    } catch (error: any) {
      toast.error(`Error updating market rate: ${error.message}`);
      console.error('Error updating market rate:', error);
    }
  };

  // Function to get client by ID
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  // Function to generate invoice number
  const generateInvoiceNumber = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const nextNumber = (count || 0) + 1;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      return `INV-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error: any) {
      toast.error(`Error generating invoice number: ${error.message}`);
      throw error;
    }
  };

  // Function to add an invoice
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      // Log the diamonds for debugging
      console.log("Creating invoice with diamonds:", invoiceData.diamonds);
      
      if (!invoiceData.diamonds || invoiceData.diamonds.length === 0) {
        console.warn("No diamonds selected for this invoice!");
      }
      
      const invoiceNumber = await generateInvoiceNumber();
      
      // First, create the invoice record
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          client_id: invoiceData.clientId,
          total_amount: invoiceData.totalAmount,
          status: invoiceData.status,
          payment_date: invoiceData.paymentDate || null,
          notes: invoiceData.notes || null,
        })
        .select();
      
      if (error) {
        console.error("Error creating invoice:", error);
        throw error;
      }
      
      // If invoice was created successfully and we have diamond IDs
      if (data && data[0] && invoiceData.diamonds && invoiceData.diamonds.length > 0) {
        const invoiceId = data[0].id;
        console.log(`Invoice created with ID: ${invoiceId}, creating items for diamonds:`, invoiceData.diamonds);
        
        // Now create invoice_items entries for each diamond
        const invoiceItems = [];
        
        for (const diamondId of invoiceData.diamonds) {
          const diamond = diamonds.find(d => d.id === diamondId);
          if (!diamond) {
            console.warn(`Diamond with ID ${diamondId} not found, skipping`);
            continue;
          }
          
          // Create an invoice item for this diamond
          invoiceItems.push({
            invoice_id: invoiceId,
            diamond_id: diamondId,
            quantity: 1, // Default quantity
            price: diamond.totalValue,
            description: `${diamond.kapanId || 'N/A'} - ${diamond.numberOfDiamonds} pieces, ${diamond.weightInKarats} karats`
          });
        }
        
        // Insert all invoice items if we have any
        if (invoiceItems.length > 0) {
          console.log("Creating invoice items:", invoiceItems);
          
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems)
            .select();
          
          if (itemsError) {
            console.error("Error creating invoice items:", itemsError);
            // Don't throw the error - we still created the invoice
            toast.warning("Invoice created but there was an error linking some diamonds");
          } else {
            console.log(`Successfully created ${itemsData?.length} invoice items:`, itemsData);
          }
        }
      }
      
      // Refresh data to update state
      await fetchData();
      toast.success('Invoice created successfully');
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(`Error creating invoice: ${error.message}`);
      throw error;
    }
  };

  // Function to update an invoice
  const updateInvoice = async (updatedInvoice: Invoice) => {
    try {
      console.log("Updating invoice with diamonds:", updatedInvoice.diamonds);
      
      // First, update the invoice record
      const { error } = await supabase
        .from('invoices')
        .update({
          issue_date: updatedInvoice.issueDate,
          due_date: updatedInvoice.dueDate,
          client_id: updatedInvoice.clientId,
          total_amount: updatedInvoice.totalAmount,
          status: updatedInvoice.status,
          payment_date: updatedInvoice.paymentDate || null,
          notes: updatedInvoice.notes || null,
        })
        .eq('id', updatedInvoice.id);
      
      if (error) {
        console.error("Error updating invoice:", error);
        throw error;
      }
      
      // Delete existing invoice items - we'll recreate them
      console.log(`Deleting existing invoice items for invoice ${updatedInvoice.id}`);
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', updatedInvoice.id);
      
      if (deleteError) {
        console.error('Error deleting existing invoice items:', deleteError);
        throw deleteError;
      }
      
      // Create new invoice_items entries for each diamond
      if (updatedInvoice.diamonds && updatedInvoice.diamonds.length > 0) {
        console.log(`Creating new invoice items for diamonds:`, updatedInvoice.diamonds);
        
        const invoiceItems = [];
        
        for (const diamondId of updatedInvoice.diamonds) {
          const diamond = diamonds.find(d => d.id === diamondId);
          if (!diamond) {
            console.warn(`Diamond with ID ${diamondId} not found, skipping`);
            continue;
          }
          
          // Create an invoice item for this diamond
          invoiceItems.push({
            invoice_id: updatedInvoice.id,
            diamond_id: diamondId,
            quantity: 1, // Default quantity
            price: diamond.totalValue,
            description: `${diamond.kapanId || 'N/A'} - ${diamond.numberOfDiamonds} pieces, ${diamond.weightInKarats} karats`
          });
        }
        
        // Insert all invoice items if we have any
        if (invoiceItems.length > 0) {
          console.log("Creating new invoice items:", invoiceItems);
          
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems)
            .select();
          
          if (itemsError) {
            console.error("Error creating invoice items during update:", itemsError);
            // Don't throw the error - we still updated the invoice
            toast.warning("Invoice updated but there was an error linking some diamonds");
          } else {
            console.log(`Successfully created ${itemsData?.length} invoice items:`, itemsData);
          }
        }
      } else {
        console.warn("No diamonds selected for this invoice update!");
      }
      
      // Refresh data to update state
      await fetchData();
      toast.success('Invoice updated successfully');
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error(`Error updating invoice: ${error.message}`);
      throw error;
    }
  };

  // Function to delete an invoice
  // Updated deleteInvoice function with better error handling and logging
  const deleteInvoice = async (id: string) => {
    try {
      console.log(`Starting deletion process for invoice ID: ${id}`);
      
      // First, check if invoice items exist
      const { data: existingItems, error: checkError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id);
      
      if (checkError) {
        console.error("Error checking invoice items:", checkError);
        throw checkError;
      }
      
      console.log(`Found ${existingItems?.length || 0} invoice items to delete`);
      
      // Delete invoice items with explicit error logging
      const { data: deletedItems, error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)
        .select();
      
      if (itemsError) {
        console.error("Error deleting invoice items:", itemsError);
        throw itemsError;
      }
      
      console.log(`Successfully deleted ${deletedItems?.length || 0} invoice items`);
      
      // Now delete the invoice with explicit error logging
      const { data: deletedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .select();
      
      if (invoiceError) {
        console.error("Error deleting invoice:", invoiceError);
        throw invoiceError;
      }
      
      if (!deletedInvoice || deletedInvoice.length === 0) {
        console.warn(`No invoice with ID ${id} was found to delete`);
      } else {
        console.log(`Successfully deleted invoice with ID: ${id}`);
      }
      
      await fetchData();
      toast.success('Invoice deleted successfully');
    } catch (error: any) {
      console.error("Full invoice deletion error:", error);
      toast.error(`Error deleting invoice: ${error.message}`);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      diamonds,
      clients,
      marketRates,
      invoices,
      companyDetails,
      updateClient,
      deleteClient,
      addClient,
      updateDiamond,
      deleteDiamond,
      addDiamond,
      updateMarketRate,
      getClientById,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceNumber,
      getCompleteInvoice,
      updateCompanyDetails,
      isLoading,
      refetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};