import { z } from "zod";

const nullableDate = z.union([z.string(), z.null()]).transform((val) => {
  if (val === null || val.trim() === "") return null;
  return new Date(val);
});

export const presetTableSchema = z.enum([
  "departments",
  "locations",
  "assetmodels",
  "assettypes",
]);

const trimmedString = (min: number, max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(min).max(max)
  );

export const userSchema = z.object({
  ID: z.string().uuid(),
  name: z.string().max(255),
  last_sync: z.coerce.date(),
  active: z.boolean(),
});

export const presetSchema = z.object({
  ID: z.number().optional(),
  name: trimmedString(2, 50),
  typeID: z.number().nullish(),
  typeName: z.string().min(2).max(50).nullish(),
});

export const presetRowSchema = presetSchema.extend({
  ID: z.number(),
});

export const missingPresetsSchema = z.object({
  modelAndTypes: z.array(z.string()),
  departments: z.array(z.string()),
  locations: z.array(z.string()),
});

export const assetImportSchema = z
  .object({
    rowNumber: z.number(),
    Name: trimmedString(2, 100),
    Identifier: trimmedString(2, 100).nullish(),
    Type: trimmedString(2, 50),
    Model: trimmedString(2, 50),
    Location: trimmedString(2, 50),
    Department: trimmedString(2, 50),
    "Assigned To": trimmedString(0, 255).nullish(),
    "Purchase Date": nullableDate,
    "Warranty Exp": nullableDate,
    Cost: z
      .union([
        z
          .string()
          .transform((x) =>
            x.trim() === "" ? null : x.replace(/[^0-9.-]+/g, "")
          ),
        z.number(),
        z.null(),
      ])
      .pipe(
        z.coerce
          .number()
          .min(0.01, "Minimum cost is 0.01")
          .refine((v) => v <= 9999.99, "Maximum cost is 9999.99")
          .transform((v) => parseFloat(v.toFixed(2)))
      )
      .nullable(),
    Note: trimmedString(0, 255).nullish(),
  })
  .refine(
    (data) => {
      if (data["Warranty Exp"] && data["Purchase Date"]) {
        return data["Purchase Date"] < data["Warranty Exp"];
      }
      return true;
    },
    {
      message: "Must be after purchase date",
      path: ["Warranty Exp"],
    }
  );

export const skippedRowSchema = z.object({
  rowNumber: z.number(),
  identifier: z.string().min(2).max(100).nullish(),
  reason: z.string().min(1),
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
    assignedTo: z.string().uuid().nullish(),
    purchaseDate: z.coerce.date().nullish(),
    warrantyExp: z.coerce.date().nullish(),
    note: z.string().max(255).nullish(),
    cost: z
      .union([
        z
          .string()
          .transform((x) =>
            x.trim() === "" ? null : x.replace(/[^0-9.-]+/g, "")
          ),
        z.number(),
        z.null(),
      ])
      .pipe(
        z.coerce
          .number()
          .min(0.0, "Minimum cost is 0.01")
          .refine((v) => v <= 9999.99, "Maximum cost is 9999.99")
          .transform((v) => parseFloat(v.toFixed(2)))
      )
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.warrantyExp && data.purchaseDate) {
        return data.purchaseDate < data.warrantyExp;
      }
      return true;
    },
    {
      message: "Must be after purchase date",
      path: ["warrantyExp"],
    }
  );

export const assetSummarySchema = z.object({
  ID: z.number(),
  name: z.string().min(2).max(100),
  identifier: z.string().min(2).max(100).nullish(),
  typeName: z.string().min(2).max(50).nullish(),
  modelName: z.string().min(2).max(50).nullish(),
  locationName: z.string().min(2).max(50).nullish(),
});

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

export type SkippedRow = z.infer<typeof skippedRowSchema>;

export type PresetTable = z.infer<typeof presetTableSchema>;

export type User = z.infer<typeof userSchema>;

export type Preset = z.infer<typeof presetSchema>;

export type PresetRow = z.infer<typeof presetRowSchema>;

export type MissingPresets = z.infer<typeof missingPresetsSchema>;

export type AssetImport = z.infer<typeof assetImportSchema>;

export type Asset = z.infer<typeof assetSchema>;

export type AssetSummary = z.infer<typeof assetSummarySchema>;

export type AssetRow = z.infer<typeof assetRowSchema>;

export type IPInput = z.infer<typeof ipInputSchema>;

export type IPInsert = z.infer<typeof ipInsertSchema>;

export type IPRow = z.infer<typeof ipRowSchema>;

export type Subnet = z.infer<typeof subnetSchema>;

export type SubnetRow = z.infer<typeof subnetRowSchema>;
