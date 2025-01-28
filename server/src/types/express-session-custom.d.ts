import { AccountInfo } from "@azure/msal-node";
import "express-session";
declare module "express-session" {
  interface SessionData {
    pkceCodes?: {
      verifier: string;
      challenge: string;
      challengeMethod: string;
    };
    authCodeUrlRequest?: AuthRequestParams & {
      codeChallenge: string;
      codeChallengeMethod: string;
      responseMode: string;
    };
    authCodeRequest?: AuthRequestParams & {
      code: string;
    };
    tokenCache?: string;
    idToken?: string;
    accessToken?: string;
    account?: AccountInfo | null;
    isAuthenticated?: boolean;
  }
}
