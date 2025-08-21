import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { User } from "@shared/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteUserProps {
  user: User;
}

const deleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ user }: { user: User }) => {
      return axiosApi.delete(`/api/users/${user.ID}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

export default function DeleteUser({ user }: DeleteUserProps) {
  const [open, setOpen] = useState(false);
  const mutation = deleteUserMutation();

  async function onConfirm() {
    toast
      .promise(
        mutation.mutateAsync({ user }).then(() => setOpen(false)),
        {
          loading: "Deleting user...",
          success: `User deleted!`,
        }
      )
      .unwrap()
      .catch((err) => {
        handleError(err);
      });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Any assets currently assigned to{" "}
            <span className="font-semibold">{user.name}</span> will become
            unassigned.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
