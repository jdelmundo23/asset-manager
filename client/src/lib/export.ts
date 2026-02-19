import { AssetImport, AssetRow } from "@shared/schemas";

const getNameFromID = (
  map: Record<number | string, string>,
  ID: number | string | undefined | null
): string => {
  if (ID == null) return "";
  return map[ID] ?? "";
};

export const mapAssetToExport = (
  asset: AssetRow,
  lookups: {
    models: Record<number | string, string>;
    locations: Record<number | string, string>;
    departments: Record<number | string, string>;
    types: Record<number | string, string>;
    users: Record<number | string, string>;
  }
): AssetImport => ({
  rowNumber: 0,
  Name: asset.name,
  Identifier: asset.identifier,
  Location: getNameFromID(lookups.locations, asset.locationID),
  Department: getNameFromID(lookups.departments, asset.departmentID),
  Model: getNameFromID(lookups.models, asset.modelID),
  Type: getNameFromID(lookups.types, asset.typeID),
  "Assigned To": getNameFromID(lookups.users, asset.assignedTo),
  "Purchase Date": asset.purchaseDate ?? null,
  "Warranty Exp": asset.warrantyExp ?? null,
  Cost: asset.cost,
  Note: asset.note,
});
