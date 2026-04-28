import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiJson } from '@/api/http';
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
type SupabaseDiamond = Database["public"]["Tables"]["diamonds"]["Row"];
type SupabaseClient = Database["public"]["Tables"]["clients"]["Row"];
type SupabaseMarketRate = Database["public"]["Tables"]["market_rates"]["Row"];
type SupabaseInvoice = Database["public"]["Tables"]["invoices"]["Row"];
type SupabaseCompanyDetails = Database["public"]["Tables"]["company_details"]["Row"];

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
  phone: client.phone ?? '',
  email: client.email ?? '',
  company: client.company,
  rates: {
    fourPPlus: client.four_p_plus_rate,
    fourPMinus: client.four_p_minus_rate,
  },
  paymentTerms: client.payment_terms ?? '',
  notes: client.notes ?? '',
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
  const { user } = useAuth();

  // Function to fetch data (PostgreSQL REST API — see server/index.mjs)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const boot = await apiJson<{
        clients: SupabaseClient[];
        diamonds: SupabaseDiamond[];
        invoices: SupabaseInvoice[];
        invoice_items: { invoice_id: string; diamond_id: string }[];
        market_rates: SupabaseMarketRate[];
        company_details: SupabaseCompanyDetails | null;
      }>('/bootstrap');

      const clientsData = boot.clients;
      const diamondsData = boot.diamonds;
      const invoicesData = boot.invoices;
      const invoiceItemsData = boot.invoice_items;
      const marketRatesData = boot.market_rates;

      let companyData: SupabaseCompanyDetails | null = boot.company_details;

      if (!companyData) {
        companyData = {
          id: 'default',
          company_name: 'Rashi Diamonds',
          address: 'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat',
          phone: '9879225849',
          email: 'hirenpatel29111997@gmail.com',
          gst_number: '27ABCDE1234F1Z5',
          bank_name: 'HDFC Bank',
          account_number: '12312312311',
          account_holder_name: 'Hirenbhai R Patel',
          ifsc_code: 'BARB0KIMXXX',
          branch: 'Kim, Surat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setClients(clientsData ? clientsData.map(mapSupabaseClientToClient) : []);
      setDiamonds(diamondsData ? diamondsData.map(mapSupabaseDiamondToDiamond) : []);

      if (invoicesData && invoiceItemsData) {
        const mappedInvoices = invoicesData.map((invoice) => {
          const items = invoiceItemsData.filter((item) => item.invoice_id === invoice.id);
          const diamondIds = items.map((item) => item.diamond_id);
          return {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            clientId: invoice.client_id,
            diamonds: diamondIds,
            totalAmount: invoice.total_amount,
            status: invoice.status as 'pending' | 'paid',
            paymentDate: invoice.payment_date || undefined,
            paymentMethod: invoice.payment_method ?? undefined,
            notes: invoice.notes || undefined,
          };
        });

        setInvoices(mappedInvoices);
      } else {
        setInvoices([]);
      }

      setMarketRates(marketRatesData ? marketRatesData.map(mapSupabaseMarketRateToMarketRate) : []);
      setCompanyDetails(
        mapSupabaseCompanyDetailsToCompanyDetails(companyData)
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error loading data:', error);
      toast.error(`Error loading data: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get complete invoice details for display
  const getCompleteInvoice = async (invoiceId: string): Promise<CompleteInvoice | null> => {
    try {
      console.log(`Getting complete invoice details for ID: ${invoiceId}`);

      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) {
        console.error(`Invoice with ID ${invoiceId} not found in context`);
        return null;
      }

      const client = clients.find((c) => c.id === invoice.clientId);
      if (!client) {
        console.error(`Client with ID ${invoice.clientId} not found for invoice ${invoiceId}`);
        return null;
      }

      const { diamonds: dbDiamondRows } = await apiJson<{ diamonds: SupabaseDiamond[] }>(
        `/invoices/${invoiceId}/with-diamonds`
      );

      const diamondDetails =
        dbDiamondRows?.length > 0
          ? dbDiamondRows.map(mapSupabaseDiamondToDiamond)
          : [];

      return {
        ...invoice,
        client,
        diamondDetails,
        company: companyDetails as CompanyDetails,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching complete invoice: ${msg}`, error);
      toast.error(`Error fetching invoice details: ${msg}`);
      return null;
    }
  };

  // Function to update company details
  const updateCompanyDetails = async (details: Partial<CompanyDetails>) => {
    try {
      if (!companyDetails || companyDetails.id === 'default') {
        await apiJson('/company-details', {
          method: 'POST',
          body: JSON.stringify({
            company_name: details.companyName!,
            address: details.address!,
            phone: details.phone ?? null,
            email: details.email ?? null,
            gst_number: details.gstNumber ?? null,
            bank_name: details.bankName!,
            account_number: details.accountNumber!,
            account_holder_name: details.accountHolderName!,
            ifsc_code: details.ifscCode!,
            branch: details.branch!,
          }),
        });
      } else {
        await apiJson(`/company-details/${companyDetails.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            company_name: details.companyName || companyDetails.companyName,
            address: details.address || companyDetails.address,
            phone: details.phone ?? companyDetails.phone ?? null,
            email: details.email ?? companyDetails.email ?? null,
            gst_number: details.gstNumber ?? companyDetails.gstNumber ?? null,
            bank_name: details.bankName || companyDetails.bankName,
            account_number: details.accountNumber || companyDetails.accountNumber,
            account_holder_name:
              details.accountHolderName ?? companyDetails.accountHolderName,
            ifsc_code: details.ifscCode || companyDetails.ifscCode,
            branch: details.branch || companyDetails.branch,
          }),
        });
      }

      await fetchData();
      toast.success('Company details updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error updating company details: ${msg}`);
      throw error;
    }
  };

  // Refetch data function exposed in the context
  const refetchData = fetchData;

  // Load business data only when authenticated (JWT is sent by apiJson)
  useEffect(() => {
    if (!user) {
      setClients([]);
      setDiamonds([]);
      setInvoices([]);
      setMarketRates([]);
      setCompanyDetails(null);
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  // Function to update a client
  const updateClient = async (updatedClient: Client) => {
    try {
      await apiJson(`/clients/${updatedClient.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: updatedClient.name,
          contact_person: updatedClient.contactPerson,
          phone: updatedClient.phone,
          email: updatedClient.email,
          company: updatedClient.company,
          four_p_plus_rate: updatedClient.rates.fourPPlus,
          four_p_minus_rate: updatedClient.rates.fourPMinus,
          payment_terms: updatedClient.paymentTerms,
          notes: updatedClient.notes,
        }),
      });

      await fetchData();
      toast.success('Client updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error updating client: ${msg}`);
      console.error('Error updating client:', error);
    }
  };

  // Function to delete a client
  const deleteClient = async (id: string) => {
    try {
      await apiJson(`/clients/${id}`, { method: 'DELETE' });

      await fetchData();
      toast.success('Client deleted successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error deleting client: ${msg}`);
      console.error('Error deleting client:', error);
    }
  };

  // Function to add a client
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      await apiJson('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: clientData.name,
          contact_person: clientData.contactPerson,
          phone: clientData.phone,
          email: clientData.email,
          company: clientData.company,
          four_p_plus_rate: clientData.rates.fourPPlus,
          four_p_minus_rate: clientData.rates.fourPMinus,
          payment_terms: clientData.paymentTerms,
          notes: clientData.notes,
        }),
      });

      await fetchData();
      toast.success('Client added successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error adding client: ${msg}`);
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
      await apiJson(`/diamonds/${updatedDiamond.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          entry_date: updatedDiamond.entryDate,
          client_id: updatedDiamond.clientId,
          kapan_id: updatedDiamond.kapanId,
          number_of_diamonds: updatedDiamond.numberOfDiamonds,
          weight_in_karats: updatedDiamond.weightInKarats,
          market_rate: updatedDiamond.marketRate,
          category: updatedDiamond.category,
          raw_damage_weight: updatedDiamond.rawDamageWeight ?? null,
          total_value: updatedDiamond.totalValue,
        } satisfies Database['public']['Tables']['diamonds']['Update']),
      });

      await fetchData();
      toast.success('Diamond updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error updating diamond: ${msg}`);
      console.error('Error updating diamond:', error);
    }
  };

  // Function to delete a diamond
  const deleteDiamond = async (id: string) => {
    try {
      await apiJson(`/diamonds/${id}`, { method: 'DELETE' });

      await fetchData();
      toast.success('Diamond deleted successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error deleting diamond: ${msg}`);
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

      await apiJson('/diamonds', {
        method: 'POST',
        body: JSON.stringify({
          entry_date: diamondData.entryDate,
          client_id: diamondData.clientId,
          kapan_id: diamondData.kapanId,
          number_of_diamonds: diamondData.numberOfDiamonds,
          weight_in_karats: diamondData.weightInKarats,
          market_rate: diamondData.marketRate,
          category,
          raw_damage_weight: diamondData.rawDamageWeight ?? null,
          total_value: totalValue,
        } satisfies Database['public']['Tables']['diamonds']['Insert']),
      });

      await fetchData();
      toast.success('Diamond entry added successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error adding diamond: ${msg}`);
      throw error;
    }
  };

  // Function to update market rate
  const updateMarketRate = async (rate: MarketRate) => {
    try {
      await apiJson('/market-rates', {
        method: 'POST',
        body: JSON.stringify({
          date: rate.date,
          four_p_plus_rate: rate.fourPPlusRate,
          four_p_minus_rate: rate.fourPMinusRate,
        } satisfies Database['public']['Tables']['market_rates']['Insert']),
      });

      await fetchData();
      toast.success('Market rate updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error updating market rate: ${msg}`);
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
      const { count } = await apiJson<{ count: number }>('/invoices/count');

      const nextNumber = (count || 0) + 1;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');

      return `INV-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Error generating invoice number: ${msg}`);
      throw error;
    }
  };

  // Function to add an invoice
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      console.log('Creating invoice with diamonds:', invoiceData.diamonds);

      if (!invoiceData.diamonds || invoiceData.diamonds.length === 0) {
        console.warn('No diamonds selected for this invoice!');
      }

      const invoiceNumber = await generateInvoiceNumber();

      const invoice_items: {
        diamond_id: string;
        quantity: number;
        price: number;
        description: string;
      }[] = [];

      for (const diamondId of invoiceData.diamonds || []) {
        const diamond = diamonds.find((d) => d.id === diamondId);
        if (!diamond) {
          console.warn(`Diamond with ID ${diamondId} not found, skipping`);
          continue;
        }
        invoice_items.push({
          diamond_id: diamondId,
          quantity: 1,
          price: diamond.totalValue,
          description: `${diamond.kapanId || 'N/A'} - ${diamond.numberOfDiamonds} pieces, ${diamond.weightInKarats} karats`,
        });
      }

      await apiJson('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          client_id: invoiceData.clientId,
          total_amount: invoiceData.totalAmount,
          status: invoiceData.status,
          payment_date: invoiceData.paymentDate ?? null,
          payment_method: invoiceData.paymentMethod ?? null,
          notes: invoiceData.notes ?? null,
          invoice_items,
        }),
      });

      await fetchData();
      toast.success('Invoice created successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error creating invoice:', error);
      toast.error(`Error creating invoice: ${msg}`);
      throw error;
    }
  };

  // Function to update an invoice
  const updateInvoice = async (updatedInvoice: Invoice) => {
    try {
      console.log('Updating invoice with diamonds:', updatedInvoice.diamonds);

      const invoice_items: {
        diamond_id: string;
        quantity: number;
        price: number;
        description: string;
      }[] = [];

      if (updatedInvoice.diamonds && updatedInvoice.diamonds.length > 0) {
        for (const diamondId of updatedInvoice.diamonds) {
          const diamond = diamonds.find((d) => d.id === diamondId);
          if (!diamond) {
            console.warn(`Diamond with ID ${diamondId} not found, skipping`);
            continue;
          }
          invoice_items.push({
            diamond_id: diamondId,
            quantity: 1,
            price: diamond.totalValue,
            description: `${diamond.kapanId || 'N/A'} - ${diamond.numberOfDiamonds} pieces, ${diamond.weightInKarats} karats`,
          });
        }
      }

      await apiJson(`/invoices/${updatedInvoice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          invoice: {
            issue_date: updatedInvoice.issueDate,
            due_date: updatedInvoice.dueDate,
            client_id: updatedInvoice.clientId,
            total_amount: updatedInvoice.totalAmount,
            status: updatedInvoice.status,
            payment_date: updatedInvoice.paymentDate ?? null,
            payment_method: updatedInvoice.paymentMethod ?? null,
            notes: updatedInvoice.notes ?? null,
          },
          invoice_items,
        }),
      });

      await fetchData();
      toast.success('Invoice updated successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error updating invoice:', error);
      toast.error(`Error updating invoice: ${msg}`);
      throw error;
    }
  };

  // Function to delete an invoice
  // Updated deleteInvoice function with better error handling and logging
  const deleteInvoice = async (id: string) => {
    try {
      await apiJson(`/invoices/${id}`, { method: 'DELETE' });

      await fetchData();
      toast.success('Invoice deleted successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Full invoice deletion error:', error);
      toast.error(`Error deleting invoice: ${msg}`);
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