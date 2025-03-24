import z from "zod";

export const assetSchema = z
  .object({
    ID: z.number().optional(),
    name: z.string().min(2).max(100),
    identifier: z.string().min(2).max(100),
    typeID: z.number(),
    modelID: z.number(),
    locationID: z.number(),
    departmentID: z.number(),
    assignedTo: z.string(),
    purchaseDate: z.coerce.date(),
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
        return data.purchaseDate < data.warrantyExp;
      }
      return true;
    },
    {
      message: "Must be after purchase date",
      path: ["warrantyExp"],
    }
  );

export type Asset = z.infer<typeof assetSchema>;
