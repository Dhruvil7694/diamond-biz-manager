import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { apiJson, setAuthToken, getAuthToken } from "@/api/http";

/** User row mirrored from PostgreSQL `users` (no password). */
export interface AppUser {
  id: string;
  email: string;
  username?: string | null;
  name: string;
  phone?: string | null;
  position?: string | null;
  company?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AppSession {
  access_token: string;
  token_type: "bearer";
  user: AppUser;
}

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileUpdate>) => Promise<void>;
  isLoading: boolean;
  /** Same as session access token (JWT). */
  getAccessToken: () => Promise<string | null>;
}

export type ProfileUpdate = {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  /** Base64 or URL; stored in users.avatar_url */
  avatar?: string;
  avatar_url?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

function buildSession(token: string, user: AppUser): AppSession {
  return {
    access_token: token,
    token_type: "bearer",
    user,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const { user: u } = await apiJson<{ user: AppUser }>("/auth/me");
        setUser(u);
        setSession(buildSession(token, u));
      } catch {
        setAuthToken(null);
        setUser(null);
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    };
    void restore();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      setAuthToken(null);
      const data = await apiJson<{ user: AppUser; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            identifier: identifier.trim(),
            password,
          }),
        }
      );
      setAuthToken(data.token);
      setUser(data.user);
      setSession(buildSession(data.token, data.user));
      toast.success("Login successful");
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setAuthToken(null);
      setUser(null);
      setSession(null);
      toast.info("You have been logged out");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Logout error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<ProfileUpdate>) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("Not authenticated");
      }
      const body: Record<string, string | undefined> = {};
      if (profileData.name !== undefined) body.name = profileData.name;
      if (profileData.phone !== undefined) body.phone = profileData.phone;
      if (profileData.position !== undefined)
        body.position = profileData.position;
      if (profileData.company !== undefined) body.company = profileData.company;
      if (profileData.avatar_url !== undefined)
        body.avatar_url = profileData.avatar_url;
      if (profileData.avatar !== undefined) body.avatar = profileData.avatar;

      const { user: u } = await apiJson<{ user: AppUser }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setUser(u);
      const tok = getAuthToken();
      if (tok) setSession(buildSession(tok, u));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Update failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    return getAuthToken();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-diamond-600" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        updateProfile,
        isLoading,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
