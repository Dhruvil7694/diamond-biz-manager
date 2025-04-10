
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

export interface MarketRate {
  date: string;
  fourPPlusRate: number;
  fourPMinusRate: number;
}

// Map types from Supabase to our application types
type SupabaseDiamond = Database['public']['Tables']['diamonds']['Row'];
type SupabaseClient = Database['public']['Tables']['clients']['Row'];
type SupabaseMarketRate = Database['public']['Tables']['market_rates']['Row'];

interface DataContextType {
  diamonds: Diamond[];
  clients: Client[];
  marketRates: MarketRate[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  addDiamond: (diamond: Omit<Diamond, 'id' | 'category' | 'totalValue'>) => Promise<void>;
  updateMarketRate: (rate: MarketRate) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
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
  phone: client.phone || '',
  email: client.email || '',
  company: client.company,
  rates: {
    fourPPlus: client.four_p_plus_rate,
    fourPMinus: client.four_p_minus_rate,
  },
  paymentTerms: client.payment_terms || '',
  notes: client.notes || '',
});

const mapSupabaseMarketRateToMarketRate = (marketRate: SupabaseMarketRate): MarketRate => ({
  date: marketRate.date,
  fourPPlusRate: marketRate.four_p_plus_rate,
  fourPMinusRate: marketRate.four_p_minus_rate,
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
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
      
      // Fetch market rates
      const { data: marketRatesData, error: marketRatesError } = await supabase
        .from('market_rates')
        .select('*')
        .order('date', { ascending: false });
      
      if (marketRatesError) throw marketRatesError;
      
      // Map data to application types
      setClients(clientsData.map(mapSupabaseClientToClient));
      setDiamonds(diamondsData.map(mapSupabaseDiamondToDiamond));
      setMarketRates(marketRatesData.map(mapSupabaseMarketRateToMarketRate));
      
    } catch (error: any) {
      toast.error(`Error loading data: ${error.message}`);
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch data function exposed in the context
  const refetchData = fetchData;

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [session]);

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
      console.error('Error adding client:', error);
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
        })
        .select();
      
      if (error) throw error;
      
      await fetchData(); // Refetch all data
      toast.success('Diamond entry added successfully');
    } catch (error: any) {
      toast.error(`Error adding diamond: ${error.message}`);
      console.error('Error adding diamond:', error);
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
        })
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

  return (
    <DataContext.Provider value={{
      diamonds,
      clients,
      marketRates,
      addClient,
      addDiamond,
      updateMarketRate,
      getClientById,
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
