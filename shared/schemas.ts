import { z } from "zod";

const nullableDate = z.union([z.string(), z.null()]).transform((val) => {
  if (val === null || val.trim() === "") return null;
  return new Date(val);
});

const bufferConversion = z
  .union([z.string(), z.instanceof(Buffer)])
  .transform((val) => {
    if (Buffer.isBuffer(val)) {
      return val.toString("base64");
    }
    return val;
  });

export const presetTableSchema = z.enum([
  "departments",
  "locations",
  "assetmodels",
  "assettypes",
]);

export const trimmedString = (min: number, max: number) =>
  z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;

      return val.trim().replace(/\s+/g, " ");
    },
    z
      .string()
      .min(min, { message: `Must be at least ${min} characters` })
      .max(max, { message: `Cannot exceed ${max} characters` })
  );

export const nullishTrimmedString = (min: number, max: number) =>
  z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;

      const trimmed = val.trim().replace(/\s+/g, " ");
      return trimmed === "" ? null : trimmed;
    },
    z
      .string()
      .min(min, { message: `Must be at least ${min} characters` })
      .max(max, { message: `Cannot exceed ${max} characters` })
      .nullish()
  );

export const userSchema = z.object({
  ID: z.string().uuid(),
  name: z.string().max(255),
  last_sync: z.coerce.date(),
  active: z.boolean(),
});

export const presetSchema = z.object({
  ID: z.number().optional(),
  rowVersion: bufferConversion.optional(),
  name: trimmedString(2, 50),
  typeID: z.number().nullish(),
  typeName: nullishTrimmedString(2, 50),
});

export const presetRowSchema = presetSchema.extend({
  ID: z.number(),
  rowVersion: bufferConversion,
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
    Identifier: nullishTrimmedString(2, 100),
    Type: trimmedString(2, 50),
    Model: trimmedString(2, 50),
    Location: trimmedString(2, 50),
    Department: trimmedString(2, 50),
    "Assigned To": nullishTrimmedString(0, 255),
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
        z.undefined(),
      ])
      .pipe(
        z.coerce
          .number()
          .min(0.0, "Minimum cost is 0.00")
          .refine((v) => v <= 9999.99, "Maximum cost is 9999.99")
          .transform((v) => parseFloat(v.toFixed(2)))
      )
      .nullable(),
    Note: nullishTrimmedString(0, 255),
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
  identifier: nullishTrimmedString(2, 100),
  reason: trimmedString(1, 255),
});

export const assetSchema = z
  .object({
    ID: z.number().optional(),
    rowVersion: bufferConversion.optional(),
    createdTime: z.coerce.date().optional(),
    updatedTime: z.coerce.date().optional(),
    name: trimmedString(2, 100),
    identifier: nullishTrimmedString(2, 100),
    typeID: z.number().nullish(),
    modelID: z.number().nullish(),
    locationID: z.number().nullish(),
    departmentID: z.number().nullish(),
    assignedTo: z.string().uuid().nullish(),
    purchaseDate: z.coerce.date().nullish(),
    warrantyExp: z.coerce.date().nullish(),
    note: nullishTrimmedString(0, 255),
    cost: z
      .union([
        z
          .string()
          .transform((x) =>
            x.trim() === "" ? null : x.replace(/[^0-9.-]+/g, "")
          ),
        z.number(),
        z.null(),
        z.undefined(),
      ])
      .pipe(
        z.coerce
          .number()
          .min(0.0, "Minimum cost is 0.00")
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
  name: trimmedString(2, 100),
  identifier: nullishTrimmedString(2, 100),
  typeName: nullishTrimmedString(2, 50),
  modelName: nullishTrimmedString(2, 50),
  locationName: nullishTrimmedString(2, 50),
});

export const assetRowSchema = assetSchema.innerType().extend({
  ID: z.number(),
  rowVersion: bufferConversion,
  createdTime: z.coerce.date(),
  updatedTime: z.coerce.date(),
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
    .transform((val) => (val === "" ? null : val))
    .nullish(),
  assetID: z.number().nullish(),
  assetName: nullishTrimmedString(2, 100),
  name: trimmedString(2, 100),
  note: nullishTrimmedString(0, 255),
});

export const ipInputSchema = baseIPSchema.extend({
  ID: z.number().optional(),
  rowVersion: z.string().optional(),
  ipAddress: z.string().ip({ message: "Invalid IP Format" }),
});

export const ipRowSchema = baseIPSchema.extend({
  ID: z.number(),
  rowVersion: bufferConversion,
  createdTime: z.coerce.date(),
  updatedTime: z.coerce.date(),
  hostNumber: z
    .number()
    .int()
    .min(1, "Host number must be between 1 and 255")
    .max(255, "Host number must be between 1 and 255"),
  subnetPrefix: subnetPrefixSchema.nullish(),
  subnetID: z.number(),
});

export const ipInsertSchema = ipRowSchema.partial({
  ID: true,
  rowVersion: true,
  createdTime: true,
  updatedTime: true,
});

export const subnetSchema = z.object({
  ID: z.number().optional(),
  rowVersion: bufferConversion.optional(),
  subnetPrefix: subnetPrefixSchema,
  locationID: z.number().nullish(),
  locationName: nullishTrimmedString(2, 50),
});

export const subnetRowSchema = subnetSchema.extend({
  ID: z.number(),
  rowVersion: bufferConversion,
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
