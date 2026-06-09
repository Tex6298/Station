export const PASSWORD_RESET_UPDATE_PATH = "/reset-password/update";

export function passwordResetRedirectUrl(origin: string): string {
  return `${origin.replace(/\/+$/, "")}${PASSWORD_RESET_UPDATE_PATH}`;
}

export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (!password || !confirmPassword) return "Enter and confirm your new password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}
