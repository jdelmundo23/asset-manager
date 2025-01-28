import express, { RequestHandler } from "express";
import authProvider from "../../auth/AuthProvider";
import { REDIRECT_URI } from "../../authConfig";

const checkAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.account) {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};

const router = express.Router();

router.use(
  authProvider.acquireToken({
    scopes: ["User.Read"],
    redirectUri: REDIRECT_URI as string,
    successRedirect: "http://localhost:3000/dashboard",
  })
);
router.use(checkAuthenticated);

export default router;
