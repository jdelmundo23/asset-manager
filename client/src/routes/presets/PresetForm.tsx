import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";

interface PresetFormProps {
  mode: "add" | "edit";
  oldPresetName?: string;
  presetTable: string;
  closeDialog: () => void;
  reloadData: () => void;
}

const formSchema = z.object({
  presetName: z.string().min(2).max(50),
});

export default function PresetForm({
  mode,
  oldPresetName,
  presetTable,
  closeDialog,
  reloadData,
}: PresetFormProps) {
  const [msg, setMsg] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (mode === "edit" && oldPresetName) {
      try {
        const response = await axios.put(`/api/presets/${presetTable}`, {
          name: values.presetName,
          oldName: oldPresetName,
        });
        console.log("Preset edited successfully", response.data);
        closeDialog();
        reloadData();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg: string = error.response?.data.error;
          setMsg(errorMsg);
        } else {
          console.error("Failed to edit preset. Unexpected error:", error);
        }
      }
    } else {
      try {
        const response = await axios.post(`/api/presets/${presetTable}`, {
          name: values.presetName,
        });
        console.log("Preset added successfully", response.data);
        closeDialog();
        reloadData();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg: string = error.response?.data.error;
          setMsg(errorMsg);
        } else {
          console.error("Failed to add preset. Unexpected error:", error);
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full flex-col space-y-4"
      >
        <FormField
          control={form.control}
          name="presetName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Name"
                  type="text"
                  {...field}
                  className="w-full text-white"
                  onChange={(e) => {
                    setMsg("");
                    field.onChange(e);
                  }}
                />
              </FormControl>

              <FormMessage>{msg}</FormMessage>
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse justify-end space-y-2 space-y-reverse sm:flex-row sm:space-x-2 sm:space-y-0">
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
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
}
