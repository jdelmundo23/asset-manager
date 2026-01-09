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
import { useState } from "react";
import DeleteIP from "../components/ips/DeleteIP";
import EditIP from "../components/ips/EditIP";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { formatIP } from "@/lib/utils";

const dateFilterFn = (
  rowValue: Date | undefined,
  filterValue: [Date | undefined, Date | undefined]
): boolean => {
  if (filterValue === null) {
    return rowValue === null;
  }
  if (filterValue.some((item: Date | undefined) => item != null)) {
    const [from, to] = filterValue;
    const date: Date | undefined = rowValue;
    if (!date) {
      return false;
    }
    if (from != null && to == null) {
      return date >= from;
    }
    if (from == null && to != null) {
      return date <= to;
    }
    if (from != null && to != null) {
      return date >= from && date <= to;
    }
  }
  return true;
};

const textFilterFn = (rowValue: unknown, filterValue: string) => {
  const val = rowValue;

  if (filterValue === "(blank)") {
    return val == null;
  }

  if (typeof filterValue === "string") {
    if (val == null) return false;

    if (typeof val === "string") {
      return val.toLowerCase().includes(filterValue.toLowerCase());
    }

    return false;
  }
  return true;
};

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
      enableResizing: false,
      size: 36,
      meta: { memo: false },
    },
    {
      id: "ipAddress",
      accessorFn: (row) => formatIP(row),
      header: "IP Address",
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        formatIP(rowA.original).localeCompare(formatIP(rowB.original)),
      filterFn: (row, columnId, filterValue) =>
        formatIP(row.original)
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
      meta: { type: "text" },
      enableResizing: false,
      size: 115,
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "text",
      filterFn: (row, columnId, filterValue) => {
        return textFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "text" },
    },
    {
      accessorKey: "macAddress",
      header: "MAC Address",
      sortingFn: "text",
      filterFn: (row, columnId, filterValue) => {
        return textFilterFn(row.getValue(columnId), filterValue);
      },
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
        return textFilterFn(row.original.assetName, filterValue);
      },
      meta: { type: "text", editTable: "assets" },
    },
    {
      accessorKey: "createdTime",
      header: "Created At",
      cell: ({ row }) => {
        if (!row.original.createdTime) {
          return "";
        }
        const date = new Date(row.getValue("createdTime"));
        return new Intl.DateTimeFormat("en-us", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(date);
      },
      filterFn: (row, columnId, filterValue) => {
        return dateFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "date", canEdit: false },
      enableResizing: false,
      size: 160,
    },
    {
      accessorKey: "updatedTime",
      header: "Updated At",
      cell: ({ row }) => {
        if (!row.original.createdTime) {
          return "";
        }
        const date = new Date(row.getValue("updatedTime"));
        return new Intl.DateTimeFormat("en-us", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(date);
      },
      filterFn: (row, columnId, filterValue) => {
        return dateFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "date", canEdit: false },
      enableResizing: false,
      size: 160,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ip = row.original;

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
                onClick={() => navigator.clipboard.writeText(formatIP(ip))}
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
            <EditIP open={editOpen} setOpen={setEditOpen} ipID={ip.ID} />
            <DeleteIP open={deleteOpen} setOpen={setDeleteOpen} row={ip} />
          </DropdownMenu>
        );
      },
      enableResizing: false,
      size: 36,
    },
  ];
};
