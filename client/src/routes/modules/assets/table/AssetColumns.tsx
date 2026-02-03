import { ColumnDef } from "@tanstack/react-table";
import { AssetRow, Preset, User } from "@shared/schemas";

import { MoreHorizontal, NotebookText, Plus, Wifi } from "lucide-react";

import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";

import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  DuplicateAsset,
  EditAsset,
  DeleteAsset,
} from "../components/ActionDialogs";
import IPView from "@/components/table/IPView";
import NoteView from "@/components/table/NoteView";

const getNameFromID = (array: Preset[] | User[], ID: number | string) => {
  return array.find((item) => ID === item.ID)?.name || "";
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
  if (filterValue.length <= 0) {
    return true;
  }

  const name =
    rowValue == null
      ? "(blank)"
      : items.find((item) => item.ID === rowValue)?.name;

  if (!name) {
    return false;
  }
  return filterValue.includes(name);
};

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
      enableResizing: false,
      size: 36,
      meta: { memo: false },
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "text",
      meta: { type: "text" },
      filterFn: (row, columnId, filterValue) => {
        return textFilterFn(row.getValue(columnId), filterValue);
      },
      size: 200,
    },
    {
      accessorKey: "identifier",
      header: "Identifier",
      sortingFn: "text",
      filterFn: (row, columnId, filterValue) => {
        return textFilterFn(row.getValue(columnId), filterValue);
      },
      meta: { type: "text" },
    },
    {
      accessorKey: "modelID",
      header: "Model",
      cell: ({ row }) => {
        const model = models.find(
          (model) => row.getValue("modelID") === model.ID
        );
        return model ? model.name : "";
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
        return type ? type.name : "";
      },
      sortingFn: (rowA, rowB) => {
        return compareNames(types, rowA.original.typeID, rowB.original.typeID);
      },
      filterFn: (row, columnId, filterValue) => {
        return selectFilterFn(row.getValue(columnId), filterValue, types);
      },
      meta: { type: "select", options: types, canEdit: false },
      size: 100,
    },
    {
      accessorKey: "locationID",
      header: "Location",
      cell: ({ row }) => {
        const location = locations.find(
          (location) => row.getValue("locationID") === location.ID
        );
        return location ? location.name : "";
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
      size: 100,
    },
    {
      accessorKey: "departmentID",
      header: "Department",
      cell: ({ row }) => {
        const department = departments.find(
          (department) => row.getValue("departmentID") === department.ID
        );
        return department ? department.name : "";
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
      size: 100,
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
      enableResizing: false,
      size: 140,
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
      enableResizing: false,
      size: 140,
    },
    {
      id: "ips",
      header: "IPs",
      cell: ({ row }) => (
        <div className="flex items-center hover:scale-110">
          <IPView assetID={row.original.ID} assetName={row.original.name}>
            <Wifi className="h-5 w-5" />
          </IPView>
        </div>
      ),
      meta: { canEdit: false },
      enableResizing: false,
      size: 50,
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => {
        if (row.getValue("cost") == null) return <div />;

        const amount = parseFloat(row.getValue("cost"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="">{formatted}</div>;
      },
      sortingFn: (rowA, rowB) => {
        return (
          parseFloat(String(rowA.original.cost)) -
          parseFloat(String(rowB.original.cost))
        );
      },
      meta: { type: "cost" },
      size: 110,
      enableResizing: false,
    },

    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        return (
          <div className="flex items-center hover:scale-110">
            <NoteView
              currentNote={row.original.note ?? ""}
              ID={row.original.ID}
              rowVersion={row.original.rowVersion}
            >
              <button
                className="group/button"
                aria-label={row.original.note ? "View note" : "Add note"}
              >
                {row.original.note ? (
                  <NotebookText className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5 opacity-0 group-hover:opacity-100 group-focus-visible/button:!opacity-100" />
                )}
              </button>
            </NoteView>
          </div>
        );
      },
      meta: { canEdit: false },
      enableSorting: false,
      enableResizing: false,
      size: 50,
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
        const asset = row.original;

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
              <DropdownMenuSeparator />

              <EditAsset ID={asset.ID}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit Asset
                </DropdownMenuItem>
              </EditAsset>
              <DuplicateAsset row={asset}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Duplicate Asset
                </DropdownMenuItem>
              </DuplicateAsset>
              <DeleteAsset row={asset}>
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete Asset
                </DropdownMenuItem>
              </DeleteAsset>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableResizing: false,
      size: 36,
    },
  ];
};
