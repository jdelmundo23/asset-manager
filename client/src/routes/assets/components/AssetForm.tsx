"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react";
import CurrencyInput from "react-currency-input-field";
import AssetContext from "@/context/AssetContext";
import { useContext, useEffect } from "react";
import { Asset, AssetRow, assetSchema } from "@/types";
import FormCombobox from "./FormCombobox";
import { handleAssetAction } from "./Actions";

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
  const { types, models, locations, departments, users, fetcher } =
    useContext(AssetContext);

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
    mode === "add"
      ? handleAssetAction("add", values, fetcher)
      : handleAssetAction("edit", values, fetcher);
  }

  const selectedType = form.watch("typeID");

  const filteredModels = selectedType
    ? models.filter((model) => model.typeID === selectedType)
    : models;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 mx-auto py-1 text-white"
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
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid sm:grid-cols-12 gap-4">
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

        <div className="grid sm:grid-cols-12 gap-4">
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
            labelKey: "value",
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

        <div className="grid sm:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

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
                  <FormLabel>Warranty Exp.</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0.0.0.0" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00-00-00-00-00-00"
                      type="text"
                      {...field}
                    />
                  </FormControl>

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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
            variant="outline"
            className="text-white"
            onClick={(e) => {
              e.preventDefault();
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
