import { ReactNode } from "react";
import Header from "./Header";
import { useSidebar } from "@/context/SidebarContext";
interface MainProps {
  children: ReactNode;
}

function Main({ children }: MainProps) {
  const { sidebarActive } = useSidebar();
  return (
    <main
      className={`flex h-full max-w-full flex-1 flex-col items-center transition-all duration-300 ${
        sidebarActive ? "w-[calc(100%-250px)]" : "w-full"
      }`}
    >
      <Header sidebarActive={sidebarActive} />
      <div className={"flex w-full flex-1 flex-col overflow-hidden"}>
        {children}
      </div>
    </main>
  );
}
export default Main;
