import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn-ui/command";
import { cn } from "@/lib/utils";
import { CheckIcon, Plus } from "lucide-react";
import { useState } from "react";
import AddSubnet from "./AddSubnet";
import { Button } from "@/components/shadcn-ui/button";
import { useSubnets } from "@/context/SubnetContext";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";

export default function SubnetSearch() {
  const { subnets, isLoading, selectedSubnet, setSelectedSubnet } =
    useSubnets();
  const [search, setSearch] = useState<string>("");
  return (
    <Command>
      <CommandInput
        value={search}
        onValueChange={(input) => {
          const filtered = input.replace(/[^0-9.]/g, "");
          setSearch(filtered);
        }}
        placeholder="Search subnet..."
      />
      <AddSubnet setSearch={setSearch}>
        <Button
          variant="ghost"
          className="group-hover:hover:bg-accent bg-muted/50 flex h-full w-full justify-end rounded-none border-b p-1 text-xs"
        >
          + Add Subnet
        </Button>
      </AddSubnet>
      <CommandList className="max-h-none">
        <CommandEmpty
          className={`text-sm ${isLoading ? "py-0" : "py-6"} text-center`}
        >
          {isLoading ? (
            <div className="flex flex-col">
              <Skeleton className="mx-3 mt-4 h-4" />
              <Skeleton className="mx-3 mt-4 h-4" />
              <Skeleton className="mx-3 mb-3 mt-4 h-4" />
            </div>
          ) : (
            <div className="">
              <p>Subnet not found</p>
              <AddSubnet setSearch={setSearch}>
                <Button variant={"link"} className="font-bold">
                  <div className="flex items-center">
                    <Plus /> Add subnet
                  </div>
                </Button>
              </AddSubnet>
            </div>
          )}
        </CommandEmpty>
        <ScrollArea className="max-h-72">
          <CommandGroup>
            {subnets.map((subnet) => (
              <CommandItem
                className="animate-fade-in duration-200"
                key={subnet.ID}
                value={subnet.subnetPrefix}
                onSelect={(value) => {
                  if (value === selectedSubnet?.subnetPrefix) {
                    setSelectedSubnet(undefined);
                  } else {
                    setSelectedSubnet(
                      subnets.find((subnet) => subnet.subnetPrefix === value)
                    );
                  }
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedSubnet?.subnetPrefix === subnet.subnetPrefix
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {subnet.subnetPrefix}
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
  );
}
