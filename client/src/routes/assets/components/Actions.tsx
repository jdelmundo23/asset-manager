import { toast } from "sonner";
import axios from "axios";
import { Asset } from "@/types";
import { FetcherWithComponents } from "react-router";

export const addAsset = async (
  values: Asset,
  fetcher: FetcherWithComponents<any> | undefined
) => {
  const loadingToast = toast.loading(
    <div>
      Adding asset: <b>{values.name}</b>
    </div>
  );
  try {
    const response = await axios.post("/api/assets/add", values);
    console.log("Asset added successfully: ", response.data);
    try {
      await fetcher?.load("/admin/assets");
      toast.success(
        <div>
          Asset added: <b>{values.name}</b>
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
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data.error);
    } else {
      console.error("Failed submission. Unexpected error:", error);
    }
    toast.error(
      <div>
        Failed to add asset: <b>{values.name}</b>
      </div>,
      {
        id: loadingToast,
      }
    );
  }
};

export const deleteAsset = async (
  rowName: string,
  rowID: number,
  fetcher: FetcherWithComponents<any> | undefined
) => {
  const loadingToast = toast.loading(
    <div>
      Deleting asset: <b>{rowName}</b>
    </div>
  );
  try {
    const response = await axios.delete(`/api/assets/delete/${rowID}`);
    console.log("Preset delete successfully", response.data);
    try {
      await fetcher?.load("/admin/assets");
      toast.info(
        <div>
          Asset deleted: <b>{rowName}</b>
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
    console.error("Delete asset failed", error);
    toast.error(
      <div>
        Asset deletion failed: <b>{rowName}</b>
      </div>,
      {
        id: loadingToast,
      }
    );
  }
};
