import { useState } from "react";
import { Button } from "../shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { Table } from "@tanstack/react-table";
import { useAssets } from "@/context/AssetContext";
import { mapAssetToExport } from "@/lib/export";
import Papa from "papaparse";
import { AssetRow } from "@shared/schemas";

export default function ExportDialog({
  children,
  table,
}: {
  children: React.ReactNode;
  table: Table<AssetRow>;
}) {
  const {
    types: { map: types },
    models: { map: models },
    locations: { map: locations },
    departments: { map: departments },
    users: { map: users },
  } = useAssets();

  const [open, setOpen] = useState<boolean>(false);

  const filtered = table.getFilteredRowModel().rows.map((row) => row.original);
  const all = table.getCoreRowModel().rows.map((row) => row.original);
  const selected = table.getSelectedRowModel().rows.map((row) => row.original);

  const downloadRows = (rows: AssetRow[]) => {
    const csv = Papa.unparse(
      rows.map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rowNumber, ...rest } = mapAssetToExport(row, {
          types,
          models,
          locations,
          departments,
          users,
        });
        return rest;
      })
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "asset_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-y-1 text-white">
        <DialogTitle className="flex items-center justify-between">
          {"Export Rows"}
        </DialogTitle>
        <div className="mt-4 flex flex-col gap-y-3">
          <Button
            variant={"secondary"}
            onClick={() => {
              downloadRows(all);
            }}
          >
            Export all
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              downloadRows(filtered);
            }}
          >
            Export filtered
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              downloadRows(selected);
            }}
          >
            Export selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
