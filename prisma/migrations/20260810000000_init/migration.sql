-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProjectType" AS ENUM ('DEVELOPMENT', 'DESIGN', 'HYBRID');
CREATE TYPE "BlockType" AS ENUM ('HEADING', 'PARAGRAPH', 'IMAGE', 'IMAGE_GROUP', 'QUOTE', 'VIDEO', 'CODE', 'TECH_CALLOUT');
CREATE TYPE "MediaRole" AS ENUM ('GALLERY', 'THUMBNAIL', 'SUPPORTING');

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuthSession" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Project" (
  "id" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(180) NOT NULL,
  "summary" VARCHAR(320) NOT NULL,
  "description" TEXT,
  "type" "ProjectType" NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "year" INTEGER NOT NULL,
  "role" VARCHAR(160) NOT NULL,
  "client" VARCHAR(160),
  "technologies" JSONB NOT NULL,
  "services" JSONB NOT NULL,
  "githubUrl" VARCHAR(2048),
  "liveUrl" VARCHAR(2048),
  "behanceUrl" VARCHAR(2048),
  "externalUrl" VARCHAR(2048),
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "coverImageId" UUID,
  "coverOmitted" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProjectBlock" (
  "id" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "type" "BlockType" NOT NULL,
  "content" JSONB NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectBlock_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MediaAsset" (
  "id" UUID NOT NULL,
  "storageKey" VARCHAR(512) NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "originalName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(120) NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "sizeBytes" INTEGER NOT NULL,
  "altText" VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProjectMedia" (
  "id" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "mediaAssetId" UUID NOT NULL,
  "role" "MediaRole" NOT NULL DEFAULT 'GALLERY',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Milestone" (
  "id" UUID NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" VARCHAR(80) NOT NULL,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "mediaAssetId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PlaygroundItem" (
  "id" UUID NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(180) NOT NULL,
  "summary" VARCHAR(320) NOT NULL,
  "type" VARCHAR(80) NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "content" JSONB NOT NULL,
  "thumbnailId" UUID,
  "liveUrl" VARCHAR(2048),
  "sourceUrl" VARCHAR(2048),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlaygroundItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SiteSetting" (
  "key" VARCHAR(100) NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
CREATE TABLE "UtilityData" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "namespace" VARCHAR(100) NOT NULL,
  "key" VARCHAR(100) NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UtilityData_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_status_featured_sortOrder_idx" ON "Project"("status", "featured", "sortOrder");
CREATE INDEX "Project_updatedAt_idx" ON "Project"("updatedAt");
CREATE INDEX "ProjectBlock_projectId_sortOrder_idx" ON "ProjectBlock"("projectId", "sortOrder");
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
CREATE UNIQUE INDEX "ProjectMedia_projectId_mediaAssetId_role_key" ON "ProjectMedia"("projectId", "mediaAssetId", "role");
CREATE INDEX "ProjectMedia_projectId_role_sortOrder_idx" ON "ProjectMedia"("projectId", "role", "sortOrder");
CREATE INDEX "Milestone_visible_sortOrder_date_idx" ON "Milestone"("visible", "sortOrder", "date");
CREATE UNIQUE INDEX "PlaygroundItem_slug_key" ON "PlaygroundItem"("slug");
CREATE INDEX "PlaygroundItem_status_sortOrder_idx" ON "PlaygroundItem"("status", "sortOrder");
CREATE UNIQUE INDEX "UtilityData_userId_namespace_key_key" ON "UtilityData"("userId", "namespace", "key");
CREATE INDEX "UtilityData_userId_namespace_idx" ON "UtilityData"("userId", "namespace");

ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectBlock" ADD CONSTRAINT "ProjectBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlaygroundItem" ADD CONSTRAINT "PlaygroundItem_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UtilityData" ADD CONSTRAINT "UtilityData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
