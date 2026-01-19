-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "businessSummary" TEXT,
    "personnelSummary" TEXT,
    "productSummary" TEXT,
    "irSummary" TEXT,
    "eventSummary" TEXT,
    "generalSummary" TEXT,
    "executiveSummary" TEXT,
    "closingRemarks" TEXT,
    "totalNewsCount" INTEGER NOT NULL DEFAULT 0,
    "companyMentions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_securities_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "newsroomUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPowerbaseClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_securities_companies" ("code", "createdAt", "id", "isActive", "logoUrl", "name", "newsroomUrl", "updatedAt", "websiteUrl") SELECT "code", "createdAt", "id", "isActive", "logoUrl", "name", "newsroomUrl", "updatedAt", "websiteUrl" FROM "securities_companies";
DROP TABLE "securities_companies";
ALTER TABLE "new_securities_companies" RENAME TO "securities_companies";
CREATE UNIQUE INDEX "securities_companies_name_key" ON "securities_companies"("name");
CREATE UNIQUE INDEX "securities_companies_code_key" ON "securities_companies"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "weekly_reports_weekStart_idx" ON "weekly_reports"("weekStart");

-- CreateIndex
CREATE INDEX "weekly_reports_status_idx" ON "weekly_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_reports_weekStart_weekEnd_key" ON "weekly_reports"("weekStart", "weekEnd");
