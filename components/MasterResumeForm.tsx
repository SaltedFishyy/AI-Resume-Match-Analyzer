"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, FileUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { bulletProvenanceValues, type BulletProvenanceValue } from "@/lib/master-resume-validators";
import { extractPdfText, getReadablePdfError, validatePdfFile } from "@/lib/pdf-text-extraction";

type ApiBullet = {
  id?: string;
  text: string;
  tags: string[];
  provenance: BulletProvenanceValue;
  sourceNote: string | null;
  position: number;
};

type ApiEducation = {
  id?: string;
  school: string;
  degree: string | null;
  fieldOfStudy: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  position: number;
};

type ApiExperience = {
  id?: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  technologies: string[];
  position: number;
  bullets: ApiBullet[];
};

type ApiProject = {
  id?: string;
  name: string;
  url: string | null;
  repositoryUrl: string | null;
  technologies: string[];
  startDate: string | null;
  endDate: string | null;
  position: number;
  bullets: ApiBullet[];
};

type ApiSkill = {
  id?: string;
  name: string;
  category: string | null;
  position: number;
};

export type MasterResumeData = {
  id: string | null;
  education: ApiEducation[];
  experiences: ApiExperience[];
  projects: ApiProject[];
  skills: ApiSkill[];
};

type LocalBullet = ApiBullet & { clientId: string; tagsText: string };
type LocalEducation = ApiEducation & { clientId: string };
type LocalExperience = Omit<ApiExperience, "bullets"> & { clientId: string; technologiesText: string; bullets: LocalBullet[] };
type LocalProject = Omit<ApiProject, "bullets"> & { clientId: string; technologiesText: string; bullets: LocalBullet[] };
type LocalSkill = ApiSkill & { clientId: string };

type FormState = {
  education: LocalEducation[];
  experiences: LocalExperience[];
  projects: LocalProject[];
  skills: LocalSkill[];
};

type MasterResumeApiResponse = {
  masterResume?: MasterResumeData;
  saved?: boolean;
  error?: string;
};

const emptyState: FormState = {
  education: [],
  experiences: [],
  projects: [],
  skills: [],
};

function clientId() {
  return `local-${crypto.randomUUID()}`;
}

function listToText(items: string[]) {
  return items.join(", ");
}

function textToList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toInputValue(value: string | null | undefined) {
  return value ?? "";
}

function hydrate(data: MasterResumeData): FormState {
  return {
    education: data.education.map((item) => ({ ...item, clientId: clientId() })),
    experiences: data.experiences.map((item) => ({
      ...item,
      clientId: clientId(),
      technologiesText: listToText(item.technologies),
      bullets: item.bullets.map((bullet) => ({ ...bullet, clientId: clientId(), tagsText: listToText(bullet.tags) })),
    })),
    projects: data.projects.map((item) => ({
      ...item,
      clientId: clientId(),
      technologiesText: listToText(item.technologies),
      bullets: item.bullets.map((bullet) => ({ ...bullet, clientId: clientId(), tagsText: listToText(bullet.tags) })),
    })),
    skills: data.skills.map((item) => ({ ...item, clientId: clientId() })),
  };
}

function withPositions<T extends { position: number }>(items: T[]) {
  return items.map((item, position) => ({ ...item, position }));
}

