/**
 * Full-text Search Utilities for PostgreSQL
 * Uses tsvector/tsquery for efficient Korean text search with relevance ranking
 */

import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Convert search query to PostgreSQL tsquery format
 * Handles Korean text by splitting on spaces and creating OR queries
 */
export function toTsQuery(query: string): string {
  // Sanitize input to prevent SQL injection
  const sanitized = query
    .replace(/['"\\;]/g, '') // Remove potentially dangerous characters
    .trim();

  if (!sanitized) {
    return '';
  }

  // Split by spaces and create OR query
  // Each word is converted to a prefix search for partial matching
  const words = sanitized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  // Create OR query with prefix matching (:*)
  return words.map((word) => `${word}:*`).join(' | ');
}

/**
 * Search news with full-text search and relevance ranking
 */
export async function searchNews(
  prisma: PrismaClient,
  query: string,
  limit: number = 10
) {
  const tsQuery = toTsQuery(query);

  if (!tsQuery) {
    return [];
  }

  // Use raw query for full-text search with ranking
  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      summary: string | null;
      category: string;
      isPersonnel: boolean;
      publishedAt: Date;
      sourceUrl: string;
      companyId: string;
      companyName: string;
      rank: number;
    }>
  >`
    SELECT
      n.id,
      n.title,
      n.summary,
      n.category,
      n."isPersonnel",
      n."publishedAt",
      n."sourceUrl",
      c.id as "companyId",
      c.name as "companyName",
      ts_rank(n.search_vector, to_tsquery('simple', ${tsQuery})) as rank
    FROM "news" n
    LEFT JOIN "securities_companies" c ON n."companyId" = c.id
    WHERE n.search_vector @@ to_tsquery('simple', ${tsQuery})
    ORDER BY rank DESC, n."publishedAt" DESC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    category: r.category,
    isPersonnel: r.isPersonnel,
    publishedAt: r.publishedAt,
    sourceUrl: r.sourceUrl,
    company: {
      id: r.companyId,
      name: r.companyName,
    },
    _rank: r.rank,
  }));
}

/**
 * Search personnel changes with full-text search and relevance ranking
 */
export async function searchPersonnel(
  prisma: PrismaClient,
  query: string,
  limit: number = 10
) {
  const tsQuery = toTsQuery(query);

  if (!tsQuery) {
    return [];
  }

  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      personName: string;
      position: string | null;
      department: string | null;
      changeType: string;
      previousPosition: string | null;
      effectiveDate: Date | null;
      announcedAt: Date;
      companyId: string;
      companyName: string;
      rank: number;
    }>
  >`
    SELECT
      p.id,
      p."personName",
      p.position,
      p.department,
      p."changeType",
      p."previousPosition",
      p."effectiveDate",
      p."announcedAt",
      c.id as "companyId",
      c.name as "companyName",
      ts_rank(p.search_vector, to_tsquery('simple', ${tsQuery})) as rank
    FROM "personnel_changes" p
    LEFT JOIN "securities_companies" c ON p."companyId" = c.id
    WHERE p.search_vector @@ to_tsquery('simple', ${tsQuery})
    ORDER BY rank DESC, p."announcedAt" DESC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r.id,
    personName: r.personName,
    position: r.position,
    department: r.department,
    changeType: r.changeType,
    previousPosition: r.previousPosition,
    effectiveDate: r.effectiveDate,
    announcedAt: r.announcedAt,
    company: {
      id: r.companyId,
      name: r.companyName,
    },
    _rank: r.rank,
  }));
}

/**
 * Search companies with full-text search and relevance ranking
 */
export async function searchCompanies(
  prisma: PrismaClient,
  query: string,
  limit: number = 5
) {
  const tsQuery = toTsQuery(query);

  if (!tsQuery) {
    return [];
  }

  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      code: string | null;
      logoUrl: string | null;
      rank: number;
    }>
  >`
    SELECT
      id,
      name,
      code,
      "logoUrl",
      ts_rank(search_vector, to_tsquery('simple', ${tsQuery})) as rank
    FROM "securities_companies"
    WHERE search_vector @@ to_tsquery('simple', ${tsQuery})
    ORDER BY rank DESC, name ASC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    logoUrl: r.logoUrl,
    _rank: r.rank,
  }));
}

/**
 * Fallback search using ILIKE when full-text search is not available
 * or when the search_vector columns haven't been created yet
 */
export async function fallbackSearchNews(
  prisma: PrismaClient,
  query: string,
  limit: number = 10
) {
  return prisma.news.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      isPersonnel: true,
      publishedAt: true,
      sourceUrl: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function fallbackSearchPersonnel(
  prisma: PrismaClient,
  query: string,
  limit: number = 10
) {
  return prisma.personnelChange.findMany({
    where: {
      OR: [
        { personName: { contains: query, mode: 'insensitive' } },
        { position: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { announcedAt: 'desc' },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function fallbackSearchCompanies(
  prisma: PrismaClient,
  query: string,
  limit: number = 5
) {
  return prisma.securitiesCompany.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      code: true,
      logoUrl: true,
    },
  });
}

/**
 * Check if full-text search is available
 * (search_vector columns exist in the database)
 */
export async function isFullTextSearchAvailable(
  prisma: PrismaClient
): Promise<boolean> {
  try {
    await prisma.$queryRaw`
      SELECT search_vector FROM "news" LIMIT 1
    `;
    return true;
  } catch {
    return false;
  }
}

/**
 * Unified search function that tries full-text search first,
 * then falls back to ILIKE if not available
 */
export async function unifiedSearch(
  prisma: PrismaClient,
  query: string,
  type: 'all' | 'news' | 'personnel' | 'companies' = 'all',
  limit: number = 10
) {
  const useFullText = await isFullTextSearchAvailable(prisma);

  const results: {
    news?: Awaited<ReturnType<typeof searchNews>> | Awaited<ReturnType<typeof fallbackSearchNews>>;
    personnel?: Awaited<ReturnType<typeof searchPersonnel>> | Awaited<ReturnType<typeof fallbackSearchPersonnel>>;
    companies?: Awaited<ReturnType<typeof searchCompanies>> | Awaited<ReturnType<typeof fallbackSearchCompanies>>;
    _searchMethod: 'fulltext' | 'fallback';
  } = {
    _searchMethod: useFullText ? 'fulltext' : 'fallback',
  };

  if (useFullText) {
    // Use full-text search
    if (type === 'all' || type === 'news') {
      results.news = await searchNews(prisma, query, limit);
    }
    if (type === 'all' || type === 'personnel') {
      results.personnel = await searchPersonnel(prisma, query, limit);
    }
    if (type === 'all' || type === 'companies') {
      results.companies = await searchCompanies(prisma, query, type === 'companies' ? limit : 5);
    }
  } else {
    // Fallback to ILIKE search
    if (type === 'all' || type === 'news') {
      results.news = await fallbackSearchNews(prisma, query, limit);
    }
    if (type === 'all' || type === 'personnel') {
      results.personnel = await fallbackSearchPersonnel(prisma, query, limit);
    }
    if (type === 'all' || type === 'companies') {
      results.companies = await fallbackSearchCompanies(prisma, query, type === 'companies' ? limit : 5);
    }
  }

  return results;
}
