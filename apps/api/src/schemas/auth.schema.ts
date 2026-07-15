import { z } from "zod";

const MAX_SIGNUP_PASSWORD_BYTES = 72;
const SIGNUP_PASSWORD_MAX_BYTES_MESSAGE = "Password must be 72 bytes or fewer.";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine((password) => Buffer.byteLength(password, "utf8") <= MAX_SIGNUP_PASSWORD_BYTES, {
      message: SIGNUP_PASSWORD_MAX_BYTES_MESSAGE,
    }),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or fewer.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, underscores, and hyphens."),
  displayName: z.string().max(60).optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
