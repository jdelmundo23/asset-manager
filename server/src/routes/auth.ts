import authProvider from "../auth/AuthProvider";
import express from "express";
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from "../authConfig";
import { mockAuthData } from "../../tests/mockdata/mockauth";

const devMode = process.env.DEV_MODE === "true";
const clientURL = process.env.CLIENT_ORIGIN ?? "http://localhost:3000/";

const router = express.Router();

router.get("/signin", (req, res, next) => {
  if (devMode) {
    return res.redirect(clientURL);
  }

  return authProvider.login({
    scopes: ["User.Read"],
    redirectUri: REDIRECT_URI as string,
    successRedirect: clientURL,
  })(req, res, next);
});

router.post("/redirect", authProvider.handleRedirect());

router.get("/user", (req, res) => {
  if (devMode) {
    res.status(200).json(mockAuthData);
    return;
  }

  if (req.session.account) {
    res.status(200).json({
      authenticated: req.session.isAuthenticated,
      upn: req.session.account?.username,
      name: req.session.account?.name,
      roles: req.session.account?.idTokenClaims?.roles,
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

router.get("/signout", (req, res) => {
  if (devMode) {
    return res.redirect(clientURL);
  }
  return authProvider.logout(POST_LOGOUT_REDIRECT_URI as string)(req, res);
});

export default router;
