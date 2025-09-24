import { Button } from "@/components/shadcn-ui/button";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useImport } from "@/context/ImportContext";

import { MissingPresets } from "@shared/schemas";
import { X } from "lucide-react";

interface PreviewStageProps {
  previousStage: () => void;
}

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

const getItemName = (key: keyof MissingPresets, preset: string) => {
  if (key === "modelAndTypes") {
    const [model, type] = preset.split("|").map((str) => str.trim());
    return `${model} - ${type}`;
  }
  return preset;
};

export default function PreviewStage({ previousStage }: PreviewStageProps) {
  const { missingPresets, setMissingPresets } = useImport();

  const excludeMissingPreset = (
    key: keyof MissingPresets,
    excludePreset: string
  ) => {
    setMissingPresets({
      ...missingPresets,
      [key]: missingPresets[key].filter((preset) => preset !== excludePreset),
    });
  };

  const missingPresetKeys = presetKeys.filter(
    (presetKey) => missingPresets[presetKey].length > 0
  );

  return (
    <div className="flex w-full flex-col gap-y-2 text-white">
      {missingPresetKeys.length > 0 ? (
        <>
          <p className="text-sm font-medium">
            The following presets will be added with the assets: <br />
          </p>
          <ResizablePanelGroup
            className="min-h-[400px] rounded-lg py-0.5"
            direction="vertical"
          >
            {missingPresetKeys.map((presetKey, i) => (
              <MissingPresetList
                key={i}
                missingPresets={missingPresets}
                showHandle={i < missingPresetKeys.length - 1}
                presetKey={presetKey}
                excludeMissingPreset={excludeMissingPreset}
              />
            ))}
          </ResizablePanelGroup>
          <p className="text-muted-foreground text-sm font-medium italic">
            * Removing presets will exclude any dependent assets.
          </p>
        </>
      ) : (
        <p>No presets to be added. All parsed assets will be imported.</p>
      )}
      <div className="flex justify-end gap-x-2">
        <Button variant={"secondary"} onClick={previousStage}>
          Go Back
        </Button>
        <Button disabled>
          {missingPresetKeys.length > 0 ? "Import" : "Import"}
        </Button>
      </div>
    </div>
  );
}

interface MissingPresetPresetBase {
  presetKey: keyof MissingPresets;
  excludeMissingPreset: (
    presetKey: keyof MissingPresets,
    missingPreset: string
  ) => void;
}

interface MissingPresetListProps extends MissingPresetPresetBase {
  missingPresets: MissingPresets;
  showHandle: boolean;
}

function MissingPresetList({
  presetKey,
  missingPresets,
  showHandle,
  excludeMissingPreset,
}: MissingPresetListProps) {
  return (
    <>
      <h2 className="font-semibold">
        {labels[presetKey]} ({missingPresets[presetKey].length})
      </h2>
      <ResizablePanel key={presetKey}>
        <div className="flex h-full flex-col">
          <ScrollArea className="h-full rounded-sm border border-white px-2 py-1">
            <ul>
              {missingPresets[presetKey].map((missingPreset) => (
                <PresetItem
                  key={missingPreset}
                  presetKey={presetKey}
                  missingPreset={missingPreset}
                  excludeMissingPreset={excludeMissingPreset}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>
      </ResizablePanel>
      {showHandle && (
        <ResizableHandle className="my-3 hover:bg-white" withHandle />
      )}
    </>
  );
}

interface PresetItemProps {
  presetKey: keyof MissingPresets;
  missingPreset: string;
  excludeMissingPreset: (
    presetKey: keyof MissingPresets,
    missingPreset: string
  ) => void;
}

function PresetItem({
  presetKey,
  missingPreset,
  excludeMissingPreset,
}: PresetItemProps) {
  return (
    <li
      key={missingPreset}
      className="group flex items-center justify-between text-sm"
    >
      {getItemName(presetKey, missingPreset)}
      <X
        className="text-muted-foreground h-5 w-5 cursor-pointer opacity-0 hover:text-white group-hover:opacity-100"
        onClick={() => excludeMissingPreset(presetKey, missingPreset)}
      />
    </li>
  );
}
