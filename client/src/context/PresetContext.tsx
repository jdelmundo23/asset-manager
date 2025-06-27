import { createContext } from "react";
interface PresetContextType {
  activePreset: {
    displayName: string;
    tableName: string;
  };
  presetData: [];
  typeData: [];
}

const PresetContext = createContext<PresetContextType>({
  activePreset: {
    displayName: "",
    tableName: "",
  },
  presetData: [],
  typeData: [],
});

export default PresetContext;
