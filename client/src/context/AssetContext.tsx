import { createContext, useContext, useEffect } from "react";
import { AssetRow, assetRowSchema, Preset, User } from "@shared/schemas";
import axiosApi from "@/lib/axios";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { handleError } from "@/lib/handleError";
interface AssetContextType {
  assets: AssetRow[];
  locations: Preset[];
  departments: Preset[];
  types: Preset[];
  models: Preset[];
  users: User[];
}

interface AssetProviderProps {
  children: JSX.Element;
}

const getAssetData = async () => {
  const [assetRes, locRes, depRes, typeRes, modelRes, usersRes] =
    await Promise.all([
      axiosApi.get(`/api/assets/all`),
      axiosApi.get(`/api/presets/locations`),
      axiosApi.get(`/api/presets/departments`),
      axiosApi.get(`/api/presets/assettypes`),
      axiosApi.get(`/api/presets/assetmodels`),
      axiosApi.get(`/api/users/all`),
    ]);
  const parsedAssets = z.array(assetRowSchema).parse(assetRes.data);

  return {
    assets: parsedAssets,
    locations: locRes.data,
    departments: depRes.data,
    types: typeRes.data,
    models: modelRes.data,
    users: usersRes.data,
  };
};

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: AssetProviderProps) {
  const assetQuery = useQuery({
    queryKey: ["assetData"],
    queryFn: getAssetData,
  });

  useEffect(() => {
    if (assetQuery.isError) {
      handleError(assetQuery.error);
    }
  }, [assetQuery.isError, assetQuery.error]);

  return (
    <AssetContext.Provider
      value={{
        assets: assetQuery.data?.assets ?? [],
        locations: assetQuery.data?.locations ?? [],
        departments: assetQuery.data?.departments ?? [],
        types: assetQuery.data?.types ?? [],
        models: assetQuery.data?.models ?? [],
        users: assetQuery.data?.users ?? [],
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used within AssetProvider");
  return ctx;
}
