import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";
import { getServerUrl } from "./utils";

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
  toast.error(
    <div className="rounded-none border-r border-red-600">
      Session expired or invalid, please sign in again.
    </div>,
    {
      id: toastId,
      action: (
        <Button
          variant="link"
          className="text-red-600"
          onClick={() =>
            (window.location.href = `${getServerUrl()}/auth/signin`)
          }
        >
          Sign In
        </Button>
      ),
    }
  );
};
