import { Separator } from "@/components/shadcn-ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { useState } from "react";
import { Card } from "@/components/shadcn-ui/card";
import AddPreset from "./components/AddPreset";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";

import PresetContext from "@/context/PresetContext";
import Row from "./components/Row";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

interface tableRow {
  ID: number;
  name: string;
  typeID?: number;
}
const presets = [
  { displayName: "Types", tableName: "assettypes" },
  { displayName: "Departments", tableName: "departments" },
  { displayName: "Locations", tableName: "locations" },
  { displayName: "Models", tableName: "assetmodels" },
];

function Page() {
  const [data, setData] = useState<[]>([]);
  const [typeData, setTypeData] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleTabChange = async (tabValue: string) => {
    const table = presets.find((preset) => preset.displayName === tabValue);
    if (table) {
      try {
        setIsLoading(true);
        const result = await axiosApi.get(`/api/presets/${table.tableName}`);
        setData(result.data);

        if (tabValue === "Models") {
          const result = await axiosApi.get(`/api/presets/assettypes`);
          setTypeData(result.data);
        } else {
          setTypeData([]);
        }
      } catch (error) {
        setData([]);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto w-11/12 py-10 md:w-3/5">
      <h1 className="text-2xl font-medium">Presets</h1>
      <p className="text-muted-foreground">
        Manage the presets used for asset columns.
      </p>
      <Separator className="my-4" />
      <Tabs
        defaultValue="blank"
        className="w-full max-w-md"
        onValueChange={handleTabChange}
      >
        <TabsList className="w-full justify-between">
          {presets.map((preset) => (
            <TabsTrigger
              key={preset.displayName}
              value={preset.displayName}
              className="flex-1"
            >
              {preset.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="blank">
          <Card className="flex h-96 items-center justify-center">
            <p className="font-semibold text-zinc-500">
              Select a preset to view
            </p>
          </Card>
        </TabsContent>
        {presets.map((preset) => (
          <PresetContext.Provider
            key={preset.displayName}
            value={{
              activePreset: {
                displayName: preset.displayName,
                tableName: preset.tableName,
              },
              presetData: data,
              typeData: typeData,
              reloadData: () => handleTabChange(preset.displayName),
            }}
          >
            <TabsContent value={preset.displayName}>
              <Card className="h-96">
                <ScrollArea className="h-full w-full rounded-md font-medium">
                  {isLoading ? (
                    <div className="flex flex-col space-y-3 p-4">
                      <Skeleton className="h-8 w-full rounded-xl" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                    </div>
                  ) : (
                    <div className="animate-fade-in flex flex-col space-y-3 p-4">
                      {data.map((row: tableRow) => (
                        <Row key={row.ID} row={row} />
                      ))}

                      <AddPreset />
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>
          </PresetContext.Provider>
        ))}
      </Tabs>
    </div>
  );
}

export default Page;
