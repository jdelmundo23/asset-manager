import { createContext } from "react";
interface PresetContextType {
  activePreset: {
    displayName: string;
    tableName: string;
  };
  presetData: [];
  reloadData: () => void;
  typeData: [];
}

const PresetContext = createContext<PresetContextType>({
  activePreset: {
    displayName: "",
    tableName: "",
  },
  presetData: [],
  reloadData: () => {},
  typeData: [],
});

export default PresetContext;
