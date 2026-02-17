import { useState } from "react";
import { Button } from "../shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { Row } from "@tanstack/react-table";

export default function ExportDialog<T>({
  children,
  filteredRows,
}: {
  children: React.ReactNode;
  filteredRows: Row<T>[];
}) {
  const [open, setOpen] = useState<boolean>(false);

  const filteredRowsData = filteredRows.map((row) => row.original);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-y-1 text-white">
        <DialogTitle className="flex items-center justify-between">
          {"Export Rows"}
        </DialogTitle>
        <div className="mt-4 flex flex-col gap-y-3">
          <Button variant={"secondary"}>Export filtered</Button>
          <Button variant={"secondary"}>Export all</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
