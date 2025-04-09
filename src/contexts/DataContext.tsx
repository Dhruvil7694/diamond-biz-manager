
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface DataContextType {
  diamonds: Diamond[];
  clients: Client[];
  marketRates: MarketRate[];
  addClient: (client: Omit<Client, 'id'>) => void;
  addDiamond: (diamond: Omit<Diamond, 'id' | 'category' | 'totalValue'>) => void;
  updateMarketRate: (rate: MarketRate) => void;
  getClientById: (id: string) => Client | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

// Mock initial data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Diamond Traders Inc',
    contactPerson: 'John Smith',
    phone: '123-456-7890',
    email: 'john@diamondtraders.com',
    company: 'Diamond Traders Inc',
    rates: {
      fourPPlus: 5000, // $5000 per karat
      fourPMinus: 300,  // $300 per piece
    },
    paymentTerms: 'Net 30',
    notes: 'Preferred client, provide priority service',
  },
  {
    id: '2',
    name: 'Gem Solutions LLC',
    contactPerson: 'Sarah Johnson',
    phone: '987-654-3210',
    email: 'sarah@gemsolutions.com',
    company: 'Gem Solutions LLC',
    rates: {
      fourPPlus: 5200, // $5200 per karat
      fourPMinus: 310,  // $310 per piece
    },
    paymentTerms: 'Net 15',
    notes: 'New client, verify all orders',
  },
];

const mockMarketRates: MarketRate[] = [
  {
    date: new Date().toISOString(),
    fourPPlusRate: 5100, // $5100 per karat
    fourPMinusRate: 305,  // $305 per piece
  },
];

// Generate mock diamond data
const generateMockDiamonds = (): Diamond[] => {
  const diamonds: Diamond[] = [];
  const today = new Date();
  
  // Add some 4P Plus diamonds
  diamonds.push({
    id: '1',
    entryDate: new Date(today.setDate(today.getDate() - 5)).toISOString(),
    clientId: '1',
    kapanId: '203A',
    numberOfDiamonds: 20,
    weightInKarats: 10.5,
    marketRate: 5100,
    category: '4P Plus',
    totalValue: 10.5 * 5000, // Weight * client rate
  });
  
  // Add some 4P Minus diamonds
  diamonds.push({
    id: '2',
    entryDate: new Date(today.setDate(today.getDate() - 3)).toISOString(),
    clientId: '1',
    kapanId: '203A',
    numberOfDiamonds: 136,
    weightInKarats: 18.2,
    marketRate: 305,
    category: '4P Minus',
    totalValue: 136 * 300, // Number * client rate
  });
  
  // Add one more entry for a different client
  diamonds.push({
    id: '3',
    entryDate: new Date().toISOString(),
    clientId: '2',
    kapanId: '415B',
    numberOfDiamonds: 45,
    weightInKarats: 25.8,
    marketRate: 5100,
    category: '4P Plus',
    totalValue: 25.8 * 5200, // Weight * client rate
  });
  
  return diamonds;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diamonds, setDiamonds] = useState<Diamond[]>(generateMockDiamonds());
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [marketRates, setMarketRates] = useState<MarketRate[]>(mockMarketRates);

  // In a real application, we would load this data from API/database
  useEffect(() => {
    // Load data from localStorage if it exists
    const storedDiamonds = localStorage.getItem('dbms_diamonds');
    const storedClients = localStorage.getItem('dbms_clients');
    const storedMarketRates = localStorage.getItem('dbms_marketRates');
    
    if (storedDiamonds) setDiamonds(JSON.parse(storedDiamonds));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedMarketRates) setMarketRates(JSON.parse(storedMarketRates));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('dbms_diamonds', JSON.stringify(diamonds));
  }, [diamonds]);
  
  useEffect(() => {
    localStorage.setItem('dbms_clients', JSON.stringify(clients));
  }, [clients]);
  
  useEffect(() => {
    localStorage.setItem('dbms_marketRates', JSON.stringify(marketRates));
  }, [marketRates]);

  // Function to determine diamond category based on weight per piece
  const determineDiamondCategory = (weightInKarats: number, numberOfDiamonds: number): '4P Plus' | '4P Minus' => {
    const weightPerDiamond = weightInKarats / numberOfDiamonds;
    return weightPerDiamond > 0.15 ? '4P Plus' : '4P Minus';
  };

  // Function to calculate diamond value based on category and client rates
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

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: `${clients.length + 1}`,
    };
    setClients([...clients, newClient]);
  };

  const addDiamond = (diamondData: Omit<Diamond, 'id' | 'category' | 'totalValue'>) => {
    const category = determineDiamondCategory(diamondData.weightInKarats, diamondData.numberOfDiamonds);
    const totalValue = calculateDiamondValue(
      category,
      diamondData.clientId,
      diamondData.weightInKarats,
      diamondData.numberOfDiamonds,
      diamondData.rawDamageWeight
    );
    
    const newDiamond: Diamond = {
      ...diamondData,
      id: `${diamonds.length + 1}`,
      category,
      totalValue,
    };
    
    setDiamonds([...diamonds, newDiamond]);
  };

  const updateMarketRate = (rate: MarketRate) => {
    setMarketRates([rate, ...marketRates]);
  };

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
