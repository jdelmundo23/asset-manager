import axios from "axios";
import { showErrorToast, showSessionExpiredToast } from "./toasts";

const defaultErrorMessages: Record<number, string> = {
  400: "Bad request",
  401: "Session expired or invalid",
  403: "Access denied",
  500: "Server error",
};

export function handleError(error: unknown, loadingToastId?: string | number) {
  const toastId = loadingToastId ?? "error";

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (!status) {
      const networkErrorMsg = "Network error or server unreachable";
      showErrorToast(toastId, networkErrorMsg);
      return networkErrorMsg;
    }

    const errorMsg =
      error.response?.data?.error ||
      defaultErrorMessages[status] ||
      "Unexpected error";

    if (status === 401) {
      showSessionExpiredToast(toastId);
    } else {
      showErrorToast(toastId, errorMsg);
    }

    return errorMsg;
  } else {
    console.error("Unexpected error");
    showErrorToast(toastId, "An unexpected error has occurred");
  }
}
