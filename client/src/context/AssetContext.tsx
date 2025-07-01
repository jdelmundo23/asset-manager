import { createContext } from "react";
import { AssetRow, Preset, User } from "@shared/schemas";
interface AssetContextType {
  assets: AssetRow[];
  locations: Preset[];
  departments: Preset[];
  types: Preset[];
  models: Preset[];
  users: User[];
}

const AssetContext = createContext<AssetContextType>({
  assets: [],
  locations: [],
  departments: [],
  types: [],
  models: [],
  users: [],
});

export default AssetContext;
