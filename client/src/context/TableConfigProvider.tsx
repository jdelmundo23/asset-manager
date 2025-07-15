import { createContext, useContext } from "react";

interface TableConfig {
  endpoint: string;
  queryKey: string[];
}

const TableConfigContext = createContext<TableConfig | undefined>(undefined);

export function TableConfigProvider({
  endpoint,
  queryKey,
  children,
}: {
  endpoint: string;
  queryKey: string[];
  children: JSX.Element;
}) {
  return (
    <TableConfigContext.Provider value={{ endpoint, queryKey }}>
      {children}
    </TableConfigContext.Provider>
  );
}

export function useTableConfig() {
  const ctx = useContext(TableConfigContext);
  if (!ctx)
    throw new Error("useTableConfig must be used within TableConfigProvider");
  return ctx;
}
