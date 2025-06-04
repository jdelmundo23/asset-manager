import { Button } from "@/components/shadcn-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn-ui/command";
import { SubnetRow } from "@shared/schemas";
import { useEffect, useState } from "react";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { cn } from "@/lib/utils";

interface SubnetComboboxProps {
  selectedSubnet: SubnetRow | undefined;
  setSelectedSubnet: React.Dispatch<
    React.SetStateAction<SubnetRow | undefined>
  >;
}

export default function SubnetComboxbox({
  selectedSubnet,
  setSelectedSubnet,
}: SubnetComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [subnets, setSubnets] = useState<SubnetRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosApi.get("/api/subnets/all");
        setSubnets(response.data);
      } catch (error) {
        handleError(error);
      }
    })();
  }, []);

  useEffect(() => {}, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="text-white">
        <Button variant="outline" role="combobox">
          Select subnet...{" "}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search subnet..." />
          <CommandList>
            <CommandEmpty>Add</CommandEmpty>
            <CommandGroup>
              {subnets.map((subnet) => (
                <CommandItem
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
