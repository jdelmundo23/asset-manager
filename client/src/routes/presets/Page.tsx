import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import AddPreset from "./AddPreset";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeletePreset from "./DeletePreset";
import EditPreset from "./EditPreset";
import axios from "axios";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

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
  const [data, setData] = useState([]);
  const [typeData, setTypeData] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleTabChange = async (tabValue: string) => {
    const table = presets.find((preset) => preset.displayName === tabValue);
    if (table) {
      try {
        setIsLoading(true);
        const result = await axios.get(
          `${apiUrl}/api/presets/${table.tableName}`
        );
        setData(result.data);

        if (tabValue === "Models") {
          const result = await axios.get(`${apiUrl}/api/presets/assettypes`);
          setTypeData(result.data);
        } else {
          setTypeData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="dark container mx-auto w-11/12 py-10 md:w-3/5">
      <h4 className="text-xl font-medium leading-none">Presets</h4>
      <p className="text-muted-foreground">
        Manage the presets used for asset columns.
      </p>
      <Separator className="my-4" />
      <Tabs
        defaultValue="blank"
        className="w-full max-w-md"
        onValueChange={handleTabChange}
      >
        <TabsList>
          {presets.map((preset) => (
            <TabsTrigger key={preset.displayName} value={preset.displayName}>
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
          <TabsContent key={preset.displayName} value={preset.displayName}>
            <Card className="h-96">
              {isLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <LoaderCircle
                    className="h-10 w-10 animate-spin"
                    color="gray"
                  />
                </div>
              ) : (
                <ScrollArea className="h-full w-full rounded-md font-medium">
                  <div className="flex flex-col space-y-3 p-4">
                    {data.map((row: tableRow) => {
                      const type =
                        (
                          typeData.find(
                            (typeRow: tableRow) => typeRow.ID === row.typeID
                          ) as tableRow | undefined
                        )?.name || "";

                      return (
                        <div key={row.name}>
                          <Card className="border-zinc-700 bg-zinc-100 px-2 py-1 font-semibold text-black">
                            <div className="group flex items-center justify-between">
                              <p
                                title={row.name}
                                className="w-5/6 max-w-[200px] truncate lg:max-w-[300px]"
                              >
                                {row.name}
                                {preset.displayName === "Models" ? (
                                  <p className="text-sm font-medium">{type}</p>
                                ) : (
                                  ""
                                )}
                              </p>
                              <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-out group-hover:opacity-100">
                                <EditPreset
                                  preset={preset}
                                  presetName={row.name}
                                  presetType={type}
                                  reloadData={() =>
                                    handleTabChange(preset.displayName)
                                  }
                                  typeData={typeData || []}
                                />
                                <DeletePreset
                                  preset={preset}
                                  presetName={row.name}
                                  reloadData={() =>
                                    handleTabChange(preset.displayName)
                                  }
                                />
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                    <AddPreset
                      preset={preset}
                      reloadData={() => handleTabChange(preset.displayName)}
                      typeData={typeData}
                    />
                  </div>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default Page;
