-- CreateTable
CREATE TABLE "securities_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "newsroomUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "summary" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "isPersonnel" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME NOT NULL,
    "crawledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "news_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "securities_companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_changes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "changeType" TEXT NOT NULL,
    "previousPosition" TEXT,
    "sourceUrl" TEXT,
    "effectiveDate" DATETIME,
    "announcedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "personnel_changes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "securities_companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "news_keywords" (
    "newsId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,

    PRIMARY KEY ("newsId", "keywordId"),
    CONSTRAINT "news_keywords_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "news_keywords_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "companyId"),
    CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_favorites_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "securities_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keyword_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "keyword_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "keyword_alerts_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crawl_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "securities_companies_name_key" ON "securities_companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "securities_companies_code_key" ON "securities_companies"("code");

-- CreateIndex
CREATE INDEX "news_companyId_idx" ON "news"("companyId");

-- CreateIndex
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "news_isPersonnel_idx" ON "news"("isPersonnel");

-- CreateIndex
CREATE INDEX "personnel_changes_companyId_idx" ON "personnel_changes"("companyId");

-- CreateIndex
CREATE INDEX "personnel_changes_announcedAt_idx" ON "personnel_changes"("announcedAt");

-- CreateIndex
CREATE INDEX "personnel_changes_changeType_idx" ON "personnel_changes"("changeType");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_name_key" ON "keywords"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "keyword_alerts_userId_keywordId_key" ON "keyword_alerts"("userId", "keywordId");

-- CreateIndex
CREATE INDEX "crawl_logs_status_idx" ON "crawl_logs"("status");

-- CreateIndex
CREATE INDEX "crawl_logs_startedAt_idx" ON "crawl_logs"("startedAt");
