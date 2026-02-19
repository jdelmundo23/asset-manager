import { createContext, useContext, useEffect } from "react";
import { AssetRow, assetRowSchema, Preset, User } from "@shared/schemas";
import axiosApi from "@/lib/axios";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { handleError } from "@/lib/handleError";
import { useTableConfig } from "./TableConfigContext";
interface AssetContextType {
  assets: AssetRow[];
  locations: {
    array: Preset[];
    map: Record<number | string, string>;
  };
  departments: {
    array: Preset[];
    map: Record<number | string, string>;
  };
  types: {
    array: Preset[];
    map: Record<number | string, string>;
  };
  models: {
    array: Preset[];
    map: Record<number | string, string>;
  };
  users: {
    array: User[];
    map: Record<number | string, string>;
  };
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

  const arrayToMap = <T extends { ID: number | string; name: string }>(
    arr: T[]
  ) => Object.fromEntries(arr.map((x) => [x["ID"], x["name"]] as const));

  return {
    assets: parsedAssets,
    locations: {
      array: locRes.data,
      map: arrayToMap(locRes.data),
    },
    departments: {
      array: depRes.data,
      map: arrayToMap(depRes.data),
    },
    types: {
      array: typeRes.data,
      map: arrayToMap(typeRes.data),
    },
    models: {
      array: modelRes.data,
      map: arrayToMap(modelRes.data),
    },
    users: {
      array: usersRes.data,
      map: arrayToMap(usersRes.data),
    },
  };
};

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: AssetProviderProps) {
  const { queryKey } = useTableConfig();

  const assetQuery = useQuery({
    queryKey: queryKey,
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
        locations: {
          array: assetQuery.data?.locations?.array ?? [],
          map: assetQuery.data?.locations?.map ?? {},
        },
        departments: {
          array: assetQuery.data?.departments?.array ?? [],
          map: assetQuery.data?.departments?.map ?? {},
        },
        types: {
          array: assetQuery.data?.types?.array ?? [],
          map: assetQuery.data?.types?.map ?? {},
        },
        models: {
          array: assetQuery.data?.models?.array ?? [],
          map: assetQuery.data?.models?.map ?? {},
        },
        users: {
          array: assetQuery.data?.users?.array ?? [],
          map: assetQuery.data?.users?.map ?? {},
        },
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
