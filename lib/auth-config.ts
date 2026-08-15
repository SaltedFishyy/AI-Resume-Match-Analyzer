export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export const canUseLocalPreviewAuth = !isClerkConfigured && process.env.NODE_ENV !== "production";
