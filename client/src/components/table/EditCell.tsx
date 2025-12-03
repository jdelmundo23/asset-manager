import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { memo, ReactNode, useEffect, useState } from "react";
import { Column } from "@tanstack/react-table";
import { z, ZodObject, ZodRawShape } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { Form } from "../shadcn-ui/form";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import { useTableConfig } from "@/context/TableConfigContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AssetSelector,
  CostEditor,
  DateEditor,
  SelectEditor,
  TextEditor,
} from "./CellEditors";

interface EditCellProps<T> {
  children: (isOpen: boolean) => React.ReactNode;
  column: Column<T, unknown>;
  currentValue: unknown;
  ID: number | string;
  schema: ZodObject<ZodRawShape>;
}

const EditCellInner = memo(function EditCell<T>({
  children,
  column,
  currentValue,
  ID,
  schema,
}: EditCellProps<T>) {
  const { endpoint, queryKey } = useTableConfig();
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: CellType) =>
      axiosApi.patch(endpoint, {
        value: values[column.id],
        column: column.id,
        ID: ID,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });

  const cellOnlySchema = schema.pick({ [column.id]: true });
  type CellType = z.infer<typeof cellOnlySchema>;

  const form = useForm<CellType>({
    resolver: zodResolver(cellOnlySchema),
    defaultValues: { [column.id]: currentValue },
  });

  useEffect(() => {
    form.reset({ [column.id]: currentValue });
  }, [currentValue, column.id, form]);

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      form.reset();
    }
  };

  async function onSubmit(values: CellType) {
    if (values[column.id] === currentValue) {
      form.reset();
      return;
    }

    const toastReturn = toast.promise(mutation.mutateAsync(values), {
      loading: `Editing ${column.columnDef.header}`,
      success: `Edited ${column.columnDef.header}`,
    });

    const toastID =
      typeof toastReturn === "string" || typeof toastReturn === "number"
        ? toastReturn
        : undefined;

    toastReturn.unwrap().catch((error) => {
      const errorMsg = handleError(error, toastID);
      form.setError(column.id, { message: errorMsg || "Unexpected error" });
      console.error(errorMsg);
    });
  }

  let editField: JSX.Element = <></>;

  if (!column.columnDef.meta?.editTable) {
    switch (column.columnDef.meta?.type) {
      case "text":
        editField = (
          <TextEditor column={column} form={form} currentValue={currentValue} />
        );
        break;
      case "cost":
        editField = (
          <CostEditor
            column={column}
            form={form}
            currentValue={currentValue}
            schema={schema}
          />
        );
        break;
      case "select":
        editField = (
          <SelectEditor
            column={column}
            form={form}
            currentValue={currentValue}
          />
        );
        break;
      case "date":
        editField = (
          <DateEditor column={column} form={form} currentValue={currentValue} />
        );
        break;
    }
  } else {
    switch (column.columnDef.meta?.editTable) {
      case "assets":
        editField = (
          <AssetSelector
            column={column}
            form={form}
            currentValue={currentValue}
          />
        );
        break;
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <MemoizedDropdownMenuTrigger isOpen={isOpen}>
        {children(isOpen)}
      </MemoizedDropdownMenuTrigger>
      {isOpen && (
        <MemoizedDropdownMenuContent
          form={form}
          onSubmit={onSubmit}
          editField={editField}
        />
      )}
    </DropdownMenu>
  );
});

export const EditCell = memo(EditCellInner) as <T>(
  props: EditCellProps<T>
) => JSX.Element;

const MemoizedDropdownMenuTrigger = memo(function MemoizedDropdownMenuTrigger({
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  return <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>;
});

const MemoizedDropdownMenuContent = memo(function MemoizedDropdownMenuContent<
  T extends FieldValues,
>({
  form,
  onSubmit,
  editField,
}: {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  editField: JSX.Element;
}) {
  return (
    <DropdownMenuContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>{editField}</form>
      </Form>
    </DropdownMenuContent>
  );
});
