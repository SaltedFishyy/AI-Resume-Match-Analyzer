import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentAppUser } from "@/lib/current-user";
import { masterResumeInputSchema, type MasterResumeInput } from "@/lib/master-resume-validators";
import { prisma } from "@/lib/prisma";

const includeResumeRelations = {
  education: { orderBy: { position: "asc" as const } },
  experiences: { orderBy: { position: "asc" as const }, include: { bullets: { orderBy: { position: "asc" as const } } } },
  projects: { orderBy: { position: "asc" as const }, include: { bullets: { orderBy: { position: "asc" as const } } } },
  skills: { orderBy: { position: "asc" as const } },
};

class ResumeOwnershipError extends Error {
  constructor() {
    super("Master resume item does not belong to the current user.");
  }
}

function emptyMasterResumeResponse() {
  return { id: null, education: [], experiences: [], projects: [], skills: [] };
}

type LoadedMasterResume = Awaited<ReturnType<typeof loadMasterResume>>;

function toMasterResumeResponse(masterResume: NonNullable<LoadedMasterResume>) {
  return {
    id: masterResume.id,
    education: masterResume.education.map((item) => ({
      id: item.id,
      school: item.school,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      notes: item.notes,
      position: item.position,
    })),
    experiences: masterResume.experiences.map((item) => ({
      id: item.id,
      company: item.company,
      title: item.title,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      isCurrent: item.isCurrent,
      technologies: item.technologies,
      position: item.position,
      bullets: item.bullets.map((bullet) => ({
        id: bullet.id,
        text: bullet.text,
        tags: bullet.tags,
        provenance: bullet.provenance,
        sourceNote: bullet.sourceNote,
        position: bullet.position,
      })),
    })),
    projects: masterResume.projects.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      repositoryUrl: item.repositoryUrl,
      technologies: item.technologies,
      startDate: item.startDate,
      endDate: item.endDate,
      position: item.position,
      bullets: item.bullets.map((bullet) => ({
        id: bullet.id,
        text: bullet.text,
        tags: bullet.tags,
        provenance: bullet.provenance,
        sourceNote: bullet.sourceNote,
        position: bullet.position,
      })),
    })),
    skills: masterResume.skills.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      position: item.position,
    })),
  };
}

function idsFrom(items: { id?: string }[]) {
  return items.map((item) => item.id).filter((id): id is string => Boolean(id));
}

function assertKnownIds(inputIds: string[], existingIds: Set<string>) {
  for (const id of inputIds) {
    if (!existingIds.has(id)) throw new ResumeOwnershipError();
  }
}

async function loadMasterResume(userId: string) {
  return prisma.masterResume.findUnique({
    where: { userId },
    include: includeResumeRelations,
  });
}

