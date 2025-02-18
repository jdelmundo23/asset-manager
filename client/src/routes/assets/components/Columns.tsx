import { ColumnDef } from "@tanstack/react-table";
export type Payment = {
  ID: number;
  name: string;
  identifier: string;
  locationID: number;
  departmentID: number;
  modelID: number;
  assignedTo: string;
  purchaseDate: string;
  warrantyDate: string;
  cost: number;
  macAddress: string;
  ipAddress: string;
  note: string;
};

type reference = {
  ID: number;
  name: string;
  typeID?: number;
};

export const getColumns = (
  locations: reference[],
  departments: reference[],
  types: reference[],
  models: reference[]
): ColumnDef<Payment>[] => [
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
      const model = models.find(
        (model) => row.getValue("modelID") === model.ID
      );
      const type = types.find((type) => model?.typeID === type.ID);
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
  },
  {
    accessorKey: "purchaseDate",
    header: "Purchase",
    cell: ({ row }) => {
      const date = new Date(row.getValue("purchaseDate"));
      return new Intl.DateTimeFormat("en-us").format(date);
    },
  },
  {
    accessorKey: "warrantyDate",
    header: "Warranty Exp.",
    cell: ({ row }) => {
      const date = new Date(row.getValue("warrantyDate"));
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

      return <div className="font-medium">{formatted}</div>;
    },
  },
];
