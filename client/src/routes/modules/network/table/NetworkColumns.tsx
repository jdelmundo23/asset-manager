import { IPRow } from "@shared/schemas";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { useContext, useState } from "react";
import IPContext from "@/context/IPContext";
import DeleteIP from "../components/DeleteIP";
import EditIP from "../components/EditIP";
import { Checkbox } from "@/components/shadcn-ui/checkbox";

export const getColumns = (): ColumnDef<IPRow>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="h-4 w-4"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="border-muted-foreground h-4 w-4"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      meta: { type: "text" },
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "text",
      meta: { type: "text" },
    },
    {
      accessorKey: "macAddress",
      header: "MAC Address",
      sortingFn: "text",
      meta: { type: "text" },
    },
    {
      accessorKey: "assetID",
      header: "Asset",
      cell: ({ row }) => {
        return row.original.assetName;
      },
      sortingFn: (rowA, rowB) => {
        return (rowA.original.assetName ?? "").localeCompare(
          rowB.original.assetName ?? ""
        );
      },
      filterFn: (row, columnId, filterValue) => {
        return (row.original.assetName ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      },
      meta: { type: "text", editTable: "assets" },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ip = row.original;

        const { fetcher } = useContext(IPContext);

        const [editOpen, setEditOpen] = useState(false);
        const [deleteOpen, setDeleteOpen] = useState(false);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(ip.ipAddress.toString())
                }
              >
                Copy IP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit IP
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600"
              >
                Delete IP
              </DropdownMenuItem>
            </DropdownMenuContent>
            <EditIP open={editOpen} setOpen={setEditOpen} ip={ip} />
            <DeleteIP
              open={deleteOpen}
              setOpen={setDeleteOpen}
              row={ip}
              fetcher={fetcher}
            />
          </DropdownMenu>
        );
      },
    },
  ];
};
