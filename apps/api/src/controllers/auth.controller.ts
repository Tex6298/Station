import type { Request, Response } from "express";
import { signUp, signIn, signOut } from "../services/auth.service";
import { signUpSchema, signInSchema } from "../schemas/auth.schema";

export async function handleSignUp(req: Request, res: Response): Promise<void> {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await signUp(parsed.data as Parameters<typeof signUp>[0]);
    res.status(201).json({
      userId: result.userId,
      email: result.email,
      tier: result.tier,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed.";
    res.status(400).json({ error: message });
  }
}

export async function handleSignIn(req: Request, res: Response): Promise<void> {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await signIn(parsed.data as Parameters<typeof signIn>[0]);
    res.status(200).json({
      userId: result.userId,
      email: result.email,
      tier: result.tier,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed.";
    res.status(401).json({ error: message });
  }
}

export async function handleSignOut(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(400).json({ error: "Missing Authorization header." });
    return;
  }

  try {
    await signOut(authHeader.slice(7));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Sign out failed." });
  }
}

export async function handleMe(req: Request, res: Response): Promise<void> {
  // req.user is attached by requireAuth middleware
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  res.status(200).json({ user: req.user });
}
