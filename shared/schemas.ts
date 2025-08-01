import { z } from "zod";

export interface User {
  ID: string;
  name: string;
}

export const presetSchema = z.object({
  ID: z.number().optional(),
  name: z.string().min(2).max(50),
  typeID: z.number().nullish(),
  typeName: z.string().min(2).max(50).nullish(),
});

export const presetRowSchema = presetSchema.extend({
  ID: z.number(),
});

export const assetSchema = z
  .object({
    ID: z.number().optional(),
    name: z.string().min(2).max(100),
    identifier: z.string().min(2).max(100).nullish(),
    typeID: z.number().nullish(),
    modelID: z.number().nullish(),
    locationID: z.number().nullish(),
    departmentID: z.number().nullish(),
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
    "Invalid subnet prefix (ex: '192.168.1')"
  )
  .refine(
    (val) =>
      val.split(".").every((octet) => {
        const n = Number(octet);
        return n >= 0 && n <= 255;
      }),
    { message: "Octet must be between 0 and 255" }
  );

const baseIPSchema = z.object({
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
  name: z.string().min(2).max(100),
  note: z.string().max(255).nullish(),
});

export const ipInputSchema = baseIPSchema.extend({
  ID: z.number().optional(),
  ipAddress: z.string().ip({ message: "Invalid IP Format" }),
});

export const ipRowSchema = baseIPSchema.extend({
  ID: z.number(),
  hostNumber: z
    .number()
    .int()
    .min(1, "Host number must be between 1 and 255")
    .max(255, "Host number must be between 1 and 255"),
  subnetPrefix: subnetPrefixSchema.nullish(),
  subnetID: z.number(),
});

export const ipInsertSchema = ipRowSchema.partial({ ID: true });

export const subnetSchema = z.object({
  ID: z.number().optional(),
  subnetPrefix: subnetPrefixSchema,
  locationID: z.number().nullish(),
  locationName: z.string().min(2).max(50).nullish(),
});

export const subnetRowSchema = subnetSchema.extend({
  ID: z.number(),
});

export type Preset = z.infer<typeof presetSchema>;

export type PresetRow = z.infer<typeof presetRowSchema>;

export type Asset = z.infer<typeof assetSchema>;

export type AssetRow = z.infer<typeof assetRowSchema>;

export type IPInput = z.infer<typeof ipInputSchema>;

export type IPInsert = z.infer<typeof ipInsertSchema>;

export type IPRow = z.infer<typeof ipRowSchema>;

export type Subnet = z.infer<typeof subnetSchema>;

export type SubnetRow = z.infer<typeof subnetRowSchema>;
