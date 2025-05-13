import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  sidebarActive: boolean;
  setSidebarActive: (state: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sidebarActive, setSidebarActiveState] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarActive");
    return stored ? JSON.parse(stored) : false;
  });

  const setSidebarActive = (state: boolean) => {
    setSidebarActiveState(state);
    localStorage.setItem("sidebarActive", JSON.stringify(state));
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return (
    <SidebarContext.Provider
      value={{ sidebarActive, setSidebarActive, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
