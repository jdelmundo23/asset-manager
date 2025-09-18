import { AssetImport, MissingPresets } from "@shared/schemas";
import { createContext, useContext, useState, ReactNode } from "react";

interface ImportContextType {
  assets: AssetImport[];
  setAssets: React.Dispatch<React.SetStateAction<AssetImport[]>>;
  missingPresets: MissingPresets;
  setMissingPresets: React.Dispatch<React.SetStateAction<MissingPresets>>;
}

interface ImportProviderProps {
  children: ReactNode;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: ImportProviderProps) {
  const [assets, setAssets] = useState<AssetImport[]>([]);
  const [missingPresets, setMissingPresets] = useState<MissingPresets>({
    modelAndTypes: [],
    departments: [],
    locations: [],
  });

  return (
    <ImportContext.Provider
      value={{
        assets,
        setAssets,
        missingPresets,
        setMissingPresets,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const ctx = useContext(ImportContext);
  if (!ctx) throw new Error("useImport must be used within an ImportProvider");
  return ctx;
}
