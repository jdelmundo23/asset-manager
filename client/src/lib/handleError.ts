import axios from "axios";
import { showErrorToast, showSessionExpiredToast } from "./toasts";

export function handleError(error: unknown, loadingToastId?: string | number) {
  const toastId = loadingToastId ?? "error";
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.error;

    if (!status) {
      showErrorToast(toastId, "Network error or server is unreachable.");
    } else if (status === 400) {
      showErrorToast(toastId, errorMsg);
    } else if (status === 401) {
      showSessionExpiredToast(toastId);
    } else if (status === 403) {
      showErrorToast(
        toastId,
        "You don't have permission to perform this action."
      );
    } else if (status === 500) {
      showErrorToast(
        toastId,
        errorMsg ?? "Server error. Please try again later."
      );
    } else {
      showErrorToast(toastId, `Unexpected error (${status}).`);
    }

    return errorMsg;
  } else {
    console.error("Unexpected error:", error);
    showErrorToast(toastId, "An unexpected error occurred.");
  }
}
