import { createContext, useContext, useEffect } from "react";
import { IPRow, ipRowSchema } from "@shared/schemas";
import z from "zod";
import axiosApi from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { handleError } from "@/lib/handleError";
interface IPContextType {
  ips: IPRow[];
}

interface IPProviderProps {
  children: JSX.Element;
}

const IPContext = createContext<IPContextType | undefined>(undefined);

export function IPProvider({ children }: IPProviderProps) {
  const ipQuery = useQuery({
    queryKey: ["ipData"],
    queryFn: async () => {
      const response = await axiosApi.get(`/api/ips/all`);
      return z.array(ipRowSchema).parse(response.data);
    },
  });

  useEffect(() => {
    if (ipQuery.isError) {
      handleError(ipQuery.error);
    }
  }, [ipQuery.isError, ipQuery.error]);

  return (
    <IPContext.Provider value={{ ips: ipQuery.data ?? [] }}>
      {children}
    </IPContext.Provider>
  );
}

export function useIPs() {
  const ctx = useContext(IPContext);
  if (!ctx) throw new Error("useAssets must be used within AssetProvider");
  return ctx;
}
