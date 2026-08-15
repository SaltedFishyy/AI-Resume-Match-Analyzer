import { AppShell } from "@/components/AppShell";
import { ProfileData, ProfileForm } from "@/components/ProfileForm";
import { getCurrentAppUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toDateOnly(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function emptyProfile(): ProfileData {
  return {
    legalName: null,
    preferredName: null,
    contactEmail: null,
    phone: null,
    city: null,
    state: null,
    country: null,
    linkedInUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    workAuthorizationStatus: null,
    requiresSponsorshipNow: null,
    requiresSponsorshipInFuture: null,
    earliestStartDate: null,
    relocationPreference: null,
    commonRoleTargets: [],
  };
}

export default async function ProfilePage() {
  const user = await getCurrentAppUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const initialProfile: ProfileData = profile
    ? {
        legalName: profile.legalName,
        preferredName: profile.preferredName,
        contactEmail: profile.contactEmail,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        linkedInUrl: profile.linkedInUrl,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        workAuthorizationStatus: profile.workAuthorizationStatus,
        requiresSponsorshipNow: profile.requiresSponsorshipNow,
        requiresSponsorshipInFuture: profile.requiresSponsorshipInFuture,
        earliestStartDate: toDateOnly(profile.earliestStartDate),
        relocationPreference: profile.relocationPreference,
        commonRoleTargets: profile.commonRoleTargets,
      }
    : emptyProfile();

  return (
    <AppShell>
      <p className="eyebrow">Profile</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Application profile</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Save reusable contact and preference details for future applications.
      </p>
      <ProfileForm accountEmail={user.email} initialProfile={initialProfile} />
    </AppShell>
  );
}
