import { ChevronsUpDown } from "lucide-react";
import { Button } from "./shadcn-ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./shadcn-ui/sheet";
import { DataTable } from "@/routes/modules/assets/table/AssetTable";
import { useContext } from "react";
import IpContext from "@/context/IPContext";
import { RowSelectionState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { TruncateHover } from "./TruncateHover";

interface TableSheetProps {
  value: number | null | undefined;
  selectedRow: RowSelectionState;
  setSelectedRow: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  onConfirm: () => void;
}

export function AssetTableSheet({
  value,
  selectedRow,
  setSelectedRow,
  onConfirm,
}: TableSheetProps) {
  const { assets } = useContext(IpContext);
  return (
    <Sheet
      onOpenChange={(open) =>
        setTimeout(
          () => setSelectedRow({ [value ?? -1]: true }),
          open ? 0 : 500
        )
      }
    >
      <SheetTrigger>
        <Button
          type="button"
          variant="outline"
          role="sheet"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
        >
          <TruncateHover>
            {value
              ? String(
                  assets.find((row) => {
                    return row.ID === value;
                  })?.name ?? ""
                )
              : "Select Asset"}
          </TruncateHover>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SheetTrigger>
      <SheetContent className="space-y-3">
        <SheetHeader>
          <SheetTitle>Select an asset</SheetTitle>
        </SheetHeader>
        <DataTable
          assets={assets}
          hideColumns={[
            "select",
            "modelID",
            "typeID",
            "locationID",
            "departmentID",
            "assignedTo",
            "purchaseDate",
            "warrantyExp",
            "cost",
            "actions",
            "ips",
          ]}
          selectedRow={selectedRow}
          onRowSelect={setSelectedRow}
          singleSelect={true}
        />
        <div className="flex justify-end space-x-2">
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button onClick={onConfirm}>Select</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