async function saveMasterResume(userId: string, input: MasterResumeInput) {
  return prisma.$transaction(async (tx) => {
    const masterResume = await tx.masterResume.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const [existingEducation, existingExperiences, existingProjects, existingSkills, existingBullets] = await Promise.all([
      tx.resumeEducation.findMany({ where: { masterResumeId: masterResume.id }, select: { id: true } }),
      tx.resumeExperience.findMany({ where: { masterResumeId: masterResume.id }, select: { id: true } }),
      tx.resumeProject.findMany({ where: { masterResumeId: masterResume.id }, select: { id: true } }),
      tx.resumeSkill.findMany({ where: { masterResumeId: masterResume.id }, select: { id: true } }),
      tx.resumeBullet.findMany({ where: { masterResumeId: masterResume.id }, select: { id: true } }),
    ]);

    assertKnownIds(idsFrom(input.education), new Set(existingEducation.map((item) => item.id)));
    assertKnownIds(idsFrom(input.experiences), new Set(existingExperiences.map((item) => item.id)));
    assertKnownIds(idsFrom(input.projects), new Set(existingProjects.map((item) => item.id)));
    assertKnownIds(idsFrom(input.skills), new Set(existingSkills.map((item) => item.id)));
    assertKnownIds(
      [...input.experiences.flatMap((item) => idsFrom(item.bullets)), ...input.projects.flatMap((item) => idsFrom(item.bullets))],
      new Set(existingBullets.map((item) => item.id)),
    );

    await tx.resumeEducation.deleteMany({ where: { masterResumeId: masterResume.id, id: { notIn: idsFrom(input.education) } } });
    await tx.resumeExperience.deleteMany({ where: { masterResumeId: masterResume.id, id: { notIn: idsFrom(input.experiences) } } });
    await tx.resumeProject.deleteMany({ where: { masterResumeId: masterResume.id, id: { notIn: idsFrom(input.projects) } } });
    await tx.resumeSkill.deleteMany({ where: { masterResumeId: masterResume.id, id: { notIn: idsFrom(input.skills) } } });

    for (const item of input.education) {
      const data = {
        school: item.school,
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        notes: item.notes,
        position: item.position,
      };
      if (item.id) await tx.resumeEducation.update({ where: { id: item.id }, data });
      else await tx.resumeEducation.create({ data: { ...data, masterResumeId: masterResume.id } });
    }

    for (const item of input.skills) {
      const data = { name: item.name, category: item.category, position: item.position };
      if (item.id) await tx.resumeSkill.update({ where: { id: item.id }, data });
      else await tx.resumeSkill.create({ data: { ...data, masterResumeId: masterResume.id } });
    }

    for (const item of input.experiences) {
      const data = {
        company: item.company,
        title: item.title,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.isCurrent,
        technologies: item.technologies,
        position: item.position,
      };
      const experience = item.id
        ? await tx.resumeExperience.update({ where: { id: item.id }, data })
        : await tx.resumeExperience.create({ data: { ...data, masterResumeId: masterResume.id } });

      await tx.resumeBullet.deleteMany({
        where: { masterResumeId: masterResume.id, experienceId: experience.id, id: { notIn: idsFrom(item.bullets) } },
      });

      for (const bullet of item.bullets) {
        const bulletData = {
          text: bullet.text,
          tags: bullet.tags,
          provenance: bullet.provenance,
          sourceNote: bullet.sourceNote,
          position: bullet.position,
          experienceId: experience.id,
          projectId: null,
        };
        if (bullet.id) await tx.resumeBullet.update({ where: { id: bullet.id }, data: bulletData });
        else await tx.resumeBullet.create({ data: { ...bulletData, masterResumeId: masterResume.id } });
      }
    }

    for (const item of input.projects) {
      const data = {
        name: item.name,
        url: item.url,
        repositoryUrl: item.repositoryUrl,
        technologies: item.technologies,
        startDate: item.startDate,
        endDate: item.endDate,
        position: item.position,
      };
      const project = item.id
        ? await tx.resumeProject.update({ where: { id: item.id }, data })
        : await tx.resumeProject.create({ data: { ...data, masterResumeId: masterResume.id } });

      await tx.resumeBullet.deleteMany({
        where: { masterResumeId: masterResume.id, projectId: project.id, id: { notIn: idsFrom(item.bullets) } },
      });

      for (const bullet of item.bullets) {
        const bulletData = {
          text: bullet.text,
          tags: bullet.tags,
          provenance: bullet.provenance,
          sourceNote: bullet.sourceNote,
          position: bullet.position,
          experienceId: null,
          projectId: project.id,
        };
        if (bullet.id) await tx.resumeBullet.update({ where: { id: bullet.id }, data: bulletData });
        else await tx.resumeBullet.create({ data: { ...bulletData, masterResumeId: masterResume.id } });
      }
    }

    return tx.masterResume.findUniqueOrThrow({
      where: { id: masterResume.id },
      include: includeResumeRelations,
    });
  });
}

function getErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Please check the master resume fields and try again." }, { status: 400 });
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  if (error instanceof ResumeOwnershipError) {
    return NextResponse.json({ error: "This resume item could not be saved." }, { status: 403 });
  }

  if (error instanceof Error && error.message === "Authentication is not configured.") {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  if (error instanceof Error && error.message === "You must be signed in.") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.error("Master resume request failed:", error);
  return NextResponse.json({ error: "Master resume could not be loaded or saved. Please try again." }, { status: 500 });
}

export async function GET() {
  try {
    const user = await getCurrentAppUser();
    const masterResume = await loadMasterResume(user.id);
    return NextResponse.json({ masterResume: masterResume ? toMasterResumeResponse(masterResume) : emptyMasterResumeResponse() });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentAppUser();
    const body: unknown = await request.json();
    const input = masterResumeInputSchema.parse(body);
    const masterResume = await saveMasterResume(user.id, input);
    return NextResponse.json({ masterResume: toMasterResumeResponse(masterResume), saved: true });
  } catch (error) {
    return getErrorResponse(error);
  }
}
