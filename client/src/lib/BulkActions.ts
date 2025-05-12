import {
  showInfoToast,
  showListUpdateErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import axios from "axios";
import { FetcherWithComponents } from "react-router";
import { handleError } from "./handleError";

type ActionType = "duplicate" | "edit" | "delete";

type EndpointType = "asset" | "ip";

interface Action {
  ing: string;
  ed: string;
  url: (endpoint: EndpointType) => string;
  method: "post" | "put";
}

const actions: Record<ActionType, Action> = {
  delete: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/bulk/delete`,
    ing: "Deleting",
    ed: "Deleted",
  },
  edit: {
    method: "put",
    url: (endpoint) => `/api/${endpoint}s/bulk/edit`,
    ing: "Editing",
    ed: "Edited",
  },
  duplicate: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/bulk/duplicate`,
    ing: "Duplicating",
    ed: "Duplicated",
  },
} as const;

export const handleBulkAction = async (
  endpointType: EndpointType,
  actionType: ActionType,
  ids: string[],
  fetcher: FetcherWithComponents<any> | undefined
) => {
  const action = actions[actionType];

  const loadingToast = showLoadingToast(`${action.ing} ${endpointType}s`);
  try {
    await axios[action.method](action.url(endpointType), { ids });

    try {
      await fetcher?.load(
        `/app/${endpointType === "asset" ? "assets" : "network"}`
      );

      const toastType =
        actionType === "duplicate" ? showSuccessToast : showInfoToast;
      toastType(loadingToast, `${action.ed} ${endpointType}s`);
    } catch {
      showListUpdateErrorToast(loadingToast);
    }
  } catch (error) {
    handleError(error, loadingToast);

    throw error;
  }
};
