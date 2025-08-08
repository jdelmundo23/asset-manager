import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface SyncMsgProps {
  groupName: string;
}

export default function SyncMsg({ groupName }: SyncMsgProps) {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => axiosApi.post(`/api/users/sync-users`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleSyncAction = () => {
    const toastReturn = toast.promise(syncMutation.mutateAsync(), {
      loading: `Syncing users...`,
      success: `Successfully synced users`,
    });

    const toastID =
      typeof toastReturn === "string" || typeof toastReturn === "number"
        ? toastReturn
        : undefined;

    toastReturn.unwrap().catch((error) => {
      handleError(error, toastID);
      throw error;
    });
  };

  return (
    <div className="flex w-full items-center justify-end gap-x-1 text-sm">
      Synced from group: <span className="font-semibold">{groupName}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <RefreshCcw
              className="h-4 w-4 transition-transform active:-rotate-90"
              onClick={handleSyncAction}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-background text-foreground">
            Sync
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
