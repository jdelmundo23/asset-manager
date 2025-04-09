import { createContext } from "react";
import { AssetRow, IPRow } from "@shared/schemas";
interface IPContextType {
  ips: IPRow[];
  assets: AssetRow[];
}

const IPContext = createContext<IPContextType>({
  ips: [],
  assets: [],
});

export default IPContext;
