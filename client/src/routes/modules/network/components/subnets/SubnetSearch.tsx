import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn-ui/command";
import { cn } from "@/lib/utils";
import { CheckIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AddSubnet from "./AddSubnet";
import { Button } from "@/components/shadcn-ui/button";
import { useSubnets } from "@/context/SubnetContext";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import DeleteSubnet from "./DeleteSubnet";
import EditSubnet from "./EditSubnet";
import AdminAction from "@/components/AdminAction";

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
        <AdminAction>
          <Button
            variant="ghost"
            className="group-hover:hover:bg-accent bg-muted/50 flex h-full w-full justify-end rounded-none border-b p-1 text-xs"
          >
            + Add Subnet
          </Button>
        </AdminAction>
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
              <p>{search ? "Subnet not found" : "No subnets"}</p>
              <AddSubnet setSearch={setSearch}>
                <AdminAction>
                  <Button variant={"link"} className="font-bold">
                    <div className="flex items-center">
                      <Plus /> Add subnet
                    </div>
                  </Button>
                </AdminAction>
              </AddSubnet>
            </div>
          )}
        </CommandEmpty>
        <ScrollArea className="max-h-72">
          <CommandGroup className="p-0">
            {subnets.map((subnet) => (
              <CommandItem
                className="animate-fade-in group duration-200"
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
                <div className="flex w-full items-center gap-x-1">
                  <p>{subnet.subnetPrefix}</p>
                  <p className="text-muted-foreground/70 text-nowrap text-xs">
                    {subnet.locationName}
                  </p>
                </div>

                <div className="flex w-full justify-end gap-x-1">
                  <EditSubnet setSearch={setSearch} subnet={subnet}>
                    <AdminAction hide>
                      <button
                        type="button"
                        className="cursor-pointer opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                      >
                        <Pencil />
                      </button>
                    </AdminAction>
                  </EditSubnet>
                  <DeleteSubnet subnet={subnet}>
                    <AdminAction hide>
                      <button
                        type="button"
                        className="cursor-pointer opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                      >
                        <Trash2 />
                      </button>
                    </AdminAction>
                  </DeleteSubnet>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
  );
}
