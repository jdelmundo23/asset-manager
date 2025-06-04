import { z } from "zod";
export interface Preset {
  ID: number;
  name: string;
  typeID?: number;
}

export interface User {
  ID: string;
  name: string;
}

export const assetSchema = z
  .object({
    ID: z.number().optional(),
    name: z.string().min(2).max(100),
    identifier: z.string().min(2).max(100).nullable(),
    typeID: z.number().nullable(),
    modelID: z.number().nullable(),
    locationID: z.number().nullable(),
    departmentID: z.number().nullable(),
    assignedTo: z.string().nullish(),
    purchaseDate: z.coerce.date().nullish(),
    warrantyExp: z.coerce.date().nullish(),
    cost: z
      .union([
        z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
        z.number(),
      ])
      .pipe(z.coerce.number().min(0.01).max(9999))
      .transform((num) => num.toString()),
  })
  .refine(
    (data) => {
      if (data.warrantyExp) {
        return (
          data.purchaseDate != null && data.purchaseDate < data.warrantyExp
        );
      }
      return true;
    },
    {
      message: "Must be after purchase date",
      path: ["warrantyExp"],
    }
  );

export const assetRowSchema = assetSchema.innerType().extend({
  ID: z.number(),
});

const subnetPrefixSchema = z
  .string()
  .regex(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
    "Invalid subnet prefix (must be like '192.168.1')"
  )
  .refine(
    (val) =>
      val.split(".").every((octet) => {
        const n = Number(octet);
        return n >= 0 && n <= 255;
      }),
    { message: "Each octet must be between 0 and 255" }
  );

export const ipSchema = z.object({
  ID: z.number().optional(),
  hostNumber: z
    .number()
    .int()
    .min(1, "Host number must be between 1 and 255")
    .max(255, "Host number must be between 1 and 255"),
  name: z.string().min(2).max(100),
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
    .nullish()
    .transform((value) => value ?? ""),
  assetID: z.number().nullish(),
  assetName: z.string().min(2).max(100).nullish(),
  subnetPrefix: subnetPrefixSchema.nullish(),
  subnetID: z.number(),
});

export const ipRowSchema = ipSchema.extend({
  ID: z.number(),
});

export const subnetSchema = z.object({
  ID: z.number().optional(),
  subnetPrefix: subnetPrefixSchema,
  locationID: z.number().nullable(),
});

export const subnetRowSchema = subnetSchema.extend({
  ID: z.number(),
});

export type Asset = z.infer<typeof assetSchema>;

export type AssetRow = z.infer<typeof assetRowSchema>;

export type IP = z.infer<typeof ipSchema>;

export type IPRow = z.infer<typeof ipRowSchema>;

export type Subnet = z.infer<typeof subnetSchema>;

export type SubnetRow = z.infer<typeof subnetRowSchema>;
