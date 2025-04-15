import { createContext } from "react";
import { AssetRow, IPRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";
interface IPContextType {
  ips: IPRow[];
  assets: AssetRow[];
  fetcher: FetcherWithComponents<any> | undefined;
}

const IPContext = createContext<IPContextType>({
  ips: [],
  assets: [],
  fetcher: undefined,
});

export default IPContext;
