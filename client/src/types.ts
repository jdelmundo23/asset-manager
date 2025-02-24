import { z } from "zod";

export interface Preset {
  ID: number;
  name: string;
  typeID?: number;
}

export const assetSchema = z.object({
  name: z.string().min(2).max(100),
  identifier: z.string().min(2).max(100),
  typeID: z.number(),
  modelID: z.number(),
  locationID: z.number(),
  departmentID: z.number(),
  assignedTo: z.string(),
  purchaseDate: z.coerce.date(),
  warrantyDate: z.coerce.date().optional(),
  ipAddress: z.string().ip().optional(),
  macAddress: z
    .string()
    .regex(
      /^(?:[0-9A-Fa-f]{2}([-:])(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12})$/,
      "Invalid MAC address format",
    )
    .optional(),
  cost: z.number(),
});

export type Asset = z.infer<typeof assetSchema>;

export interface AssetRow extends Asset {
  ID: number;
}
