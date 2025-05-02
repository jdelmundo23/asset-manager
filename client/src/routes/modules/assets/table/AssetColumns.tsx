import { ColumnDef } from "@tanstack/react-table";
import { AssetRow, Preset, User } from "@shared/schemas";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";

import { useContext, useState } from "react";
import AssetContext from "@/context/AssetContext";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  DuplicateAsset,
  EditAsset,
  DeleteAsset,
} from "../components/ActionDialogs";

const getNameFromID = (array: Preset[] | User[], ID: number | string) => {
  return array.find((item) => ID === item.ID)?.name || "N/A";
};

const compareNames = (
  array: Preset[] | User[],
  ID1: number | string | null | undefined,
  ID2: number | string | null | undefined
) => {
  const nameA = ID1 != null ? getNameFromID(array, ID1) : "";
  const nameB = ID2 != null ? getNameFromID(array, ID2) : "";
  return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
};

const selectFilterFn = (
  rowValue: unknown,
  filterValue: string[],
  items: Preset[] | User[]
): boolean => {
  const name = items.find((item) => item.ID === rowValue)?.name;
  if (!name) {
    return false;
  }
  if (filterValue.length <= 0) {
    return true;
  }
  return filterValue.includes(name);
};

const dateFilterFn = (
  rowValue: Date | undefined,
  filterValue: [Date | undefined, Date | undefined]
): boolean => {
  if (filterValue.some((item: Date | undefined) => item !== undefined)) {
    const [from, to] = filterValue;
    const date: Date | undefined = rowValue;
    if (!date) {
      return false;
    }
    if (from !== undefined && to === undefined) {
      return date >= from;
    }
    if (from === undefined && to !== undefined) {
      return date <= to;
    }
    if (from !== undefined && to !== undefined) {
      return date >= from && date <= to;
    }
  }
  return true;
};

export const getColumns = (
  locations: Preset[] = [],
  departments: Preset[] = [],
  types: Preset[] = [],
  models: Preset[] = [],
  users: User[] = []
): ColumnDef<AssetRow>[] => {
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
      accessorKey: "name",
      header: "Name",
      sortingFn: "text",
      meta: { type: "text" },
    },
    {
      accessorKey: "identifier",
      header: "Identifier",
      sortingFn: "text",
      meta: { type: "text" },
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
      sortingFn: (rowA, rowB) => {
        return compareNames(
          models,
          rowA.original.modelID,
          rowB.original.modelID
        );
      },
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, models);
      },
      meta: { type: "select", options: models },
    },
    {
      accessorKey: "typeID",
      header: "Type",
      cell: ({ row }) => {
        const type = types.find((type) => row.getValue("typeID") === type.ID);
        return type ? type.name : "N/A";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(types, rowA.original.typeID, rowB.original.typeID);
      },
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, types);
      },
      meta: { type: "select", options: types },
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
      sortingFn: (rowA, rowB) => {
        return compareNames(
          locations,
          rowA.original.locationID,
          rowB.original.locationID
        );
      },
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, locations);
      },
      meta: { type: "select", options: locations },
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
      sortingFn: (rowA, rowB) => {
        return compareNames(
          departments,
          rowA.original.departmentID,
          rowB.original.departmentID
        );
      },
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, departments);
      },
      meta: { type: "select", options: departments },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
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
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, users);
      },
      meta: { type: "select", options: users },
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) => {
        if (!row.original.purchaseDate) {
          return "";
        }
        const date = new Date(row.getValue("purchaseDate"));
        return new Intl.DateTimeFormat("en-us").format(date);
      },
      filterFn: (row, columnId, filterValue) => {
        return dateFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "date" },
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
      sortingFn: "datetime",
      filterFn: (row, columnId, filterValue) => {
        return dateFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "date" },
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("cost"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="">{formatted}</div>;
      },
      sortingFn: (rowA, rowB) => {
        return parseFloat(rowA.original.cost) - parseFloat(rowB.original.cost);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const asset = row.original;

        const [editOpen, setEditOpen] = useState(false);
        const [duplicateOpen, setDuplicateOpen] = useState(false);
        const [deleteOpen, setDeleteOpen] = useState(false);

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Edit Asset
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
                Duplicate Asset
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600"
              >
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>

            <EditAsset open={editOpen} setOpen={setEditOpen} asset={asset} />
            <DeleteAsset
              open={deleteOpen}
              setOpen={setDeleteOpen}
              row={asset}
            />
            <DuplicateAsset
              open={duplicateOpen}
              setOpen={setDuplicateOpen}
              row={asset}
            />
          </DropdownMenu>
        );
      },
    },
  ];
};
