import FormCombobox from "@/components/FormCombobox";
import { Button } from "@/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { handleAction } from "@/lib/Actions";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Preset, Subnet, SubnetRow, subnetSchema } from "@shared/schemas";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSubnets } from "@/context/SubnetContext";
import axios from "axios";

interface BaseProps {
  closeDialog: () => void;
  setSearch: (search: string) => void;
}

interface AddModeProps extends BaseProps {
  mode: "add";
  subnet?: never;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  subnet: SubnetRow;
}

type SubnetFormProps = AddModeProps | EditModeProps;

export default function SubnetForm({
  closeDialog,
  mode,
  subnet,
  setSearch,
}: SubnetFormProps) {
  const { refetchSubnets, setSelectedSubnet } = useSubnets();
  const [locations, setLocations] = useState<Preset[]>(
    subnet?.locationID && subnet?.locationName
      ? [{ ID: subnet.locationID, name: subnet.locationName }]
      : []
  );

  useEffect(() => {
    (async () => {
      try {
        const result = await axiosApi.get(`/api/presets/locations`);
        setLocations(result.data);
      } catch (error) {
        handleError(error);
      }
    })();
  }, []);

  const form = useForm<Subnet>({
    resolver: zodResolver(subnetSchema),
    ...(mode === "edit" && subnet ? { defaultValues: subnet } : {}),
  });

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      closeDialog();
    }
  }, [form.formState.isSubmitSuccessful]);

  async function onSubmit(values: Subnet) {
    let response;
    try {
      if (mode === "add") {
        response = await handleAction<Subnet, SubnetRow>(
          "subnet",
          "add",
          values
        );
      } else {
        response = await handleAction<Subnet, SubnetRow>(
          "subnet",
          "edit",
          values
        );
      }
      setSelectedSubnet(response.data);
      refetchSubnets();
      setSearch("");
    } catch (error) {
      form.setError("subnetPrefix", {
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
        className="mx-auto space-y-3 py-1 text-white"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          disabled={mode === "edit"}
          control={form.control}
          name="subnetPrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subnet Prefix</FormLabel>
              <FormControl>
                <Input placeholder="ex: 192.168.1" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormCombobox
          form={form}
          options={{
            field: "locationID",
            fieldLabel: "Location",
            msgLabel: "location",
          }}
          choices={{
            items: locations,
            valueKey: "ID",
            labelKey: "name",
          }}
          onSelect={async (val, fieldName, newVal) => {
            if (val === newVal.ID) {
              form.setValue(fieldName, null);
              await form.trigger(fieldName);
            } else {
              form.setValue(fieldName, newVal.ID);
              await form.trigger(fieldName);
            }
          }}
          className="w-full"
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
              JSON.stringify(subnet) === JSON.stringify(form.getValues())
            }
          >
            {mode === "add" ? "Add" : "Edit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
