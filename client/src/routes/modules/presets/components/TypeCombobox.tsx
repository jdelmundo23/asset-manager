import FormCombobox from "@/components/fields/FormCombobox";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { Preset, presetRowSchema } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

interface TypeComboboxProps {
  form: UseFormReturn<Preset>;
}

export default function TypeCombobox({ form }: TypeComboboxProps) {
  const typeQuery = useQuery({
    queryKey: ["selectableTypes"],
    queryFn: async () => {
      const response = await axiosApi.get(`/api/presets/assettypes`);
      return z.array(presetRowSchema).parse(response.data);
    },
    retry: false,
  });

  useEffect(() => {
    if (typeQuery.isError) {
      handleError(typeQuery.error);
    }
  }, [typeQuery.isError, typeQuery.error]);

  const types = typeQuery.data;

  return (
    <div className="flex items-end gap-x-2">
      <FormCombobox
        disabled={typeQuery.isLoading}
        form={form}
        options={{
          field: "typeID",
          fieldLabel: "Type",
          msgLabel: "type",
        }}
        choices={{
          items: types ?? [],
          valueKey: "ID",
          labelKey: "name",
        }}
        onSelect={async (val, fieldName, newVal) => {
          form.setValue(fieldName, newVal.ID, { shouldDirty: true });
          await form.trigger(fieldName);
        }}
      />
      {typeQuery.isLoading && (
        <LoaderCircle className="aspect-square h-9 animate-spin" color="gray" />
      )}
    </div>
  );
}