function toPayload(state: FormState) {
  return {
    education: withPositions(state.education).map(({ clientId: _clientId, ...item }) => item),
    experiences: withPositions(state.experiences).map(({ clientId: _clientId, technologiesText, bullets, ...item }) => ({
      ...item,
      technologies: textToList(technologiesText),
      bullets: withPositions(bullets).map(({ clientId: _bulletClientId, tagsText, ...bullet }) => ({ ...bullet, tags: textToList(tagsText) })),
    })),
    projects: withPositions(state.projects).map(({ clientId: _clientId, technologiesText, bullets, ...item }) => ({
      ...item,
      technologies: textToList(technologiesText),
      bullets: withPositions(bullets).map(({ clientId: _bulletClientId, tagsText, ...bullet }) => ({ ...bullet, tags: textToList(tagsText) })),
    })),
    skills: withPositions(state.skills).map(({ clientId: _clientId, ...item }) => item),
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

function SectionHeader({ title, description, onAdd }: { title: string; description: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
    </div>
  );
}

function ItemActions({ onDelete, onMoveUp, onMoveDown }: { onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onMoveUp} className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={onMoveDown} className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="focus-ring rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MasterResumeForm() {
  const [state, setState] = useState<FormState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const hasContent = useMemo(
    () => state.education.length + state.experiences.length + state.projects.length + state.skills.length > 0,
    [state],
  );

  useEffect(() => {
    async function loadResume() {
      try {
        const response = await fetch("/api/master-resume");
        const data: MasterResumeApiResponse = await response.json();
        if (!response.ok || !data.masterResume) throw new Error(data.error ?? "Master resume could not be loaded.");
        setState(hydrate(data.masterResume));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Master resume could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadResume();
  }, []);

  function updateEducation(index: number, patch: Partial<LocalEducation>) {
    setState((current) => ({ ...current, education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
    setSuccess("");
  }

  function updateExperience(index: number, patch: Partial<LocalExperience>) {
    setState((current) => ({ ...current, experiences: current.experiences.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
    setSuccess("");
  }

  function updateProject(index: number, patch: Partial<LocalProject>) {
    setState((current) => ({ ...current, projects: current.projects.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
    setSuccess("");
  }

  function updateSkill(index: number, patch: Partial<LocalSkill>) {
    setState((current) => ({ ...current, skills: current.skills.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
    setSuccess("");
  }

  function addBullet(parent: "experiences" | "projects", parentIndex: number) {
    setState((current) => ({
      ...current,
      [parent]: current[parent].map((item, itemIndex) =>
        itemIndex === parentIndex
          ? {
              ...item,
              bullets: [
                ...item.bullets,
                {
                  clientId: clientId(),
                  text: "",
                  tags: [],
                  tagsText: "",
                  provenance: "USER_ENTERED",
                  sourceNote: null,
                  position: item.bullets.length,
                },
              ],
            }
          : item,
      ),
    }));
  }

  function updateBullet(parent: "experiences" | "projects", parentIndex: number, bulletIndex: number, patch: Partial<LocalBullet>) {
    setState((current) => ({
      ...current,
      [parent]: current[parent].map((item, itemIndex) =>
        itemIndex === parentIndex
          ? { ...item, bullets: item.bullets.map((bullet, index) => (index === bulletIndex ? { ...bullet, ...patch } : bullet)) }
          : item,
      ),
    }));
    setSuccess("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/master-resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(state)),
      });
      const data: MasterResumeApiResponse = await response.json();
      if (!response.ok || !data.masterResume) throw new Error(data.error ?? "Master resume could not be saved.");
      setState(hydrate(data.masterResume));
      setSuccess("Master resume saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Master resume could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePdfImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validatePdfFile(file);
    if (validationError) {
      setImportError(validationError);
      return;
    }

    setImportError("");
    setIsParsingPdf(true);
    let active = true;

    try {
      const text = await extractPdfText(file, () => active);
      if (text) setImportText(text);
    } catch (pdfError) {
      setImportError(getReadablePdfError(pdfError));
    } finally {
      active = false;
      setIsParsingPdf(false);
    }
  }

  if (isLoading) {
    return (
      <div className="surface-card mt-8 rounded-2xl p-8 text-sm font-semibold text-slate-500">
        Loading master resume...
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSave}>
      {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</p>}

      <section className="surface-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Import resume draft</h2>
            <p className="mt-1 text-sm text-slate-500">
              Import text for manual review. This never overwrites your saved Master Resume until you copy details into sections and save.
            </p>
          </div>
          <label className="focus-within:ring-blue-100 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus-within:outline-none focus-within:ring-4">
            {isParsingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {isParsingPdf ? "Extracting..." : "Upload PDF"}
            <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={isParsingPdf} onChange={handlePdfImport} />
          </label>
        </div>
        {importError && <p role="alert" className="mt-4 text-sm font-semibold text-rose-600">{importError}</p>}
        <textarea
          className="focus-ring mt-5 min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400"
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Paste resume text here as a draft reference. Then manually copy verified facts into Education, Experience, Projects, Skills, and bullets."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => setImportText("")}>
            Cancel import
          </button>
          {hasContent && <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Import draft will not replace existing saved sections.</span>}
        </div>
      </section>

      <section className="surface-card rounded-2xl p-6">
        <SectionHeader
          title="Education"
          description="Schools, degrees, and education notes."
          onAdd={() =>
            setState((current) => ({
              ...current,
              education: [
                ...current.education,
                { clientId: clientId(), school: "", degree: null, fieldOfStudy: null, location: null, startDate: null, endDate: null, notes: null, position: current.education.length },
              ],
            }))
          }
        />
        <div className="mt-5 space-y-5">
          {state.education.map((item, index) => (
            <div key={item.clientId} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex justify-end">
                <ItemActions
                  onMoveUp={() => setState((current) => ({ ...current, education: moveItem(current.education, index, -1) }))}
                  onMoveDown={() => setState((current) => ({ ...current, education: moveItem(current.education, index, 1) }))}
                  onDelete={() => setState((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="School" required value={item.school} onChange={(value) => updateEducation(index, { school: value })} />
                <TextField label="Degree" value={toInputValue(item.degree)} onChange={(value) => updateEducation(index, { degree: value })} />
                <TextField label="Field of study" value={toInputValue(item.fieldOfStudy)} onChange={(value) => updateEducation(index, { fieldOfStudy: value })} />
                <TextField label="Location" value={toInputValue(item.location)} onChange={(value) => updateEducation(index, { location: value })} />
                <TextField label="Start date" value={toInputValue(item.startDate)} onChange={(value) => updateEducation(index, { startDate: value })} placeholder="Sep 2022" />
                <TextField label="End date" value={toInputValue(item.endDate)} onChange={(value) => updateEducation(index, { endDate: value })} placeholder="May 2026" />
              </div>
              <div className="mt-4">
                <TextAreaField label="Notes" value={toInputValue(item.notes)} onChange={(value) => updateEducation(index, { notes: value })} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ResumeWorkSection
        title="Experience"
        description="Roles and factual bullets from your work history."
        items={state.experiences}
        kind="experiences"
        onAdd={() =>
          setState((current) => ({
            ...current,
            experiences: [
              ...current.experiences,
              { clientId: clientId(), company: "", title: "", location: null, startDate: null, endDate: null, isCurrent: false, technologies: [], technologiesText: "", position: current.experiences.length, bullets: [] },
            ],
          }))
        }
        onMove={(index, direction) => setState((current) => ({ ...current, experiences: moveItem(current.experiences, index, direction) }))}
        onDelete={(index) => setState((current) => ({ ...current, experiences: current.experiences.filter((_, itemIndex) => itemIndex !== index) }))}
        onUpdate={updateExperience}
        onAddBullet={addBullet}
        onUpdateBullet={updateBullet}
        onDeleteBullet={(itemIndex, bulletIndex) =>
          setState((current) => ({
            ...current,
            experiences: current.experiences.map((item, index) => (index === itemIndex ? { ...item, bullets: item.bullets.filter((_, bIndex) => bIndex !== bulletIndex) } : item)),
          }))
        }
      />

      <ResumeWorkSection
        title="Projects"
        description="Projects and factual bullets that can be selected later."
        items={state.projects}
        kind="projects"
        onAdd={() =>
          setState((current) => ({
            ...current,
            projects: [
              ...current.projects,
              { clientId: clientId(), name: "", url: null, repositoryUrl: null, technologies: [], technologiesText: "", startDate: null, endDate: null, position: current.projects.length, bullets: [] },
            ],
          }))
        }
        onMove={(index, direction) => setState((current) => ({ ...current, projects: moveItem(current.projects, index, direction) }))}
        onDelete={(index) => setState((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}
        onUpdate={updateProject}
        onAddBullet={addBullet}
        onUpdateBullet={updateBullet}
        onDeleteBullet={(itemIndex, bulletIndex) =>
          setState((current) => ({
            ...current,
            projects: current.projects.map((item, index) => (index === itemIndex ? { ...item, bullets: item.bullets.filter((_, bIndex) => bIndex !== bulletIndex) } : item)),
          }))
        }
      />

      <section className="surface-card rounded-2xl p-6">
        <SectionHeader
          title="Skills"
          description="Skills with optional grouping for future tailored resumes."
          onAdd={() => setState((current) => ({ ...current, skills: [...current.skills, { clientId: clientId(), name: "", category: null, position: current.skills.length }] }))}
        />
        <div className="mt-5 space-y-4">
          {state.skills.map((item, index) => (
            <div key={item.clientId} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TextField label="Skill" required value={item.name} onChange={(value) => updateSkill(index, { name: value })} />
              <TextField label="Category" value={toInputValue(item.category)} onChange={(value) => updateSkill(index, { category: value })} placeholder="Backend, AI, Data..." />
              <ItemActions
                onMoveUp={() => setState((current) => ({ ...current, skills: moveItem(current.skills, index, -1) }))}
                onMoveDown={() => setState((current) => ({ ...current, skills: moveItem(current.skills, index, 1) }))}
                onDelete={() => setState((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="surface-card sticky bottom-4 flex flex-col gap-3 rounded-2xl p-4 shadow-xl shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Only user-confirmed structured facts are saved to your Master Resume.</p>
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save master resume"}
        </button>
      </div>
    </form>
  );
}

type WorkItem = LocalExperience | LocalProject;

function ResumeWorkSection({
  title,
  description,
  items,
  kind,
  onAdd,
  onMove,
  onDelete,
  onUpdate,
  onAddBullet,
  onUpdateBullet,
  onDeleteBullet,
}: {
  title: string;
  description: string;
  items: WorkItem[];
  kind: "experiences" | "projects";
  onAdd: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, patch: Partial<LocalExperience> | Partial<LocalProject>) => void;
  onAddBullet: (parent: "experiences" | "projects", parentIndex: number) => void;
  onUpdateBullet: (parent: "experiences" | "projects", parentIndex: number, bulletIndex: number, patch: Partial<LocalBullet>) => void;
  onDeleteBullet: (parentIndex: number, bulletIndex: number) => void;
}) {
  const isExperience = kind === "experiences";

  return (
    <section className="surface-card rounded-2xl p-6">
      <SectionHeader title={title} description={description} onAdd={onAdd} />
      <div className="mt-5 space-y-5">
        {items.map((item, index) => (
          <div key={item.clientId} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex justify-end">
              <ItemActions onMoveUp={() => onMove(index, -1)} onMoveDown={() => onMove(index, 1)} onDelete={() => onDelete(index)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {isExperience ? (
                <>
                  <TextField label="Company" required value={(item as LocalExperience).company} onChange={(value) => onUpdate(index, { company: value })} />
                  <TextField label="Job title" required value={(item as LocalExperience).title} onChange={(value) => onUpdate(index, { title: value })} />
                </>
              ) : (
                <>
                  <TextField label="Project name" required value={(item as LocalProject).name} onChange={(value) => onUpdate(index, { name: value })} />
                  <TextField label="Project URL" type="url" value={toInputValue((item as LocalProject).url)} onChange={(value) => onUpdate(index, { url: value })} />
                  <TextField label="Repository URL" type="url" value={toInputValue((item as LocalProject).repositoryUrl)} onChange={(value) => onUpdate(index, { repositoryUrl: value })} />
                </>
              )}
              {isExperience && <TextField label="Location" value={toInputValue((item as LocalExperience).location)} onChange={(value) => onUpdate(index, { location: value })} />}
              <TextField label="Start date" value={toInputValue(item.startDate)} onChange={(value) => onUpdate(index, { startDate: value })} />
              <TextField label="End date" value={toInputValue(item.endDate)} onChange={(value) => onUpdate(index, { endDate: value })} />
              <TextField label="Technologies" value={item.technologiesText} onChange={(value) => onUpdate(index, { technologiesText: value })} placeholder="React, PostgreSQL, Redis" />
              {isExperience && (
                <label className="flex items-center gap-2 pt-8 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={(item as LocalExperience).isCurrent}
                    onChange={(event) => onUpdate(index, { isCurrent: event.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Current role
                </label>
              )}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-950">Bullets</h3>
                <button type="button" onClick={() => onAddBullet(kind, index)} className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50">
                  <Plus className="h-3.5 w-3.5" /> Add bullet
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {item.bullets.map((bullet, bulletIndex) => (
                  <div key={bullet.clientId} className="rounded-xl bg-slate-50/70 p-4">
                    <TextAreaField label="Bullet text" required value={bullet.text} onChange={(value) => onUpdateBullet(kind, index, bulletIndex, { text: value })} />
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <TextField label="Tags" value={bullet.tagsText} onChange={(value) => onUpdateBullet(kind, index, bulletIndex, { tagsText: value })} placeholder="Backend, AI" />
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-700">Provenance</span>
                        <select
                          className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950"
                          value={bullet.provenance}
                          onChange={(event) => onUpdateBullet(kind, index, bulletIndex, { provenance: event.target.value as BulletProvenanceValue })}
                        >
                          {bulletProvenanceValues.map((value) => (
                            <option key={value} value={value}>
                              {value.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </label>
                      <TextField label="Source note" value={toInputValue(bullet.sourceNote)} onChange={(value) => onUpdateBullet(kind, index, bulletIndex, { sourceNote: value })} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => onDeleteBullet(index, bulletIndex)} className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
