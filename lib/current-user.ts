import { auth, currentUser } from "@clerk/nextjs/server";
import { canUseLocalPreviewAuth, isClerkConfigured } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

const LOCAL_PREVIEW_CLERK_ID = "local-preview-user";
const LOCAL_PREVIEW_EMAIL = "local-preview@career-copilot.local";

export async function getCurrentAppUser() {
  if (canUseLocalPreviewAuth) {
    return prisma.user.upsert({
      where: { clerkId: LOCAL_PREVIEW_CLERK_ID },
      update: {},
      create: {
        clerkId: LOCAL_PREVIEW_CLERK_ID,
        email: LOCAL_PREVIEW_EMAIL,
      },
    });
  }

  if (!isClerkConfigured) {
    throw new Error("Authentication is not configured.");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("You must be signed in.");

  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existingUser) return existingUser;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("The signed-in user could not be loaded.");

  const email =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${userId}@clerk.career-copilot.local`;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email },
    create: { clerkId: userId, email },
  });
}
