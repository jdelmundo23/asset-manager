import { Separator } from "@/components/shadcn-ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { useEffect, useState } from "react";
import { Card } from "@/components/shadcn-ui/card";
import AddPreset from "./components/AddPreset";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";

import PresetContext from "@/context/PresetContext";
import Row from "./components/Row";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PresetRow } from "@shared/schemas";

const presets = [
  { displayName: "Types", tableName: "assettypes" },
  { displayName: "Departments", tableName: "departments" },
  { displayName: "Locations", tableName: "locations" },
  { displayName: "Models", tableName: "assetmodels" },
];

function Page() {
  const [tabValue, setTabValue] = useState<string>("");
  const table = presets.find((preset) => preset.displayName === tabValue);

  const presetQuery = useQuery({
    queryKey: ["preset", table?.tableName],
    queryFn: () =>
      axiosApi.get(`/api/presets/${table?.tableName}`).then((res) => res.data),
    enabled: !!table?.tableName,
  });

  useEffect(() => {
    if (presetQuery.isError) {
      handleError(presetQuery.error);
    }
  }, [presetQuery.isError, presetQuery.error]);

  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex w-11/12 flex-col items-center py-10 md:w-3/5">
      <div className="animate-fade-in flex w-full max-w-md items-center justify-start">
        <ChevronLeft
          onClick={() => navigate("/app")}
          className="cursor-pointer transition-all duration-150 hover:scale-125"
        />
        <h1 className="text-center text-2xl font-medium">Presets</h1>
      </div>

      <Separator className="animate-fade-in my-4 max-w-md" />
      <Tabs
        defaultValue="blank"
        className="animate-fade-in-up w-full max-w-md"
        onValueChange={(value) => setTabValue(value)}
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
              presetData: presetQuery.data,
            }}
          >
            <TabsContent value={preset.displayName}>
              <Card className="h-96">
                <ScrollArea className="h-full w-full rounded-md font-medium">
                  {presetQuery.isLoading ? (
                    <div className="flex flex-col space-y-3 p-4">
                      <Skeleton className="h-8 w-full rounded-xl" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                      <Skeleton className="h-8 w-full rounded-xl" />
                    </div>
                  ) : (
                    <div className="animate-fade-in flex flex-col space-y-3 p-4 duration-150">
                      {presetQuery?.data?.map((row: PresetRow) => (
                        <Row key={row.ID} preset={row} />
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
