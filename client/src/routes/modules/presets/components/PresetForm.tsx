import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";

import { useContext, useState } from "react";
import PresetContext from "@/context/PresetContext";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Preset, PresetRow, presetSchema } from "@shared/schemas";
import TypeCombobox from "./TypeCombobox";

interface BaseProps {
  closeDialog: () => void;
}

type Mode = "add" | "edit";

interface AddModeProps extends BaseProps {
  mode: "add";
  preset?: never;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  preset: PresetRow;
}

type PresetFormprops = AddModeProps | EditModeProps;

async function handlePreset(mode: Mode, table: string, values: Preset) {
  const method = mode === "add" ? "post" : "put";
  await axiosApi[method](`/api/presets/${table}`, values);
}

const handlePresetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mode,
      table,
      values,
    }: {
      mode: Mode;
      table: string;
      values: Preset;
    }) => handlePreset(mode, table, values),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["preset", variables.table],
      });

      if (variables.table === "assetmodels") {
        queryClient.invalidateQueries({ queryKey: ["types"] });
      }
    },
  });
};

export default function PresetForm({
  mode,
  preset,
  closeDialog,
}: PresetFormprops) {
  const { activePreset } = useContext(PresetContext);
  const [formError, setFormError] = useState("");
  const mutation = handlePresetMutation();

  const form = useForm<Preset>({
    resolver: zodResolver(presetSchema),
    ...(mode === "edit" && preset ? { defaultValues: preset } : {}),
  });

  const watchedValues = form.watch();

  async function onSubmit(values: Preset) {
    if (
      mode === "edit" &&
      JSON.stringify(presetSchema.parse(watchedValues)) ===
        JSON.stringify(preset)
    ) {
      form.reset(presetSchema.parse(watchedValues));
      setFormError("");
      return;
    }

    const variables = {
      mode,
      table: activePreset.tableName,
      values,
    };

    toast
      .promise(
        mutation.mutateAsync(variables).then(() => closeDialog()),
        {
          loading: mode === "edit" ? "Saving changes..." : "Adding preset...",
          success: `Preset ${mode}ed!`,
        }
      )
      .unwrap()
      .catch((err) => {
        form.reset(presetSchema.parse(watchedValues));
        const errorMsg = handleError(err);
        setFormError(errorMsg);
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full flex-col space-y-4 text-white"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder={`${activePreset.displayName.slice(0, -1)} Name`}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {activePreset.tableName === "assetmodels" && (
          <TypeCombobox form={form} />
        )}
        <div className="flex flex-col-reverse items-center justify-end space-y-2 space-y-reverse sm:flex-row sm:space-x-2 sm:space-y-0">
          <FormMessage>{formError}</FormMessage>
          <Button
            type="button"
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
              (mode === "edit" &&
                JSON.stringify(preset) === JSON.stringify(watchedValues)) ||
              Object.keys(form.formState.dirtyFields).length === 0
            }
          >
            Confirm
          </Button>
        </div>
      </form>
    </Form>
  );
}
