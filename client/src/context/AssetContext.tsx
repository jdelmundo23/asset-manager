import { createContext } from "react";
import { AssetRow, Preset, User } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";
interface AssetContextType {
  assets: AssetRow[];
  locations: Preset[];
  departments: Preset[];
  types: Preset[];
  models: Preset[];
  users: User[];
  fetcher: FetcherWithComponents<any> | undefined;
}

const AssetContext = createContext<AssetContextType>({
  assets: [],
  locations: [],
  departments: [],
  types: [],
  models: [],
  users: [],
  fetcher: undefined,
});

export default AssetContext;
