import express from "express";
import authProvider from "../../auth/AuthProvider";
import { REDIRECT_URI } from "../../authConfig";

const devMode = process.env.DEV_MODE === "true";

const router = express.Router();

if (!devMode) {
  router.use(
    authProvider.acquireToken({
      scopes: ["User.Read", "GroupMember.Read.All", "Directory.Read.All"],
      redirectUri: REDIRECT_URI as string,
      successRedirect: "http://localhost:3000/",
    })
  );

  router.use((req, res, next) => {
    if (!req.session.account) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    next();
  });
}

export default router;
