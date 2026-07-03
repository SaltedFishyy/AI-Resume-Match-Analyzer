"use client";

type JobDescriptionInputProps = { value?: string; onChange?: (value: string) => void };

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return <textarea name="jobDescription" value={value} onChange={(event) => onChange?.(event.target.value)} rows={16} required placeholder="Paste the job description here…" className="w-full resize-y rounded-lg border bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-primary" />;
}
