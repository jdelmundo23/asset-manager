import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { LoaderCircle } from "lucide-react";
import CurrencyInput from "react-currency-input-field";
import { useEffect } from "react";
import { Asset, AssetRow, assetSchema } from "@shared/schemas";
import FormCombobox from "@/components/FormCombobox";
import { useHandleAction } from "@/lib/Actions";
import CalendarPopover from "@/components/CalendarPopover";
import { useAssets } from "@/context/AssetContext";

interface BaseProps {
  closeDialog: () => void;
}

interface AddModeProps extends BaseProps {
  mode: "add";
  asset?: never;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  asset: AssetRow;
}

type AssetFormProps = AddModeProps | EditModeProps;

export default function AssetForm({
  mode,
  closeDialog,
  asset,
}: AssetFormProps) {
  const { handleAction } = useHandleAction<Asset, unknown>();
  const { types, models, locations, departments, users } = useAssets();

  const form = useForm<Asset>({
    resolver: zodResolver(assetSchema),
    ...(mode === "edit" && asset ? { defaultValues: asset } : {}),
  });

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      closeDialog();
    }
  }, [form.formState.isSubmitSuccessful]);

  async function onSubmit(values: Asset) {
    if (mode === "add") {
      await handleAction("asset", "add", values);
    } else {
      await handleAction("asset", "edit", values);
    }
  }

  const selectedType = form.watch("typeID");

  const filteredModels = selectedType
    ? models.filter((model) => model.typeID === selectedType)
    : models;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto space-y-3 py-1 text-white"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="ex: LAPTOP-XX" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Serial Number / Product Tag"
                  type="text"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6">
            <FormCombobox
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
                if (val === newVal.ID) {
                  form.resetField(fieldName);
                  if (form.getValues("modelID")) {
                    form.resetField("modelID");
                  }
                } else {
                  if (form.getValues("modelID")) {
                    form.resetField("modelID");
                  }
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
          </div>

          <div className="col-span-6">
            <FormCombobox
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
                if (val === newVal.ID) {
                  form.resetField(fieldName);
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
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6">
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
                  form.resetField(fieldName);
                } else {
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
          </div>

          <div className="col-span-6">
            <FormCombobox
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
                if (val === newVal.ID) {
                  form.resetField(fieldName);
                } else {
                  form.setValue(fieldName, newVal.ID);
                  await form.trigger(fieldName);
                }
              }}
            />
          </div>
        </div>

        <FormCombobox
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
            if (val === newVal.ID) {
              form.resetField(fieldName);
            } else {
              form.setValue(fieldName, newVal.ID);
              await form.trigger(fieldName);
            }
          }}
        />

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-baseline justify-between">
                    <p>Purchase Date</p>
                    {field.value ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          form.setValue(field.name, null, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        <p className="text-[0.55rem] font-light underline opacity-50">
                          Clear date
                        </p>
                      </button>
                    ) : (
                      ""
                    )}
                  </FormLabel>
                  <CalendarPopover
                    value={field.value === null ? undefined : field.value}
                    onChange={field.onChange}
                    placeHolder="Pick a date"
                    width={240}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="warrantyExp"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-baseline justify-between">
                    <p>Warranty Exp.</p>
                    {field.value ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          form.setValue(field.name, null, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        <p className="text-[0.55rem] font-light underline opacity-50">
                          Clear date
                        </p>
                      </button>
                    ) : (
                      ""
                    )}
                  </FormLabel>
                  <CalendarPopover
                    value={field.value === null ? undefined : field.value}
                    onChange={field.onChange}
                    placeHolder="Pick a date"
                    width={240}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <CurrencyInput
                  id="cost"
                  placeholder="$0.00"
                  decimalsLimit={2}
                  prefix="$"
                  className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value || "");
                  }}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
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
            disabled={
              mode === "edit" &&
              JSON.stringify(asset) === JSON.stringify(form.getValues())
            }
          >
            {mode === "add" ? "Add" : "Edit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
