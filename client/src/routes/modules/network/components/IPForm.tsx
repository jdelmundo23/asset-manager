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

import { Button } from "@/components/shadcn-ui/button";

import { LoaderCircle } from "lucide-react";
import IpContext from "@/context/IPContext";
import { useContext, useEffect, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { handleAction } from "@/lib/Actions";
import axios from "axios";
import { AssetTableSheet } from "@/components/TableSheets";

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
  const { fetcher } = useContext(IpContext);
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
        message:
          axios.isAxiosError(error) && error.status !== 500
            ? error.response?.data?.error
            : "An error has occurred",
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
                  <AssetTableSheet
                    value={field.value}
                    selectedRow={selectedRow}
                    setSelectedRow={setSelectedRow}
                    onConfirm={() =>
                      field.onChange(parseInt(Object.keys(selectedRow)[0]))
                    }
                  />
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
