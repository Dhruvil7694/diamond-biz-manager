import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<CustomUser>) => Promise<void>;
  isLoading: boolean;
  getSupabaseToken: () => Promise<string | null>;
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
  phone?: string;
  position?: string;
  company?: string;
  avatar?: string;
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

  const supabaseAccessToken = import.meta.env.VITE_SUPABASE_ACCESS_TOKEN;


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
          user_metadata: { 
            name: 'Hiren Patel',
            phone: '+1 123-456-7890',
            position: 'Diamond Merchant',
            company: 'Diamond Business Management Systems',
            supabaseAccessToken: supabaseAccessToken // Store token in user_metadata
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          phone: '+1 123-456-7890',
          position: 'Diamond Merchant',
          company: 'Diamond Business Management Systems'
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

  // Add updateProfile functionality
  const updateProfile = async (profileData: Partial<CustomUser>) => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get the current user data
      const currentUser = localStorage.getItem('dbms_user');
      if (!currentUser) {
        throw new Error('User data not found');
      }
      
      const parsedUser = JSON.parse(currentUser) as CustomUser;
      
      // Update the user data with new profile information
      const updatedUser = {
        ...parsedUser,
        ...profileData,
        // Make sure to update user_metadata as well
        user_metadata: {
          ...parsedUser.user_metadata,
          ...profileData
        }
      };
      
      // Save updated user to localStorage
      localStorage.setItem('dbms_user', JSON.stringify(updatedUser));
      
      // Update the state
      setUser(updatedUser as User);
      
      // Update the session
      if (session) {
        const updatedSession = {
          ...session,
          user: updatedUser as User
        };
        setSession(updatedSession);
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to retrieve Supabase token
  const getSupabaseToken = async (): Promise<string | null> => {
    try {
      // In a real implementation, you would use Supabase auth
      // For now, we'll use the token stored in user_metadata or a hardcoded one
      
      // Check if we have a token in user metadata
      if (user?.user_metadata?.supabaseAccessToken) {
        return user.user_metadata.supabaseAccessToken;
      }
      
      // If no token in metadata but we have a session, try to use that
      if (session?.access_token && session.access_token !== 'mock-token') {
        return session.access_token;
      }
      
      // If we're still here, try to get one from Supabase directly
      // In a real implementation, you would use something like:
      // const { data: { session } } = await supabase.auth.getSession();
      // return session?.access_token || null;
      
      // For now, return a placeholder/mock token
      return 'your-supabase-access-token';
    } catch (error) {
      console.error('Error getting Supabase token:', error);
      return null;
    }
  };

  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-diamond-600"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      logout, 
      updateProfile, 
      isLoading,
      getSupabaseToken 
    }}>
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