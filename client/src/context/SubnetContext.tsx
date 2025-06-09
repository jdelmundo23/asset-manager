import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { SubnetRow } from "@shared/schemas";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SubnetContextType {
  subnets: SubnetRow[];
  refetchSubnets: () => Promise<void>;
  isLoading: boolean;
  selectedSubnet: SubnetRow | undefined;
  setSelectedSubnet: React.Dispatch<
    React.SetStateAction<SubnetRow | undefined>
  >;
}

interface SubnetProviderProps {
  children: JSX.Element;
  selectedSubnet: SubnetRow | undefined;
  setSelectedSubnet: React.Dispatch<
    React.SetStateAction<SubnetRow | undefined>
  >;
}

const SubnetContext = createContext<SubnetContextType | undefined>(undefined);

export function SubnetProvider({
  children,
  selectedSubnet,
  setSelectedSubnet,
}: SubnetProviderProps) {
  const [subnets, setSubnets] = useState<SubnetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetchSubnets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosApi.get("/api/subnets/all");
      setSubnets(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchSubnets();
  }, [refetchSubnets]);

  return (
    <SubnetContext.Provider
      value={{
        subnets,
        refetchSubnets,
        isLoading,
        selectedSubnet,
        setSelectedSubnet,
      }}
    >
      {children}
    </SubnetContext.Provider>
  );
}

export function useSubnets() {
  const ctx = useContext(SubnetContext);
  if (!ctx) throw new Error("useSubnets must be used within SubnetProvider");
  return ctx;
}
