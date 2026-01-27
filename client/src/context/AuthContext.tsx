import axiosApi from "@/lib/axios";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  authenticated: boolean;
  upn?: string;
  name?: string;
  roles?: string[];
}

export interface AuthContextType extends AuthState {
  clear: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  clear: () => {},
});

export default AuthContext;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInfo, setAuthInfo] = useState<AuthState>({
    authenticated: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosApi.get(`/auth/user`);
        setAuthInfo(response.data);
      } catch {
        setAuthInfo({ authenticated: false });
      }
    })();
  }, []);

  const clear = () => {
    setAuthInfo({ authenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authInfo, clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
