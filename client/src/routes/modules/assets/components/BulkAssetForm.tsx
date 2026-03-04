import CalendarPopover from "@/components/fields/CalendarPopover";
import FormCombobox from "@/components/fields/FormCombobox";
import { Button } from "@/components/shadcn-ui/button";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { useAssets } from "@/context/AssetContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Asset, assetSchema } from "@shared/schemas";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { useForm } from "react-hook-form";

interface BaseProps {
  closeDialog: () => void;
}

interface AddModeProps extends BaseProps {
  mode: "add";
  ids: never;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  ids: string[];
}

type BulkAssetFormProps = AddModeProps | EditModeProps;

export default function BulkAssetForm({
  mode,
  closeDialog,
  ids,
}: BulkAssetFormProps) {
  const [fieldsEnabled, setFieldsEnabled] = useState({
    modelID: false,
    locationID: false,
    departmentID: false,
    assignedTo: false,
    purchaseDate: false,
    warrantyExp: false,
    cost: false,
    note: false,
  });

  const {
    types: { array: types },
    models: { array: models },
    locations: { array: locations },
    departments: { array: departments },
    users: { array: users },
  } = useAssets();

  const form = useForm<Asset>({
    resolver: zodResolver(assetSchema),
  });

  const toggleField = (field: keyof typeof fieldsEnabled) => {
    form.setValue(field, null);
    if (field === "modelID") {
      form.setValue("typeID", null);
    }
    setFieldsEnabled((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  async function onSubmit(values: Asset) {}

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      closeDialog();
    }
  }, [form.formState.isSubmitSuccessful]);

  const selectedType = form.watch("typeID");

  const filteredModels = selectedType
    ? models.filter((model) => model.typeID === selectedType)
    : models;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto space-y-3 py-1 text-white sm:w-[450px]"
      >
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6">
            <FormCombobox
              disabled={!fieldsEnabled["modelID"]}
              form={form}
              options={{
                field: "typeID",
                fieldLabel: "Type",
                msgLabel: "type",
              }}
              choices={{
                items: types,
                valueKey: "ID",
                labelKey: "name",
              }}
              onSelect={async (val, fieldName, newVal) => {
                if (newVal == null) {
                  form.setValue(fieldName, null);
                  if (form.getValues("modelID")) {
                    form.setValue("modelID", null);
                  }
                } else {
                  if (form.getValues("modelID")) {
                    form.setValue("modelID", null);
                  }
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
          </div>

          <div className="col-span-6 flex items-end">
            <FormCombobox
              disabled={!fieldsEnabled["modelID"]}
              form={form}
              options={{
                field: "modelID",
                fieldLabel: "Model",
                msgLabel: "model",
              }}
              choices={{
                items: filteredModels,
                valueKey: "ID",
                labelKey: "name",
              }}
              onSelect={async (val, fieldName, newVal) => {
                if (newVal == null) {
                  form.setValue(fieldName, null);
                } else {
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                  if (newVal.typeID && selectedType !== newVal.typeID) {
                    form.setValue("typeID", newVal.typeID);
                    await form.trigger("typeID");
                  }
                }
              }}
            />
            <Checkbox
              className="m-2 mr-0"
              checked={fieldsEnabled["modelID"]}
              onCheckedChange={() => toggleField("modelID")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6 flex items-end">
            <FormCombobox
              disabled={!fieldsEnabled["locationID"]}
              form={form}
              className="w-[200px]"
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
                if (newVal == null) {
                  form.setValue(fieldName, null);
                } else {
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
            <Checkbox
              className="m-2 mr-0"
              checked={fieldsEnabled["locationID"]}
              onCheckedChange={() => toggleField("locationID")}
            />
          </div>

          <div className="col-span-6 flex items-end">
            <FormCombobox
              className="w-[200px]"
              disabled={!fieldsEnabled["departmentID"]}
              form={form}
              options={{
                field: "departmentID",
                fieldLabel: "Department",
                msgLabel: "department",
              }}
              choices={{
                items: departments,
                valueKey: "ID",
                labelKey: "name",
              }}
              onSelect={async (val, fieldName, newVal) => {
                if (newVal == null) {
                  form.setValue(fieldName, null);
                } else {
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
            <Checkbox
              className="m-2 mr-0"
              checked={fieldsEnabled["departmentID"]}
              onCheckedChange={() => toggleField("departmentID")}
            />
          </div>
        </div>

        <div className="flex items-end">
          <FormCombobox
            disabled={!fieldsEnabled["assignedTo"]}
            className="w-full"
            form={form}
            options={{
              field: "assignedTo",
              fieldLabel: "Assigned To",
              msgLabel: "user",
            }}
            choices={{
              items: users,
              valueKey: "ID",
              labelKey: "name",
            }}
            onSelect={async (val, fieldName, newVal) => {
              if (newVal == null) {
                form.setValue(fieldName, null);
              } else {
                form.setValue(fieldName, newVal.ID);
                await form.trigger(fieldName);
              }
            }}
          />
          <Checkbox
            className="m-2 mr-0"
            checked={fieldsEnabled["assignedTo"]}
            onCheckedChange={() => toggleField("assignedTo")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6 flex items-end">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="flex items-baseline justify-between">
                    <p>Purchase Date</p>
                  </FormLabel>
                  <CalendarPopover
                    disabled={!fieldsEnabled["purchaseDate"]}
                    value={field.value === null ? undefined : field.value}
                    onChange={field.onChange}
                    placeHolder="Pick a date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Checkbox
              className="m-2 mr-0"
              checked={fieldsEnabled["purchaseDate"]}
              onCheckedChange={() => toggleField("purchaseDate")}
            />
          </div>

          <div className="col-span-6 flex items-end">
            <FormField
              control={form.control}
              name="warrantyExp"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="flex items-baseline justify-between">
                    <p>Warranty Exp.</p>
                  </FormLabel>
                  <CalendarPopover
                    disabled={!fieldsEnabled["warrantyExp"]}
                    value={field.value === null ? undefined : field.value}
                    onChange={field.onChange}
                    placeHolder="Pick a date"
                    width={240}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Checkbox
              className="m-2 mr-0"
              checked={fieldsEnabled["warrantyExp"]}
              onCheckedChange={() => toggleField("warrantyExp")}
            />
          </div>
        </div>

        <div className="flex items-end">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => {
              useEffect(() => {
                if (field.value != null) {
                  field.onChange(Number(field.value).toFixed(2));
                } else {
                  field.onChange(null);
                }
              }, []);

              return (
                <FormItem className="w-full">
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      disabled={!fieldsEnabled["cost"]}
                      placeholder="$0.00"
                      id="cost"
                      decimalsLimit={2}
                      prefix="$"
                      className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        if (value != null) {
                          field.onChange(value?.replace(/[^0-9.]/g, "") || "");
                        } else {
                          field.onChange(null);
                        }
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Checkbox
            className="m-2 mr-0"
            checked={fieldsEnabled["cost"]}
            onCheckedChange={() => toggleField("cost")}
          />
        </div>
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
            variant="outline"
            className="text-white"
            onClick={() => {
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!Object.values(fieldsEnabled).some(Boolean)}
          >
            {mode === "add" ? "Add" : "Edit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
