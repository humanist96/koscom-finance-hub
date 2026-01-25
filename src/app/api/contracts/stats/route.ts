import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withCache, cacheKeys, CACHE_TTL } from '@/lib/cache';

// GET /api/contracts/stats - 계약 통계 조회
export async function GET() {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 캐시에서 조회 또는 새로 계산
    const stats = await withCache(
      cacheKeys.contractStats(),
      async () => computeContractStats(),
      CACHE_TTL.MEDIUM // 5분 캐시
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('계약 통계 조회 실패:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: '계약 통계를 불러오는데 실패했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
}

async function computeContractStats() {
  // 전체 계약 데이터 가져오기
  const contracts = await prisma.customerContract.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        services: true,
      },
    });

    // 1. 고객사별 매출 TOP 20 (PowerBASE 매출 기준)
    const revenueTop20 = contracts
      .filter(c => c.powerbaseRevenue && Number(c.powerbaseRevenue) > 0)
      .sort((a, b) => Number(b.powerbaseRevenue) - Number(a.powerbaseRevenue))
      .slice(0, 20)
      .map(c => ({
        companyId: c.companyId,
        companyName: c.company.name,
        powerbaseRevenue: Number(c.powerbaseRevenue),
        currentRevenue: Number(c.currentRevenue),
        year2025Revenue: Number(c.year2025Revenue),
        category: c.category,
      }));

    // 2. 고객 분류별 매출 비중
    const revenueByCustomerType = contracts.reduce((acc, c) => {
      const type = c.customerType;
      if (!acc[type]) {
        acc[type] = { type, totalRevenue: 0, count: 0 };
      }
      acc[type].totalRevenue += Number(c.powerbaseRevenue) || 0;
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { type: string; totalRevenue: number; count: number }>);

    // 3. 구분별 매출 비교 (국내/외자계/이관사)
    const revenueByCategory = contracts.reduce((acc, c) => {
      const cat = c.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, powerbaseRevenue: 0, year2025Revenue: 0, count: 0 };
      }
      acc[cat].powerbaseRevenue += Number(c.powerbaseRevenue) || 0;
      acc[cat].year2025Revenue += Number(c.year2025Revenue) || 0;
      acc[cat].count += 1;
      return acc;
    }, {} as Record<string, { category: string; powerbaseRevenue: number; year2025Revenue: number; count: number }>);

    // 4. PowerBASE 매출 vs 당기매출 비교 (산점도용)
    const revenueComparison = contracts
      .filter(c => c.powerbaseRevenue && c.currentRevenue)
      .map(c => ({
        companyName: c.company.name,
        companyId: c.companyId,
        powerbaseRevenue: Number(c.powerbaseRevenue),
        currentRevenue: Number(c.currentRevenue),
        year2025Revenue: Number(c.year2025Revenue) || 0,
        category: c.category,
        customerType: c.customerType,
      }));

    // 5. 고객 분류별 회사 수
    const companyCountByType = Object.values(revenueByCustomerType).map(item => ({
      type: item.type,
      count: item.count,
    }));

    // 6. 총 매출 통계
    const totalStats = {
      totalContracts: contracts.length,
      totalPowerbaseRevenue: contracts.reduce((sum, c) => sum + (Number(c.powerbaseRevenue) || 0), 0),
      totalYear2025Revenue: contracts.reduce((sum, c) => sum + (Number(c.year2025Revenue) || 0), 0),
      totalCurrentRevenue: contracts.reduce((sum, c) => sum + (Number(c.currentRevenue) || 0), 0),
    };

    // 7. 2025년 매출 TOP 10
    const year2025Top10 = contracts
      .filter(c => c.year2025Revenue && Number(c.year2025Revenue) > 0)
      .sort((a, b) => Number(b.year2025Revenue) - Number(a.year2025Revenue))
      .slice(0, 10)
      .map(c => ({
        companyId: c.companyId,
        companyName: c.company.name,
        year2025Revenue: Number(c.year2025Revenue),
        category: c.category,
      }));

  return {
    revenueTop20,
    revenueByCustomerType: Object.values(revenueByCustomerType),
    revenueByCategory: Object.values(revenueByCategory),
    revenueComparison,
    companyCountByType,
    totalStats,
    year2025Top10,
  };
}
