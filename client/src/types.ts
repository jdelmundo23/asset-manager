import { z } from "zod";export interface Preset {
  ID: number;
  name: string;
  typeID?: number;
}

export interface User {
  ID: string;
  value: string;
}

export const assetSchema = z.object({
  ID: z.number().optional(),
  name: z.string().min(2).max(100),
  identifier: z.string().min(2).max(100),
  typeID: z.number(),
  modelID: z.number(),
  locationID: z.number(),
  departmentID: z.number(),
  assignedTo: z.string(),
  purchaseDate: z.coerce.date(),
  warrantyExp: z.coerce.date().optional(),
  ipAddress: z.union([z.string().ip(), z.literal("")]).optional(),
  macAddress: z
    .union([
      z
        .string()
        .regex(
          /^(?:[0-9A-Fa-f]{2}([-:])(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12})$/,
          "Invalid MAC address format"
        ),
      z.literal(""),
    ])
    .optional(),
  cost: z.string(),
});

export type Asset = z.infer<typeof assetSchema>;

export interface AssetRow extends Asset {
  ID: number;
}
