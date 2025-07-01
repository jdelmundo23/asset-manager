import { createContext } from "react";
import { IPRow } from "@shared/schemas";
interface IPContextType {
  ips: IPRow[];
}

const IPContext = createContext<IPContextType>({
  ips: [],
});

export default IPContext;
