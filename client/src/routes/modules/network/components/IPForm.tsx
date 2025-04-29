import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { IP, IPRow, ipSchema } from "@shared/schemas";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn-ui/sheet";
import { Button } from "@/components/shadcn-ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, LoaderCircle } from "lucide-react";
import IpContext from "@/context/IPContext";
import { useContext, useEffect, useState } from "react";
import { DataTable } from "../../assets/table/AssetTable";
import { RowSelectionState } from "@tanstack/react-table";
import { handleAction } from "@/components/Actions";
import axios from "axios";

interface BaseProps {
  closeDialog: () => void;
}

interface AddModeProps extends BaseProps {
  mode: "add";
  ip?: never;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  ip: IPRow;
}

type IPFormProps = AddModeProps | EditModeProps;

export default function IPForm({ mode, closeDialog, ip }: IPFormProps) {
  const { assets, fetcher } = useContext(IpContext);
  const form = useForm<IP>({
    resolver: zodResolver(ipSchema),
    ...(mode === "edit" && ip ? { defaultValues: ip } : {}),
  });

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      closeDialog();
    }
  }, [form.formState.isSubmitSuccessful]);

  async function onSubmit(values: IP) {
    try {
      if (mode === "add") {
        await handleAction("ip", "add", values, fetcher);
      } else {
        await handleAction("ip", "edit", values, fetcher);
      }
    } catch (error) {
      form.setError("ipAddress", {
        message: axios.isAxiosError(error)
          ? (error.response?.data?.error ?? error.message)
          : error,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                <Input
                  placeholder="ex: 00-1A-2B-3C-4D-5E"
                  type="text"
                  {...field}
                />
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
                        type="button"
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
                          : "Select Asset"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="dark space-y-3">
                      <SheetHeader>
                        <SheetTitle>Select an asset</SheetTitle>
                      </SheetHeader>
                      <DataTable
                        assets={assets}
                        hideColumns={[
                          "select",
                          "modelID",
                          "typeID",
                          "locationID",
                          "departmentID",
                          "assignedTo",
                          "purchaseDate",
                          "warrantyExp",
                          "cost",
                          "actions",
                        ]}
                        selectedRow={selectedRow}
                        onRowSelect={setSelectedRow}
                        singleSelect={true}
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
          {form.formState.isSubmitting ? (
            <div className="flex items-center">
              <LoaderCircle
                className="aspect-square animate-spin"
                color="gray"
              />
            </div>
          ) : (
            <></>
          )}
          <Button
            type="button"
            onClick={() => {
              closeDialog();
            }}
            variant="outline"
            className="text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              mode === "edit" &&
              JSON.stringify(ip) === JSON.stringify(form.getValues())
            }
          >
            {mode === "add" ? "Add" : "Edit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
