import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigation } from "react-router";
import { modules } from "@/lib/modules";
import { useSidebar } from "@/context/SidebarContext";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";

export default function Menu() {
  const navigation = useNavigation();
  const { sidebarActive } = useSidebar();
  const [menuClicked, setMenuClicked] = useState<boolean>(false);
  return (
    <div className="flex h-full w-full items-start justify-center py-4 sm:pt-24">
      <ScrollArea className="animate-fade-in max-h-full w-11/12 max-w-[1000px] rounded-xl bg-black p-3 shadow-lg sm:w-5/6">
        <div
          className={`grid gap-3 ${sidebarActive ? "md:grid-cols-1" : "md:grid-cols-2"} animate-fade-in-up lg:grid-cols-2`}
        >
          {modules.map((module) => (
            <Link
              key={module.link}
              to={module.link}
              className="flex odd:justify-end"
            >
              <Card
                className={`animate-fade-in-up stretch bg-muted border-muted-foreground/25 flex h-full flex-1 origin-center justify-between border shadow-lg transition-all hover:brightness-125`}
                onClick={() => setMenuClicked(true)}
              >
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center pl-0 pr-6 pt-6 lg:px-6">
                  <div className="h-5 w-5">
                    {navigation.location?.pathname === module.link &&
                    menuClicked ? (
                      <Loader2
                        className="flex animate-spin transition-all [transform-origin:center]"
                        color="gray"
                      />
                    ) : (
                      <module.icon />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
