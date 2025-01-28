import msal, {
  ConfidentialClientApplication,
  Configuration,
} from "@azure/msal-node";
import { msalConfig } from "../authConfig";
import { Request, Response, NextFunction } from "express";
import axios from "axios";

interface AuthOptions {
  scopes: string[];
  redirectUri: string;
  successRedirect: string;
}

interface AuthRequestParams {
  state: string;
  scopes: string[];
  redirectUri: string;
}

class AuthProvider {
  msalConfig;
  cryptoProvider;

  constructor(msalConfig: Configuration) {
    this.msalConfig = msalConfig;
    this.cryptoProvider = new msal.CryptoProvider();
  }

  login(options: AuthOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const state = this.cryptoProvider.base64Encode(
        JSON.stringify({
          successRedirect: options.successRedirect || "/",
        })
      );

      const authCodeUrlRequestParams: AuthRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      };

      const authCodeRequestParams: AuthRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      };

      if (
        !this.msalConfig.auth.cloudDiscoveryMetadata ||
        !this.msalConfig.auth.authorityMetadata
      ) {
        const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
          this.getCloudDiscoveryMetadata(this.msalConfig.auth.authority!),
          this.getAuthorityMetadata(this.msalConfig.auth.authority!),
        ]);

        this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(
          cloudDiscoveryMetadata
        );
        this.msalConfig.auth.authorityMetadata =
          JSON.stringify(authorityMetadata);
      }

      const msalInstance = new ConfidentialClientApplication(this.msalConfig);

      return this.redirectToAuthCodeUrl(
        authCodeUrlRequestParams,
        authCodeRequestParams,
        msalInstance
      )(req, res, next);
    };
  }

  redirectToAuthCodeUrl(
    authCodeUrlRequestParams: AuthRequestParams,
    authCodeRequestParams: AuthRequestParams,
    msalInstance: ConfidentialClientApplication
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { verifier, challenge } =
        await this.cryptoProvider.generatePkceCodes();

      req.session.pkceCodes = {
        challengeMethod: "S256",
        verifier: verifier,
        challenge: challenge,
      };

      req.session.authCodeUrlRequest = {
        ...authCodeUrlRequestParams,
        responseMode: msal.ResponseMode.FORM_POST,
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
      };

      req.session.authCodeRequest = {
        ...authCodeRequestParams,
        code: "",
      };

      try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
          req.session.authCodeUrlRequest
        );
        res.redirect(authCodeUrlResponse);
      } catch (error) {
        next(error);
      }
    };
  }

  acquireToken(options: AuthOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const msalInstance = new ConfidentialClientApplication(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        if (req.session.account) {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            account: req.session.account,
            scopes: options.scopes || [],
          });
          req.session.tokenCache = msalInstance.getTokenCache().serialize();
          req.session.accessToken = tokenResponse.accessToken;
          req.session.idToken = tokenResponse.idToken;
          req.session.account = tokenResponse.account;
        }

        next();
      } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          return this.login({
            scopes: options.scopes || [],
            redirectUri: options.redirectUri,
            successRedirect: options.successRedirect || "/",
          })(req, res, next);
        }

        next(error);
      }
    };
  }

  handleRedirect() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body || !req.body.state) {
        return next(new Error("Error: response not found"));
      }

      const authCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code,
        codeVerifier: req.session.pkceCodes?.verifier,
      };

      try {
        const msalInstance = new msal.ConfidentialClientApplication(
          this.msalConfig
        );

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenByCode(
          authCodeRequest,
          req.body
        );

        req.session.tokenCache = msalInstance.getTokenCache().serialize();
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;
        req.session.isAuthenticated = true;

        const state = JSON.parse(
          this.cryptoProvider.base64Decode(req.body.state)
        );
        res.redirect(state.successRedirect);
      } catch (error) {
        next(error);
      }
    };
  }

  logout(postLogoutRedirectUri: string) {
    return (req: Request, res: Response) => {
      let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/`;

      if (postLogoutRedirectUri) {
        logoutUri += `logout?post_logout_redirect_uri=${postLogoutRedirectUri}`;
      }

      req.session.destroy(() => {
        res.redirect(logoutUri);
      });
    };
  }

  async getCloudDiscoveryMetadata(authority: string) {
    const endpoint =
      "https://login.microsoftonline.com/common/discovery/instance";

    const response = await axios.get(endpoint, {
      params: {
        "api-version": "1.1",
        authorization_endpoint: `${authority}/oauth2/v2.0/authorize`,
      },
    });

    return await response.data;
  }

  async getAuthorityMetadata(authority: string) {
    const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

    const response = await axios.get(endpoint);
    return await response.data;
  }
}

export default new AuthProvider(msalConfig);
