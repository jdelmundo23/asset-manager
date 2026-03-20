import {
  bulkIpInsertSchema,
  BulkIPs,
  BulkResult,
  bulkResultSchema,
  SubnetRow,
} from "@shared/schemas";
import SubnetComboxbox from "../subnets/SubnetCombobox";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { LoaderCircle, Plus, X } from "lucide-react";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { AssetTableSheet } from "@/components/fields/TableSheets";
import { RowSelectionState } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/shadcn-ui/tooltip";
import { useBulkAction } from "@/lib/bulkActions";
import BulkSummary from "./BulkSummary";
import axios from "axios";

interface BulkIPFormProps {
  closeDialog: () => void;
}

export default function BulkIPForm({ closeDialog }: BulkIPFormProps) {
  const { handleBulkAction } = useBulkAction();

  const [selectedSubnet, setSelectedSubnet] = useState<SubnetRow | undefined>();
  const [bulkResult, setBulkResult] = useState<BulkResult | undefined>(
    undefined
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm<{
    ips: BulkIPs;
  }>({
    resolver: zodResolver(z.object({ ips: bulkIpInsertSchema })),
    defaultValues: {
      ips: [
        { hostNumber: undefined, subnetPrefix: undefined, subnetID: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ips",
  });

  useEffect(() => {
    if (!selectedSubnet) return;
    fields.forEach((_, index) => {
      form.setValue(`ips.${index}.subnetID`, selectedSubnet.ID);
    });
  }, [selectedSubnet, fields, form.setValue]);

  const addRow = () => {
    append({
      hostNumber: undefined,
      name: "",
      subnetID: undefined,
    });
  };

  async function onSubmit(data: { ips: BulkIPs }) {
    const newIps = bulkIpInsertSchema.safeParse(data.ips);

    if (!newIps.success) {
      setFormError("Invalid submission format");
      return;
    }

    try {
      const response = await handleBulkAction(
        "ip",
        "add",
        [],
        undefined,
        undefined,
        newIps.data
      );

      const parse = bulkResultSchema.safeParse(response.data);

      setBulkResult(parse.data);
      setSummaryOpen(true);
    } catch (error) {
      setFormError(
        axios.isAxiosError(error) && error.status !== 500
          ? error.response?.data?.error
          : "An error has occurred"
      );
    }
  }

  return (
    <div>
      <BulkSummary
        open={summaryOpen}
        setOpen={setSummaryOpen}
        bulkResult={bulkResult}
        subnetPrefix={selectedSubnet?.subnetPrefix}
        closeDialog={closeDialog}
      />

      <div className="w-40">
        <SubnetComboxbox
          selectedSubnet={selectedSubnet}
          setSelectedSubnet={setSelectedSubnet}
        />
      </div>

      <div className="text-muted-foreground mt-2 grid grid-cols-[0.1fr_0.4fr_1fr_1fr_0.8fr_auto] gap-2 text-sm font-medium">
        <p>No.</p>
        <p>Host</p>
        <p>Name</p>
        <p>MAC Address</p>
        <p>Asset</p>
        <div className="w-6"></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <ScrollArea>
            <div className="max-h-56">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[0.1fr_0.4fr_1fr_1fr_0.8fr_auto] gap-2 py-1"
                >
                  <p className="flex items-center justify-end">{index + 1}</p>
                  <FormField
                    control={form.control}
                    name={`ips.${index}.hostNumber`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <FieldTooltip errorMsg={fieldState.error?.message}>
                            <Input
                              type="number"
                              placeholder="1-255"
                              {...field}
                              disabled={!selectedSubnet}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.valueAsNumber
                                )
                              }
                              className={`[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${fieldState.error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                          </FieldTooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ips.${index}.name`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <FieldTooltip errorMsg={fieldState.error?.message}>
                            <Input
                              disabled={!selectedSubnet}
                              placeholder="ex: Main Gateway"
                              type="text"
                              {...field}
                              className={`${fieldState.error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                          </FieldTooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ips.${index}.macAddress`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <FieldTooltip errorMsg={fieldState.error?.message}>
                            <Input
                              disabled={!selectedSubnet}
                              placeholder="ex: 00-1A-2B-3C-4D-5E"
                              type="text"
                              {...field}
                              value={field.value ?? ""}
                              className={`${fieldState.error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                          </FieldTooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ips.${index}.assetID`}
                    render={({ field }) => {
                      const [selectedRow, setSelectedRow] =
                        useState<RowSelectionState>({
                          [field.value ?? -1]: true,
                        });
                      return (
                        <FormItem className="space-y-2 overflow-hidden">
                          <FormControl>
                            <AssetTableSheet
                              disabled={!selectedSubnet}
                              value={field.value}
                              selectedRow={selectedRow}
                              setSelectedRow={setSelectedRow}
                              onConfirm={() =>
                                field.onChange(
                                  parseInt(Object.keys(selectedRow)[0])
                                )
                              }
                              onClear={() => field.onChange(null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <input
                    type="hidden"
                    {...form.register(`ips.${index}.subnetID`)}
                  />

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="remove row"
                    disabled={!selectedSubnet}
                    className="group disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <X className="rounded-sm transition-transform group-hover:bg-white/25 group-active:scale-90" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            aria-label="add row"
            type="button"
            variant="ghost"
            onClick={addRow}
            className="mt-1 h-6 w-full text-white disabled:cursor-not-allowed"
            disabled={!selectedSubnet}
          >
            <Plus />
          </Button>
          <div className="flex justify-between">
            <div className="text-muted-foreground flex items-center font-medium">
              {fields.length > 0
                ? `${fields.length} IP${fields.length > 1 ? "s" : ""}`
                : ``}
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
              <div className="text-destructive flex items-center">
                {formError}
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-white"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedSubnet || fields.length === 0}
              >
                Add
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function FieldTooltip({
  children,
  errorMsg,
}: {
  children: JSX.Element;
  errorMsg?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        {errorMsg && <TooltipContent side="top">{errorMsg}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
