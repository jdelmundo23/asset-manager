import { ReactNode } from "react";
import Header from "./Header";
interface MainProps {
  sidebarActive: boolean;
  children: ReactNode;
}

function Main({ sidebarActive, children }: MainProps) {
  return (
    <main className={`flex h-full max-w-full flex-1 flex-col items-center`}>
      <Header sidebarActive={sidebarActive} />
      <div className={"h-full w-full"}>{children}</div>
    </main>
  );
}
export default Main;
