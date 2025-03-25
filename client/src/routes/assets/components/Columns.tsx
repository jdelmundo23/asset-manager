import { Column, ColumnDef } from "@tanstack/react-table";
import { AssetRow, Preset, User } from "@shared/schemas";

import { MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

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

const filterHeader = (column: Column<AssetRow, unknown>, header: string) => {
  let arrow: JSX.Element = <></>;
  switch (column.getIsSorted()) {
    case false:
      arrow = (
        <ArrowUpDown
          className={`h-4 w-4 cursor-pointer opacity-0 group-hover:opacity-100 rounded-sm hover:bg-zinc-700`}
          onClick={() => column.toggleSorting(false)}
        />
      );
      break;
    case "asc":
      arrow = (
        <ArrowUp
          className={`h-4 w-4 cursor-pointer rounded-sm hover:bg-zinc-700`}
          onClick={() => column.toggleSorting(true)}
        />
      );
      break;
    case "desc":
      arrow = (
        <ArrowDown
          className={`h-4 w-4 cursor-pointer  rounded-sm hover:bg-zinc-700`}
          onClick={() => column.toggleSorting(false)}
        />
      );
      break;
  }
  return (
    <div className="flex justify-between items-center group">
      {header}
      {arrow}
    </div>
  );
};

const getNameFromID = (array: Preset[] | User[], ID: number | string) => {
  return array.find((item) => ID === item.ID)?.name || "N/A";
};

const compareNames = (
  array: Preset[] | User[],
  ID1: number | string,
  ID2: number | string
) => {
  const nameA = getNameFromID(array, ID1);
  const nameB = getNameFromID(array, ID2);
  return nameA.localeCompare(nameB);
};

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
      header: ({ column }) => {
        return filterHeader(column, "Name");
      },
    },
    {
      accessorKey: "identifier",
      header: ({ column }) => {
        return filterHeader(column, "Identifier");
      },
    },
    {
      accessorKey: "modelID",
      header: ({ column }) => {
        return filterHeader(column, "Model");
      },
      cell: ({ row }) => {
        const model = models.find(
          (model) => row.getValue("modelID") === model.ID
        );
        return model ? model.name : "N/A";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(
          models,
          rowA.original.modelID,
          rowB.original.modelID
        );
      },
    },
    {
      accessorKey: "typeID",
      header: ({ column }) => {
        return filterHeader(column, "Type");
      },
      cell: ({ row }) => {
        const type = types.find((type) => row.getValue("typeID") === type.ID);
        return type ? type.name : "N/A";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(types, rowA.original.typeID, rowB.original.typeID);
      },
    },
    {
      accessorKey: "locationID",
      header: ({ column }) => {
        return filterHeader(column, "Location");
      },
      cell: ({ row }) => {
        const location = locations.find(
          (location) => row.getValue("locationID") === location.ID
        );
        return location ? location.name : "N/A";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(
          locations,
          rowA.original.locationID,
          rowB.original.locationID
        );
      },
    },
    {
      accessorKey: "departmentID",
      header: ({ column }) => {
        return filterHeader(column, "Department");
      },
      cell: ({ row }) => {
        const department = departments.find(
          (department) => row.getValue("departmentID") === department.ID
        );
        return department ? department.name : "N/A";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(
          departments,
          rowA.original.departmentID,
          rowB.original.departmentID
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => {
        return filterHeader(column, "Assigned To");
      },
      cell: ({ row }) => {
        return (
          users.find((user) => user.ID === row.getValue("assignedTo"))?.name ||
          row.getValue("assignedTo")
        );
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(
          users,
          rowA.original.assignedTo,
          rowB.original.assignedTo
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: ({ column }) => {
        return filterHeader(column, "Purchase Date");
      },
      cell: ({ row }) => {
        if (!row.original.purchaseDate) {
          return "";
        }
        const date = new Date(row.getValue("purchaseDate"));
        return new Intl.DateTimeFormat("en-us").format(date);
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "warrantyExp",
      header: ({ column }) => {
        return filterHeader(column, "Warranty Exp.");
      },
      cell: ({ row }) => {
        if (!row.original.warrantyExp) {
          return "";
        }
        const date = new Date(row.getValue("warrantyExp"));
        return new Intl.DateTimeFormat("en-us").format(date);
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "cost",
      header: ({ column }) => {
        return filterHeader(column, "Cost");
      },
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
              }}
            />
          </DropdownMenu>
        );
      },
    },
  ];
};
