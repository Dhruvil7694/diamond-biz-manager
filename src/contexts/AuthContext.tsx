
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'data-entry';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'manager' as const,
  },
  {
    id: '3',
    name: 'Data Entry User',
    email: 'data@example.com',
    password: 'data123',
    role: 'data-entry' as const,
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored user session on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('dbms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    setIsLoading(false);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('dbms_user', JSON.stringify(userWithoutPassword));
      toast.success('Login successful');
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dbms_user');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
