import { useImport } from "@/context/ImportContext";
import { MissingPresets } from "@shared/schemas";

const presetKeys: (keyof MissingPresets)[] = [
  "modelAndTypes",
  "departments",
  "locations",
];

const labels: Record<keyof MissingPresets, string> = {
  modelAndTypes: "Models and Types",
  departments: "Departments",
  locations: "Locations",
};

export default function PreviewStage() {
  const { missingPresets } = useImport();

  const missingPresetKeys = presetKeys.filter(
    (presetKey) => missingPresets[presetKey].length > 0
  );
  return (
    <div className="w-full text-white">
      <h1>Import Preview</h1>
      {missingPresetKeys.length > 0 ? (
        missingPresetKeys.map((presetKey) => {
          return (
            <div key={presetKey}>
              <h2>{labels[presetKey]}</h2>
              <ul>
                {missingPresets[presetKey].map((missingPreset) => (
                  <li key={missingPreset}>{missingPreset}</li>
                ))}
              </ul>
            </div>
          );
        })
      ) : (
        <div>No presets to be added</div>
      )}
    </div>
  );
}
