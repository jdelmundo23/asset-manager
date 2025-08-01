import { PresetRow } from "@shared/schemas";
import { createContext } from "react";
interface PresetContextType {
  activePreset: {
    displayName: string;
    tableName: string;
  };
  presetData: PresetRow[];
}

const PresetContext = createContext<PresetContextType>({
  activePreset: {
    displayName: "",
    tableName: "",
  },
  presetData: [],
});

export default PresetContext;
