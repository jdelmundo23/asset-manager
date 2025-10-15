import { Textarea } from "../shadcn-ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { useEffect, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { assetRowSchema } from "@shared/schemas";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../shadcn-ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApi from "@/lib/axios";
import { useTableConfig } from "@/context/TableConfigContext";
import { toast } from "sonner";
import { handleError } from "@/lib/handleError";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shadcn-ui/tooltip";

interface NoteViewProps {
  children: JSX.Element;
  currentNote: string;
  ID: number | string;
}

export default function NoteView({ children, currentNote, ID }: NoteViewProps) {
  const { endpoint } = useTableConfig();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const noteSchema = assetRowSchema.pick({ note: true });
  type NoteType = z.infer<typeof noteSchema>;

  const form = useForm<NoteType>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: currentNote },
  });

  const mutation = useMutation({
    mutationFn: (values: NoteType) =>
      axiosApi.patch(endpoint, {
        value: values.note,
        column: "note",
        ID: ID,
      }),
    onSuccess: () => {
      setOpen(false);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["assetData"] });
      }, 200);
    },
  });

  async function onSubmit(values: NoteType) {
    if (values.note === currentNote) {
      setEditing(false);
      return;
    }

    const toastReturn = toast.promise(mutation.mutateAsync(values), {
      loading: `Editing Note`,
      success: `Edited Note`,
    });

    const toastID =
      typeof toastReturn === "string" || typeof toastReturn === "number"
        ? toastReturn
        : undefined;

    toastReturn
      .unwrap()
      .then((response) => response)
      .catch((error) => {
        handleError(error, toastID);
        throw error;
      });
  }

  useEffect(() => {
    if (editing) {
      form.setFocus("note");
    }
  }, [editing]);

  useEffect(() => {
    if (open && !currentNote) {
      setEditing(true);
    }
    if (!open) {
      setTimeout(() => {
        form.reset();
        setEditing(false);
      }, 200);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="gap-y-2 text-white">
        <DialogTitle className="">Note</DialogTitle>
        <Form {...form}>
          <form className="relative">
            <FormField
              control={form.control}
              name={"note"}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      maxLength={255}
                      disabled={!editing}
                      className={`${editing ? "bg-black" : "bg-input/30"} h-[200px] resize-none disabled:cursor-auto disabled:opacity-100`}
                      defaultValue={currentNote}
                      placeholder="Enter note here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="absolute bottom-0 right-0 p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {editing ? (
                      <Check
                        className="h-5 w-5 cursor-pointer"
                        onClick={form.handleSubmit(onSubmit)}
                      />
                    ) : (
                      <Pencil
                        className="h-5 w-5 cursor-pointer"
                        onClick={() => {
                          setEditing(true);
                        }}
                      />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {editing ? "Confirm" : "Edit"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
