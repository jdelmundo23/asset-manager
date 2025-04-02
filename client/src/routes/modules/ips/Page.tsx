import { useFetcher, useLoaderData } from "react-router";
import axios from "axios";
import IPContext from "@/context/IPContext";
import { ipSchema } from "@shared/schemas";
import { z } from "zod";
import { DataTable } from "./components/DataTable";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

export async function loader() {
  try {
    const [ipRes] = await Promise.all([axios.get(`${apiUrl}/api/ips/all`)]);
    const parsedIps = z.array(ipSchema).parse(ipRes.data ?? []);

    console.log(parsedIps);

    return {
      ips: parsedIps,
    };
  } catch {
    console.error("Not authenticated");
  }
}

function Page() {
  const fetcher = useFetcher();
  const data = fetcher.data || useLoaderData();

  return (
    <div className="dark container mx-auto flex w-1/2 flex-col gap-2 py-10">
      <IPContext.Provider value={{ ...data }}>
        <DataTable />
      </IPContext.Provider>
    </div>
  );
}

export default Page;
