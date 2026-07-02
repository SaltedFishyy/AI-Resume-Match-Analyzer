type ResumeInputProps = { value?: string; onChange?: (value: string) => void };

export function ResumeInput({ value, onChange }: ResumeInputProps) {
  return <textarea name="resumeText" value={value} onChange={(event) => onChange?.(event.target.value)} rows={16} required placeholder="Paste your resume text here…" className="w-full resize-y rounded-lg border bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-primary" />;
}
