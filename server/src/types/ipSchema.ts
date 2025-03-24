import z from "zod";
export const IPSchema = z.object({
  ID: z.number().optional(),
  name: z.string().min(2).max(100),
  ipAddress: z
    .union([z.string().ip(), z.literal("")])
    .optional()
    .nullable()
    .transform((value) => value ?? ""),
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
});

export type IP = z.infer<typeof IPSchema>;
