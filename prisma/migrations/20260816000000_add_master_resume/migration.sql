-- CreateEnum
CREATE TYPE "BulletProvenance" AS ENUM ('USER_ENTERED', 'IMPORTED_FROM_RESUME_TEXT', 'IMPORTED_FROM_PDF', 'USER_CONFIRMED_AI_SUGGESTION');

-- CreateTable
CREATE TABLE "MasterResume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "location" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "notes" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeExperience" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "position" INTEGER NOT NULL,

    CONSTRAINT "ResumeExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProject" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "repositoryUrl" TEXT,
    "technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "startDate" TEXT,
    "endDate" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ResumeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeBullet" (
    "id" TEXT NOT NULL,
    "masterResumeId" TEXT NOT NULL,
    "experienceId" TEXT,
    "projectId" TEXT,
    "text" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "provenance" "BulletProvenance" NOT NULL,
    "sourceNote" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeBullet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterResume_userId_key" ON "MasterResume"("userId");

-- CreateIndex
CREATE INDEX "ResumeEducation_masterResumeId_position_idx" ON "ResumeEducation"("masterResumeId", "position");

-- CreateIndex
CREATE INDEX "ResumeExperience_masterResumeId_position_idx" ON "ResumeExperience"("masterResumeId", "position");

-- CreateIndex
CREATE INDEX "ResumeProject_masterResumeId_position_idx" ON "ResumeProject"("masterResumeId", "position");

-- CreateIndex
CREATE INDEX "ResumeSkill_masterResumeId_position_idx" ON "ResumeSkill"("masterResumeId", "position");

-- CreateIndex
CREATE INDEX "ResumeBullet_masterResumeId_position_idx" ON "ResumeBullet"("masterResumeId", "position");

-- CreateIndex
CREATE INDEX "ResumeBullet_experienceId_position_idx" ON "ResumeBullet"("experienceId", "position");

-- CreateIndex
CREATE INDEX "ResumeBullet_projectId_position_idx" ON "ResumeBullet"("projectId", "position");

-- AddForeignKey
ALTER TABLE "MasterResume" ADD CONSTRAINT "MasterResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeBullet" ADD CONSTRAINT "ResumeBullet_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "MasterResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeBullet" ADD CONSTRAINT "ResumeBullet_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "ResumeExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeBullet" ADD CONSTRAINT "ResumeBullet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResumeProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
