import { Button } from "@/components/shadcn-ui/button";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useImport } from "@/context/ImportContext";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { AssetImport, MissingPresets } from "@shared/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

interface PreviewStageProps {
  previousStage: () => void;
  nextStage: () => void;
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
    const [model, type] = preset.split("|");
    return `${model} - ${type}`;
  }
  return preset;
};

export default function PreviewStage({
  previousStage,
  nextStage,
}: PreviewStageProps) {
  const {
    missingPresets,
    setMissingPresets,
    assets,
    setImportedCount,
    setSkippedCount,
  } = useImport();

  const [failedMsg, setFailedMsg] = useState<string | null>();

  const queryClient = useQueryClient();

  const missingPresetKeys = presetKeys.filter(
    (presetKey) => missingPresets[presetKey].length > 0
  );

  const excludeMissingPreset = (
    key: keyof MissingPresets,
    excludePreset: string
  ) => {
    setMissingPresets({
      ...missingPresets,
      [key]: missingPresets[key].filter((preset) => preset !== excludePreset),
    });
  };

  const importAssets = useMutation({
    mutationFn: (data: {
      assets: AssetImport[];
      missingPresets: MissingPresets;
    }) => {
      return axiosApi.post("/api/import/confirm", data);
    },
    onSuccess: (result) => {
      const importedCount = z.number().safeParse(result.data.importedCount);
      const skippedCount = z.number().safeParse(result.data.skippedCount);

      if (!importedCount.error) {
        setImportedCount(importedCount.data);
      } else {
        console.error("Server did not return import count");
        setImportedCount(-1);
      }

      if (!skippedCount.error) {
        setSkippedCount(skippedCount.data);
      } else {
        console.error("Server did not return skipped count");
        setSkippedCount(-1);
      }

      queryClient.invalidateQueries({
        queryKey: ["assetData"],
      });

      nextStage();
    },
  });

  const handleConfirm = async (data: {
    assets: AssetImport[];
    missingPresets: MissingPresets;
  }) => {
    toast
      .promise(importAssets.mutateAsync(data), {
        loading: "Importing assets...",
        success: "Successfully imported assets",
      })
      .unwrap()
      .catch((err) => {
        setFailedMsg("Failed to import assets");
        handleError(err);
      });
  };

  return (
    <div className="flex w-full flex-col gap-y-4 text-white">
      {missingPresetKeys.length > 0 ? (
        <>
          <p className="text-sm font-medium">
            The following presets must be added with the assets: <br />
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
        </>
      ) : (
        <p>No presets will be added.</p>
      )}
      <ul className="text-muted-foreground list-['*_'] px-3 text-sm font-medium italic">
        {missingPresetKeys.length > 0 && (
          <li>Removing presets will exclude any dependent assets </li>
        )}
        <li>Already existing assets will be excluded</li>
        <li>All parsed assets with existing presets will be imported</li>
        <li>
          Only the first occurence of a duplicate model & identifier will be
          imported
        </li>
      </ul>
      <div className="flex items-center justify-end gap-x-2">
        {failedMsg && <p className="font-medium text-red-700">{failedMsg}</p>}
        <Button variant={"secondary"} onClick={previousStage}>
          Go Back
        </Button>
        <Button
          onClick={async () =>
            handleConfirm({
              missingPresets: missingPresets,
              assets: assets,
            })
          }
        >
          {missingPresetKeys.length > 0 ? "Import" : "Confirm"}
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
          <ScrollArea className="h-full rounded-sm border border-white py-1">
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
      className="group flex items-center justify-between rounded-sm px-2 text-sm transition-colors duration-100 hover:bg-zinc-800"
    >
      {getItemName(presetKey, missingPreset)}
      <X
        className="text-muted-foreground h-5 w-5 cursor-pointer opacity-0 transition-opacity duration-100 hover:text-white group-hover:opacity-100"
        onClick={() => excludeMissingPreset(presetKey, missingPreset)}
      />
    </li>
  );
}
