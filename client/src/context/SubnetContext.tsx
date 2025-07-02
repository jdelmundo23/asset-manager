import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { SubnetRow, subnetRowSchema } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { z } from "zod";

interface SubnetContextType {
  subnets: SubnetRow[];
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
  const subnetQuery = useQuery({
    queryKey: ["subnetData"],
    queryFn: async () => {
      const response = await axiosApi.get("/api/subnets/all");
      return z.array(subnetRowSchema).parse(response.data);
    },
  });

  useEffect(() => {
    if (subnetQuery.isError) {
      handleError(subnetQuery.error);
    }
  }, [subnetQuery.isError, subnetQuery.error]);

  return (
    <SubnetContext.Provider
      value={{
        subnets: subnetQuery.data ?? [],
        isLoading: subnetQuery.isLoading,
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
