import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseSearchQuery } from '@/lib/validators/search';
import { logger } from '@/lib/logger';
import { unifiedSearch } from '@/lib/search';

// GET /api/search - 통합 검색 (Full-text search with fallback)
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const validation = parseSearchQuery(searchParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          details: validation.details,
        },
        { status: 400 }
      );
    }

    const { q: query, type, limit } = validation.data!;

    logger.info({ requestId, query, type, limit }, 'Search request');

    // Perform unified search (full-text with fallback)
    const searchResults = await unifiedSearch(prisma, query, type, limit);

    logger.info(
      {
        requestId,
        newsCount: searchResults.news?.length ?? 0,
        personnelCount: searchResults.personnel?.length ?? 0,
        companiesCount: searchResults.companies?.length ?? 0,
        searchMethod: searchResults._searchMethod,
      },
      'Search completed'
    );

    // Remove internal _searchMethod from response
    const { _searchMethod, ...results } = searchResults;

    return NextResponse.json({
      success: true,
      data: results,
      query,
      meta: {
        searchMethod: _searchMethod,
      },
    });
  } catch (error) {
    logger.error({ requestId, error }, 'Search failed');
    return NextResponse.json(
      { success: false, error: '검색에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
