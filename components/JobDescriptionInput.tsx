"use client";

type JobDescriptionInputProps = { value?: string; onChange?: (value: string) => void };

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <textarea
      id="jobDescription"
      name="jobDescription"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      rows={16}
      required
      placeholder="Paste the job description here..."
      className="mt-5 min-h-96 w-full resize-y rounded-xl border bg-background p-4 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}
