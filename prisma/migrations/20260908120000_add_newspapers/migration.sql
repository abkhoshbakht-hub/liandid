-- ماژول صفحه اول روزنامه‌ها (idempotent: قابل اجرای مجدد بدون خطا)
CREATE TABLE IF NOT EXISTS "Newspaper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'national',
    "logo" TEXT,
    "website" TEXT,
    "telegram" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Newspaper_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Newspaper_slug_key" ON "Newspaper"("slug");

CREATE TABLE IF NOT EXISTS "NewspaperSource" (
    "id" TEXT NOT NULL,
    "newspaperId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'official',
    "url" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parserType" TEXT,
    "configuration" TEXT,
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NewspaperSource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NewspaperSource_newspaperId_idx" ON "NewspaperSource"("newspaperId");

ALTER TABLE "NewspaperSource" DROP CONSTRAINT IF EXISTS "NewspaperSource_newspaperId_fkey";
ALTER TABLE "NewspaperSource" ADD CONSTRAINT "NewspaperSource_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "NewspaperIssue" (
    "id" TEXT NOT NULL,
    "newspaperId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "persianDate" TEXT NOT NULL,
    "issueNumber" TEXT,
    "title" TEXT,
    "originalUrl" TEXT,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "sourceId" TEXT,
    "imageHash" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NewspaperIssue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewspaperIssue_newspaperId_date_key" ON "NewspaperIssue"("newspaperId", "date");
CREATE INDEX IF NOT EXISTS "NewspaperIssue_date_idx" ON "NewspaperIssue"("date");
CREATE INDEX IF NOT EXISTS "NewspaperIssue_status_idx" ON "NewspaperIssue"("status");

ALTER TABLE "NewspaperIssue" DROP CONSTRAINT IF EXISTS "NewspaperIssue_newspaperId_fkey";
ALTER TABLE "NewspaperIssue" ADD CONSTRAINT "NewspaperIssue_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewspaperIssue" DROP CONSTRAINT IF EXISTS "NewspaperIssue_sourceId_fkey";
ALTER TABLE "NewspaperIssue" ADD CONSTRAINT "NewspaperIssue_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewspaperSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "NewspaperFetchLog" (
    "id" TEXT NOT NULL,
    "newspaperId" TEXT,
    "sourceId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'FAILED',
    "httpStatus" INTEGER,
    "errorMessage" TEXT,
    "discoveredImageUrl" TEXT,
    "discoveredDate" TEXT,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewspaperFetchLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NewspaperFetchLog_newspaperId_idx" ON "NewspaperFetchLog"("newspaperId");
CREATE INDEX IF NOT EXISTS "NewspaperFetchLog_createdAt_idx" ON "NewspaperFetchLog"("createdAt");

ALTER TABLE "NewspaperFetchLog" DROP CONSTRAINT IF EXISTS "NewspaperFetchLog_newspaperId_fkey";
ALTER TABLE "NewspaperFetchLog" ADD CONSTRAINT "NewspaperFetchLog_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewspaperFetchLog" DROP CONSTRAINT IF EXISTS "NewspaperFetchLog_sourceId_fkey";
ALTER TABLE "NewspaperFetchLog" ADD CONSTRAINT "NewspaperFetchLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewspaperSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
