import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { IP, ipSchema } from "@shared/schemas";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import IpContext from "@/context/IPContext";
import { useContext, useState } from "react";
import { DataTable } from "../../assets/components/table_display/DataTable";
import { RowSelectionState } from "@tanstack/react-table";

export default function IPForm() {
  const { assets } = useContext(IpContext);
  const form = useForm<IP>({
    resolver: zodResolver(ipSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto space-y-3 py-1 text-white"
      >
        <FormField
          control={form.control}
          name="ipAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IP Address</FormLabel>
              <FormControl>
                <Input placeholder="ex: 192.168.1.1" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="ex: Main Gateway" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="macAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MAC Address</FormLabel>
              <FormControl>
                <Input placeholder="ex: 192.168.1.1" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assetID"
          render={({ field }) => {
            const [selectedRow, setSelectedRow] = useState<RowSelectionState>({
              [field.value ?? -1]: true,
            });
            return (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Asset</FormLabel>
                <FormControl>
                  <Sheet
                    onOpenChange={(open) =>
                      setTimeout(
                        () => setSelectedRow({ [field.value ?? -1]: true }),
                        open ? 0 : 500
                      )
                    }
                  >
                    <SheetTrigger>
                      <Button
                        variant="outline"
                        role="sheet"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? assets.find((row) => {
                              return row.ID === field.value;
                            })?.name
                          : "Add Asset"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="dark space-y-3">
                      <SheetHeader>
                        <SheetTitle>Select an asset</SheetTitle>
                      </SheetHeader>
                      <DataTable
                        assets={assets}
                        detailed={false}
                        selectedRow={selectedRow}
                        onRowSelect={setSelectedRow}
                      />
                      <div className="flex justify-end space-x-2">
                        <SheetClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            onClick={() =>
                              field.onChange(
                                parseInt(Object.keys(selectedRow)[0])
                              )
                            }
                          >
                            Select
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="flex flex-col-reverse justify-end space-y-2 space-y-reverse sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button variant="outline" className="text-white">
            Cancel
          </Button>
          <Button>Add</Button>
        </div>
      </form>
    </Form>
  );
}
