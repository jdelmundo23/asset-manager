import { createContext } from "react";
import { ipRow } from "@shared/schemas";
interface IpContextType {
  ips: ipRow[];
}

const IpContext = createContext<IpContextType>({
  ips: [],
});

export default IpContext;
