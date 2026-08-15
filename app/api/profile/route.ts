import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentAppUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { profileInputSchema } from "@/lib/validators";

function toDateOnly(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toProfileResponse(profile: Awaited<ReturnType<typeof prisma.userProfile.findUnique>>) {
  return {
    legalName: profile?.legalName ?? null,
    preferredName: profile?.preferredName ?? null,
    contactEmail: profile?.contactEmail ?? null,
    phone: profile?.phone ?? null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    country: profile?.country ?? null,
    linkedInUrl: profile?.linkedInUrl ?? null,
    githubUrl: profile?.githubUrl ?? null,
    portfolioUrl: profile?.portfolioUrl ?? null,
    workAuthorizationStatus: profile?.workAuthorizationStatus ?? null,
    requiresSponsorshipNow: profile?.requiresSponsorshipNow ?? null,
    requiresSponsorshipInFuture: profile?.requiresSponsorshipInFuture ?? null,
    earliestStartDate: toDateOnly(profile?.earliestStartDate ?? null),
    relocationPreference: profile?.relocationPreference ?? null,
    commonRoleTargets: profile?.commonRoleTargets ?? [],
  };
}

function toStoredDate(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function getErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Please check the highlighted profile fields and try again." }, { status: 400 });
  }

  if (error instanceof Error && error.message === "Authentication is not configured.") {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  if (error instanceof Error && error.message === "You must be signed in.") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.error("Profile request failed:", error);
  return NextResponse.json({ error: "Profile could not be loaded or saved. Please try again." }, { status: 500 });
}

export async function GET() {
  try {
    const user = await getCurrentAppUser();
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });

    return NextResponse.json({ profile: toProfileResponse(profile), accountEmail: user.email });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentAppUser();
    const body: unknown = await request.json();
    const profileInput = profileInputSchema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...profileInput,
        earliestStartDate: toStoredDate(profileInput.earliestStartDate),
      },
      create: {
        userId: user.id,
        ...profileInput,
        earliestStartDate: toStoredDate(profileInput.earliestStartDate),
      },
    });

    return NextResponse.json({ profile: toProfileResponse(profile), saved: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
    }

    return getErrorResponse(error);
  }
}
