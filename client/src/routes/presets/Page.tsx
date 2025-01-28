import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Pencil, X } from "lucide-react";
import { useState } from "react";

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
  const handleTabChange = async (tabValue: string) => {
    const table = presets.find((preset) => preset.displayName === tabValue);
    if (table) {
      try {
        const response = await fetch(`/api/presets/${table.tableName}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };
  return (
    <div className="dark container mx-auto w-3/5 py-10">
      <h4 className="text-md font-medium leading-none">Presets</h4>
      <p className="text-md text-muted-foreground">
        Manage the presets used for asset columns.
      </p>
      <Separator className="my-4" />
      <Tabs className="w-1/2" onValueChange={handleTabChange}>
        <TabsList>
          {presets.map((preset) => (
            <TabsTrigger key={preset.displayName} value={preset.displayName}>
              {preset.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
        {presets.map((preset) => (
          <TabsContent key={preset.displayName} value={preset.displayName}>
            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4">
                {data.map((row: tableRow) => (
                  <div key={row.name} className="group">
                    <div className="text-md group flex items-center justify-between">
                      {row.name}
                      <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-in-out group-hover:opacity-100">
                        <Pencil className="h-4 w-4" />
                        <X className="h-5 w-5" />
                      </div>
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default Page;
