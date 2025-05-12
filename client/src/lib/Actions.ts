import axios from "axios";
import { Asset, AssetRow, IP, IPRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";
import {
  showInfoToast,
  showListUpdateErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import { handleError } from "./handleError";

type ActionType = "add" | "edit" | "delete" | "duplicate";

type EndpointType = "asset" | "ip";

interface Action {
  ing: string;
  ed: string;
  url: (
    endpoint: EndpointType,
    values: Asset | AssetRow | IP | IPRow
  ) => string;
  method: "post" | "put" | "delete";
}

const actions: Record<ActionType, Action> = {
  add: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s`,
    ing: "Adding",
    ed: "Added",
  },
  edit: {
    method: "put",
    url: (endpoint) => `/api/${endpoint}s`,
    ing: "Editing",
    ed: "Edited",
  },
  delete: {
    method: "delete",
    url: (endpoint, values) => `/api/${endpoint}s/${values.ID}`,
    ing: "Deleting",
    ed: "Deleted",
  },
  duplicate: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/duplicate`,
    ing: "Duplicating",
    ed: "Duplicated",
  },
} as const;

export const handleAction = async (
  endpointType: EndpointType,
  actionType: ActionType,
  values: Asset | AssetRow | IP | IPRow,
  fetcher: FetcherWithComponents<any> | undefined
): Promise<void> => {
  if (
    (actionType === "edit" ||
      actionType === "delete" ||
      actionType === "duplicate") &&
    !("ID" in values)
  ) {
    throw new Error(`Cannot ${actionType} ${endpointType}: Missing ID.`);
  }

  const action = actions[actionType];

  const loadingToast = showLoadingToast(
    `${action.ing} ${endpointType}`,
    values.name
  );

  try {
    if ("ipAddress" in values) {
      await axios[action.method](action.url(endpointType, values), values);
    } else {
      await axios[action.method](action.url(endpointType, values), values);
    }

    try {
      await fetcher?.load(
        `/app/${endpointType === "asset" ? "assets" : "network"}`
      );

      const toastType = actionType === "add" ? showSuccessToast : showInfoToast;
      toastType(loadingToast, `${action.ed} ${endpointType}`, values.name);
    } catch {
      showListUpdateErrorToast(loadingToast);
    }
  } catch (error) {
    handleError(error, loadingToast);

    throw error;
  }
};
