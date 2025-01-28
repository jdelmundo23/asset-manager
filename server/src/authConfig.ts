import * as dotenv from "dotenv";
import path from "path";
import { LogLevel, Configuration } from "@azure/msal-node";

dotenv.config({ path: path.resolve(__dirname, "../.env.dev") });

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.CLIENT_ID as string,
    authority: process.env.CLOUD_INSTANCE! + process.env.TENANT_ID!,
    clientSecret: process.env.CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(level, message: string) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    },
  },
};

export const REDIRECT_URI = process.env.REDIRECT_URI;
export const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;
export const GRAPH_ME_ENDPOINT = process.env.GRAPH_API_ENDPOINT + "v1.0/me";
