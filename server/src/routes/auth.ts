import authProvider from "../auth/AuthProvider";
import express from "express";
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from "../authConfig";

const router = express.Router();

router.get(
  "/signin",
  authProvider.login({
    scopes: ["User.Read"],
    redirectUri: REDIRECT_URI as string,
    successRedirect: "http://localhost:3000/dashboard",
  })
);

router.post("/redirect", authProvider.handleRedirect());

router.get("/user", function (req, res) {
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

router.get("/signout", authProvider.logout(POST_LOGOUT_REDIRECT_URI as string));

export default router;
