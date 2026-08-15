"use client";

import { FormEvent, useState } from "react";

export type ProfileData = {
  legalName: string | null;
  preferredName: string | null;
  contactEmail: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  workAuthorizationStatus: string | null;
  requiresSponsorshipNow: boolean | null;
  requiresSponsorshipInFuture: boolean | null;
  earliestStartDate: string | null;
  relocationPreference: string | null;
  commonRoleTargets: string[];
};

type ProfileFormProps = {
  accountEmail: string;
  initialProfile: ProfileData;
};

type FormState = Omit<ProfileData, "requiresSponsorshipNow" | "requiresSponsorshipInFuture" | "commonRoleTargets"> & {
  requiresSponsorshipNow: "" | "true" | "false";
  requiresSponsorshipInFuture: "" | "true" | "false";
  commonRoleTargets: string;
};

const emptyProfile: ProfileData = {
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

function boolToSelect(value: boolean | null) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function selectToBool(value: "" | "true" | "false") {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function toFormState(profile: ProfileData): FormState {
  return {
    legalName: profile.legalName ?? "",
    preferredName: profile.preferredName ?? "",
    contactEmail: profile.contactEmail ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",
    linkedInUrl: profile.linkedInUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    portfolioUrl: profile.portfolioUrl ?? "",
    workAuthorizationStatus: profile.workAuthorizationStatus ?? "",
    requiresSponsorshipNow: boolToSelect(profile.requiresSponsorshipNow),
    requiresSponsorshipInFuture: boolToSelect(profile.requiresSponsorshipInFuture),
    earliestStartDate: profile.earliestStartDate ?? "",
    relocationPreference: profile.relocationPreference ?? "",
    commonRoleTargets: profile.commonRoleTargets.join("\n"),
  };
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400"
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function BooleanSelect({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: "requiresSponsorshipNow" | "requiresSponsorshipInFuture";
  value: "" | "true" | "false";
  onChange: (name: keyof FormState, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950"
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      >
        <option value="">Not specified</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </label>
  );
}

export function ProfileForm({ accountEmail, initialProfile }: ProfileFormProps) {
  const [form, setForm] = useState<FormState>(toFormState({ ...emptyProfile, ...initialProfile }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requiresSponsorshipNow: selectToBool(form.requiresSponsorshipNow),
          requiresSponsorshipInFuture: selectToBool(form.requiresSponsorshipInFuture),
        }),
      });
      const data: { profile?: ProfileData; error?: string } = await response.json();

      if (!response.ok || !data.profile) {
        throw new Error(data.error ?? "Profile could not be saved. Please try again.");
      }

      setForm(toFormState(data.profile));
      setSuccess("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profile could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="surface-card mt-8 rounded-2xl p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Reusable application details</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Your account email is {accountEmail}. Your application contact email can be different.
          </p>
        </div>
        <button
          className="focus-ring rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </div>

      {success && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{success}</div>}
      {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="divide-y divide-slate-200">
        <section className="grid gap-5 py-7 lg:grid-cols-[14rem_1fr]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Personal information</h3>
            <p className="mt-1 text-sm text-slate-500">Names you commonly use on applications.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Legal name" name="legalName" value={form.legalName ?? ""} onChange={updateField} />
            <Field label="Preferred name" name="preferredName" value={form.preferredName ?? ""} onChange={updateField} />
          </div>
        </section>

        <section className="grid gap-5 py-7 lg:grid-cols-[14rem_1fr]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Contact</h3>
            <p className="mt-1 text-sm text-slate-500">Application contact details, separate from your login identity.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Application contact email" name="contactEmail" type="email" value={form.contactEmail ?? ""} onChange={updateField} />
            <Field label="Phone" name="phone" value={form.phone ?? ""} onChange={updateField} />
            <Field label="City" name="city" value={form.city ?? ""} onChange={updateField} />
            <Field label="State" name="state" value={form.state ?? ""} onChange={updateField} />
            <Field label="Country" name="country" value={form.country ?? ""} onChange={updateField} />
          </div>
        </section>

        <section className="grid gap-5 py-7 lg:grid-cols-[14rem_1fr]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Professional links</h3>
            <p className="mt-1 text-sm text-slate-500">Links that often appear on job applications.</p>
          </div>
          <div className="grid gap-5">
            <Field label="LinkedIn URL" name="linkedInUrl" type="url" value={form.linkedInUrl ?? ""} onChange={updateField} placeholder="https://www.linkedin.com/in/..." />
            <Field label="GitHub URL" name="githubUrl" type="url" value={form.githubUrl ?? ""} onChange={updateField} placeholder="https://github.com/..." />
            <Field label="Portfolio URL" name="portfolioUrl" type="url" value={form.portfolioUrl ?? ""} onChange={updateField} placeholder="https://..." />
          </div>
        </section>

        <section className="grid gap-5 py-7 lg:grid-cols-[14rem_1fr]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Work authorization</h3>
            <p className="mt-1 text-sm text-slate-500">User-entered fields for future confirmation-sensitive workflows.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Work authorization status" name="workAuthorizationStatus" value={form.workAuthorizationStatus ?? ""} onChange={updateField} />
            <BooleanSelect label="Require sponsorship now" name="requiresSponsorshipNow" value={form.requiresSponsorshipNow} onChange={updateField} />
            <BooleanSelect label="Require sponsorship in future" name="requiresSponsorshipInFuture" value={form.requiresSponsorshipInFuture} onChange={updateField} />
          </div>
        </section>

        <section className="grid gap-5 pt-7 lg:grid-cols-[14rem_1fr]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Availability & preferences</h3>
            <p className="mt-1 text-sm text-slate-500">Details that may change by timing or role.</p>
          </div>
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Earliest start date" name="earliestStartDate" type="date" value={form.earliestStartDate ?? ""} onChange={updateField} />
              <Field label="Relocation preference" name="relocationPreference" value={form.relocationPreference ?? ""} onChange={updateField} />
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Common role targets</span>
              <textarea
                className="focus-ring mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400"
                value={form.commonRoleTargets}
                placeholder="Backend engineer&#10;Full-stack engineer&#10;Data analyst"
                onChange={(event) => updateField("commonRoleTargets", event.target.value)}
              />
              <span className="mt-2 block text-xs font-medium text-slate-500">Up to 10 items, separated by commas or new lines.</span>
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}
