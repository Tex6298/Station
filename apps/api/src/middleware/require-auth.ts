import type { NextFunction, Request, Response } from "express";
import { validateToken } from "../services/auth.service";
import type { Tier } from "@station/db";

export interface AuthenticatedUser {
  id: string;
  tier: Tier;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Validates the Bearer token in the Authorization header.
 * Attaches req.user if valid, otherwise returns 401.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header." });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const result = await validateToken(token);
    if (!result) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }
    req.user = {
      id: result.userId,
      tier: result.tier,
      isAdmin: result.isAdmin,
    };
    next();
  } catch {
    res.status(401).json({ error: "Authentication failed." });
  }
}

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but does not block the request if no token is provided.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const result = await validateToken(token);
      if (result) {
        req.user = {
          id: result.userId,
          tier: result.tier,
          isAdmin: result.isAdmin,
        };
      }
    } catch {
      // silently ignore — optional auth doesn't block
    }
  }
  next();
}
