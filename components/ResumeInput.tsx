"use client";

type ResumeInputProps = { value?: string; onChange?: (value: string) => void };

export function ResumeInput({ value, onChange }: ResumeInputProps) {
  return (
    <textarea
      id="resumeText"
      name="resumeText"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      rows={16}
      maxLength={50_000}
      required
      placeholder="Paste your resume text here..."
      className="min-h-80 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}
