import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import {
  handleSignUp,
  handleSignIn,
  handleSignOut,
  handleMe,
} from "../controllers/auth.controller";

export const authRouter = Router();

// POST /auth/signup
authRouter.post("/signup", handleSignUp);

// POST /auth/signin
authRouter.post("/signin", handleSignIn);

// POST /auth/signout  (requires valid token)
authRouter.post("/signout", requireAuth, handleSignOut);

// GET /auth/me  (returns current user info)
authRouter.get("/me", requireAuth, handleMe);
