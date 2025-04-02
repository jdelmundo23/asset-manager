import { toast } from "sonner";
import axios from "axios";
import { Asset, AssetRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";

type ActionType = "add" | "edit" | "delete";

interface Action {
  ing: string;
  ed: string;
  url: (values: Asset | AssetRow) => string;
  method: "post" | "put" | "delete";
}

const actions: Record<ActionType, Action> = {
  add: { method: "post", url: () => `/api/assets`, ing: "Adding", ed: "added" },
  edit: {
    method: "put",
    url: () => `/api/assets`,
    ing: "Editing",
    ed: "edited",
  },
  delete: {
    method: "delete",
    url: (values) => `/api/assets/${values.ID}`,
    ing: "Deleting",
    ed: "deleted",
  },
} as const;

export const handleAssetAction = async (
  actionType: ActionType,
  values: Asset | AssetRow,
  fetcher: FetcherWithComponents<any> | undefined
) => {
  if ((actionType === "edit" || actionType === "delete") && !("ID" in values)) {
    throw new Error(`Cannot ${actionType} asset: Missing ID.`);
  }

  const action = actions[actionType];

  const loadingToast = toast.loading(
    <div>
      {action.ing} asset: <b>{values.name}</b>
    </div>
  );

  try {
    await axios[action.method](action.url(values), values);
    try {
      await fetcher?.load("/admin/assets");

      const toastType = actionType === "add" ? toast.success : toast.info;

      toastType(
        <div>
          Asset {action.ed}: <b>{values.name}</b>
        </div>,
        {
          id: loadingToast,
        }
      );
    } catch {
      toast.error(<div>Failed to update assets list</div>, {
        id: loadingToast,
      });
    }
  } catch (error) {
    console.error(
      `${action.ing} asset failed: Error: `,
      axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : error
    );
    toast.error(
      <div>
        Failed to {actionType} asset: <b>{values.name}</b>
      </div>,
      {
        id: loadingToast,
      }
    );
  }
};
