import { ColumnDef } from "@tanstack/react-table";
import { AssetRow, Preset, User } from "@/types";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { handleAssetAction } from "./Actions";
import { useContext, useState } from "react";
import AssetContext from "@/context/AssetContext";
import EditAsset from "./EditAsset";

function getTypeID(modelID: number, models: Preset[]) {
  return models.find((model) => model.ID === modelID)?.typeID ?? 0;
}

export const getColumns = (
  locations: Preset[],
  departments: Preset[],
  types: Preset[],
  models: Preset[],
  users: User[]
): ColumnDef<AssetRow>[] => {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "identifier",
      header: "Identifier",
    },
    {
      accessorKey: "modelID",
      header: "Model",
      cell: ({ row }) => {
        const model = models.find(
          (model) => row.getValue("modelID") === model.ID
        );
        return model ? model.name : "N/A";
      },
    },
    {
      accessorKey: "typeID",
      header: "Type",
      cell: ({ row }) => {
        const type = types.find(
          (type) => type.ID === getTypeID(row.original.modelID, models)
        );
        return type ? type.name : "N/A";
      },
    },
    {
      accessorKey: "locationID",
      header: "Location",
      cell: ({ row }) => {
        const location = locations.find(
          (location) => row.getValue("locationID") === location.ID
        );
        return location ? location.name : "N/A";
      },
    },
    {
      accessorKey: "departmentID",
      header: "Department",
      cell: ({ row }) => {
        const department = departments.find(
          (department) => row.getValue("departmentID") === department.ID
        );
        return department ? department.name : "N/A";
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => {
        return (
          users.find((user) => user.ID === row.getValue("assignedTo"))?.value ||
          row.getValue("assignedTo")
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase",
      cell: ({ row }) => {
        if (!row.original.purchaseDate) {
          return "";
        }
        const date = new Date(row.getValue("purchaseDate"));
        return new Intl.DateTimeFormat("en-us").format(date);
      },
    },
    {
      accessorKey: "warrantyExp",
      header: "Warranty Exp.",
      cell: ({ row }) => {
        if (!row.original.warrantyExp) {
          return "";
        }
        const date = new Date(row.getValue("warrantyExp"));
        return new Intl.DateTimeFormat("en-us").format(date);
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
    },
    {
      accessorKey: "macAddress",
      header: "MAC Address",
    },
    {
      accessorKey: "cost",
      header: () => <div>Cost</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("cost"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const asset = row.original;

        const { fetcher } = useContext(AssetContext);

        const [alertOpen, setAlertOpen] = useState(false);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-6 h-6 p-0 ">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(asset.identifier.toString())
                }
              >
                Copy Identifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAlertOpen(true)}>
                Edit Asset
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() =>
                  handleAssetAction("delete", row.original, fetcher)
                }
              >
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>

            <EditAsset
              open={alertOpen}
              setOpen={setAlertOpen}
              asset={{
                ...row.original,
                typeID: getTypeID(row.original.modelID, models),
              }}
            />
          </DropdownMenu>
        );
      },
    },
  ];
};
