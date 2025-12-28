import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";
import { getServerUrl } from "./utils";
import { QueryClient } from "@tanstack/react-query";

export const showLoadingToast = (msg: string, entity: string = "") => {
  return toast.loading(
    <div>
      {msg}
      {entity && <b>: {entity}</b>}
    </div>
  );
};

export const showSuccessToast = (
  toastId: string | number,
  msg: string,
  entity: string = ""
) => {
  toast.success(
    <div>
      {msg}
      {entity && <b>: {entity}</b>}
    </div>,
    { id: toastId }
  );
};

export const showInfoToast = (
  toastId: string | number,
  msg: string,
  entity: string = ""
) => {
  toast.info(
    <div>
      {msg}
      {entity && <b>: {entity}</b>}
    </div>,
    { id: toastId }
  );
};

export const showErrorToast = (
  toastId: string | number,
  msg: string,
  entity: string = ""
) => {
  toast.error(
    <div>
      {msg}
      {entity && <b>: {entity}</b>}
    </div>,
    { id: toastId }
  );
};

export const showListUpdateErrorToast = (toastId: string | number) => {
  toast.error(<div>Failed to update list</div>, { id: toastId });
};

export const showSessionExpiredToast = (toastId: string | number) => {
  toast.error(<div>Session expired or invalid, please sign in again.</div>, {
    id: toastId,
    action: (
      <div className="inline-flex flex-1 justify-end">
        <Button
          className="border border-red-600 bg-transparent text-red-600"
          onClick={() =>
            (window.location.href = `${getServerUrl()}/auth/signin`)
          }
        >
          Sign In
        </Button>
      </div>
    ),
  });
};

export const showConflictToast = (
  toastId: string | number,
  msg: string,
  queryKey?: string[],
  queryClient?: QueryClient
) => {
  toast.error(msg, {
    id: toastId,
    action:
      queryClient && queryKey ? (
        <div className="inline-flex flex-1 justify-end">
          <Button
            className="border border-red-600 bg-transparent text-red-600"
            onClick={async () => {
              try {
                await queryClient.invalidateQueries({
                  queryKey: queryKey,
                });
                await queryClient.ensureQueryData({ queryKey: queryKey });

                toast.success("Updated successfully!", {
                  id: toastId,
                  action: <></>,
                });
              } catch {
                toast.error("Failed to update. Please refresh the page.", {
                  id: toastId,
                  action: <></>,
                });
              }
            }}
          >
            Update
          </Button>
        </div>
      ) : (
        <></>
      ),
  });
};
