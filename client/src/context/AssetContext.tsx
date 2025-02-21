import { createContext } from "react";
import { Preset } from "@/types";
interface AssetContextType {
  assets: [];
  locations: Preset[];
  departments: Preset[];
  types: Preset[];
  models: Preset[];
}

const AssetContext = createContext<AssetContextType>({
  assets: [],
  locations: [],
  departments: [],
  types: [],
  models: [],
});

export default AssetContext;
