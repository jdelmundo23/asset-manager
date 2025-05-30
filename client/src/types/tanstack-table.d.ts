import "@tanstack/react-table";
import { Preset, User } from "@shared/schemas";

declare module "@tanstack/react-table" {
  interface ColumnMeta<> {
    type?: "text" | "select" | "date";
    options?: Preset[] | User[];
    canEdit?: boolean;
    editTable?: "assets" | "network";
  }
}
