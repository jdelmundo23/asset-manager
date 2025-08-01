import FormCombobox from "@/components/fields/FormCombobox";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { Preset, presetRowSchema } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
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
    <FormCombobox
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
        if (val === newVal.ID) {
          form.setValue(fieldName, null);
        } else {
          form.setValue(fieldName, newVal.ID);
          await form.trigger(fieldName);
        }
      }}
    />
  );
}
