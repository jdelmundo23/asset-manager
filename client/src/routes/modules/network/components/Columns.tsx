import { IPRow } from "@shared/schemas";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const getColumns = (): ColumnDef<IPRow>[] => {
  return [
    {
      accessorKey: "ipAddress",
      header: "IP Address",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "macAddress",
      header: "MAC Address",
    },
    {
      accessorKey: "assetID",
      header: "Asset",
      cell: ({ row }) => {
        return row.original.assetName;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Copy Identifier</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>Edit IP</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                Delete IP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
