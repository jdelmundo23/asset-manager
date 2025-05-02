import { toast } from "sonner";

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
