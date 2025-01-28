import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import AddPreset from "./AddPreset";
import { ScrollArea } from "@/components/ui/scroll-area";

interface tableRow {
  name: string;
}
const presets = [
  { displayName: "Types", tableName: "assettypes" },
  { displayName: "Departments", tableName: "departments" },
  { displayName: "Locations", tableName: "locations" },
  { displayName: "Models", tableName: "assetmodels" },
];

function Page() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleTabChange = async (tabValue: string) => {
    const table = presets.find((preset) => preset.displayName === tabValue);
    if (table) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/presets/${table.tableName}`);
        const result = await response.json();
        setData(result);
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
      <Tabs className="w-full max-w-md" onValueChange={handleTabChange}>
        <TabsList>
          {presets.map((preset) => (
            <TabsTrigger key={preset.displayName} value={preset.displayName}>
              {preset.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
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
                <ScrollArea className="w-full rounded-md font-medium">
                  <div className="flex flex-col space-y-3 p-4">
                    {data.map((row: tableRow) => (
                      <div key={row.name}>
                        <Card className="border-zinc-700 bg-zinc-100 px-2 py-1 font-semibold text-black">
                          <div className="group flex items-center justify-between">
                            {row.name}
                            <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-out group-hover:opacity-100">
                              <button>
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                    <AddPreset
                      preset={preset}
                      reloadData={() => handleTabChange(preset.displayName)}
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
