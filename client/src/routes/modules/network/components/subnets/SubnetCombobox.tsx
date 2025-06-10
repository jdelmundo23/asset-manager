import { Button } from "@/components/shadcn-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { ChevronsUpDownIcon } from "lucide-react";
import { SubnetRow } from "@shared/schemas";
import { useState } from "react";
import SubnetSearch from "./SubnetSearch";
import { SubnetProvider } from "@/context/SubnetContext";

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="text-white">
        <Button
          variant="outline"
          role="combobox"
          className="w-40 justify-between"
        >
          {selectedSubnet ? selectedSubnet.subnetPrefix : "Select subnet..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <SubnetProvider
          selectedSubnet={selectedSubnet}
          setSelectedSubnet={setSelectedSubnet}
        >
          <SubnetSearch />
        </SubnetProvider>
      </PopoverContent>
    </Popover>
  );
}
