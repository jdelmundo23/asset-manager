import { createContext } from "react";
export interface AuthContextType {
  authenticated: boolean;
  upn?: string;
  name?: string;
  roles?: string[];
}

const AuthContext = createContext<AuthContextType>({ authenticated: false });

export default AuthContext;
