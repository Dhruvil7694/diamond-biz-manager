
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Define a custom user object that extends the required User properties
interface CustomUser extends User {
  name: string;
  email: string;
  id: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Check if we have a user in localStorage
    const savedUser = localStorage.getItem('dbms_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as CustomUser;
        setUser(parsedUser as User);
        // Create a mock session
        setSession({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          expires_at: new Date().getTime() + 3600000,
          token_type: 'bearer',
          user: parsedUser as User,
        });
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem('dbms_user');
      }
    }
    
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Fixed credentials check
      if (
        (email.toLowerCase() === 'hiren.patel@example.com' || 
         email.toLowerCase() === 'hiren patel') && 
        password === 'Hp#9879225849'
      ) {
        // Create a custom user object with all required User properties
        const customUser: CustomUser = {
          email: 'hiren.patel@example.com',
          name: 'Hiren Patel',
          id: '1234567890',
          app_metadata: {},
          user_metadata: { name: 'Hiren Patel' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('dbms_user', JSON.stringify(customUser));
        
        // Update state
        setUser(customUser as User);
        
        // Create a mock session
        const mockSession: Session = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          expires_at: new Date().getTime() + 3600000,
          token_type: 'bearer',
          user: customUser as User,
        };
        
        setSession(mockSession);
        
        toast.success('Login successful');
        return true;
      }
      
      toast.error('Invalid credentials');
      return false;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Clear stored user
      localStorage.removeItem('dbms_user');
      
      // Clear state
      setUser(null);
      setSession(null);
      
      toast.info('You have been logged out');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-diamond-600"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
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
