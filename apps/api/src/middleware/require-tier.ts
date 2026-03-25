import type { NextFunction, Request, Response } from "express";
import type { Tier } from "@station/db";

const TIER_RANK: Record<Tier, number> = {
  visitor:       0,
  private:       1,
  creator:       2,
  canon:         3,
  institutional: 4,
};

/**
 * Middleware factory — blocks requests from users below the required tier.
 * Must be used after requireAuth (which attaches req.user).
 *
 * Usage:
 *   router.post("/articles", requireAuth, requireTier("creator"), handler);
 */
export function requireTier(minimum: Tier) {
  return function tierGuard(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const userTier = req.user?.tier ?? "visitor";
    if (TIER_RANK[userTier] >= TIER_RANK[minimum]) {
      next();
    } else {
      res.status(403).json({
        error: `This action requires the '${minimum}' tier or above.`,
        yourTier: userTier,
        requiredTier: minimum,
      });
    }
  };
}
