import express from "express";
import authProvider from "@server/src/auth/AuthProvider";
import { REDIRECT_URI } from "@server/src/authConfig";

const devMode = process.env.DEV_MODE === "true";
const clientURL = process.env.CLIENT_ORIGIN ?? "http://localhost:3000/";
const adminRole = process.env.ENTRA_ROLE_ADMIN!;

const router = express.Router();

if (!devMode) {
  router.use(
    authProvider.acquireToken({
      scopes: ["User.Read", "GroupMember.Read.All", "Directory.Read.All"],
      redirectUri: REDIRECT_URI as string,
      successRedirect: clientURL,
    })
  );

  router.use((req, res, next) => {
    const account = req.session.account;

    if (!account) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const roles = account.idTokenClaims?.roles ?? [];

    if (req.method !== "GET" && !roles.includes(adminRole)) {
      return res.status(403).json({ error: "Admin role required" });
    }

    next();
  });
}

export default router;
