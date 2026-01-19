import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/contracts/services - 서비스별 통계 조회
export async function GET() {
  try {
    // 서비스 마스터 데이터 가져오기
    const serviceMasters = await prisma.serviceMaster.findMany({
      where: { isActive: true },
    });

    // 서비스 계약 데이터 가져오기 (계약 정보 포함)
    const serviceContracts = await prisma.serviceContract.findMany({
      include: {
        contract: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 1. 서비스별 계약 금액 TOP 15
    const serviceRevenue = serviceContracts.reduce((acc, sc) => {
      const code = sc.serviceCode;
      if (!acc[code]) {
        const master = serviceMasters.find(m => m.code === code);
        acc[code] = {
          serviceCode: code,
          serviceName: master?.name || sc.serviceName,
          category: master?.category || 'OTHER',
          totalAmount: 0,
          contractCount: 0,
          companies: [] as string[],
        };
      }
      acc[code].totalAmount += Number(sc.amount) || 0;
      acc[code].contractCount += 1;
      if (!acc[code].companies.includes(sc.contract.company.name)) {
        acc[code].companies.push(sc.contract.company.name);
      }
      return acc;
    }, {} as Record<string, {
      serviceCode: string;
      serviceName: string;
      category: string;
      totalAmount: number;
      contractCount: number;
      companies: string[];
    }>);

    const serviceRevenueTop15 = Object.values(serviceRevenue)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 15)
      .map(s => ({
        serviceCode: s.serviceCode,
        serviceName: s.serviceName,
        category: s.category,
        totalAmount: s.totalAmount,
        contractCount: s.contractCount,
      }));

    // 2. 서비스별 가입사 수 (트리맵용)
    const serviceSubscriberCount = Object.values(serviceRevenue)
      .map(s => ({
        serviceCode: s.serviceCode,
        serviceName: s.serviceName,
        category: s.category,
        subscriberCount: s.companies.length,
        totalAmount: s.totalAmount,
      }))
      .sort((a, b) => b.subscriberCount - a.subscriberCount);

    // 3. 서비스 카테고리별 매출
    const revenueByServiceCategory = Object.values(serviceRevenue).reduce((acc, s) => {
      const cat = s.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, totalAmount: 0, serviceCount: 0 };
      }
      acc[cat].totalAmount += s.totalAmount;
      acc[cat].serviceCount += 1;
      return acc;
    }, {} as Record<string, { category: string; totalAmount: number; serviceCount: number }>);

    // 4. 외자계 vs 국내 증권사 서비스 가입 현황 (레이더 차트용)
    const contracts = await prisma.customerContract.findMany({
      where: {
        customerType: 'SECURITIES',
        category: { in: ['DOMESTIC', 'FOREIGN'] },
      },
      include: {
        services: true,
      },
    });

    const serviceByCompanyType = contracts.reduce((acc, c) => {
      const categoryKey = c.category === 'FOREIGN' ? 'foreign' : 'domestic';
      if (!acc[categoryKey]) {
        acc[categoryKey] = {} as Record<string, number>;
      }
      c.services.forEach(s => {
        if (!acc[categoryKey][s.serviceCode]) {
          acc[categoryKey][s.serviceCode] = 0;
        }
        acc[categoryKey][s.serviceCode] += Number(s.amount) || 0;
      });
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // 주요 서비스만 추출 (금액 상위)
    const topServices = serviceRevenueTop15.slice(0, 10).map(s => s.serviceCode);
    const radarData = topServices.map(code => {
      const master = serviceMasters.find(m => m.code === code);
      return {
        service: master?.name || code,
        serviceCode: code,
        domestic: serviceByCompanyType.domestic?.[code] || 0,
        foreign: serviceByCompanyType.foreign?.[code] || 0,
      };
    });

    // 5. 서비스 마스터 목록 (참조용)
    const serviceMasterList = serviceMasters.map(m => ({
      code: m.code,
      name: m.name,
      category: m.category,
      description: m.description,
    }));

    // 6. 총 서비스 통계
    const totalServiceStats = {
      totalServices: serviceMasters.length,
      totalServiceContracts: serviceContracts.length,
      totalServiceRevenue: serviceContracts.reduce((sum, sc) => sum + (Number(sc.amount) || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        serviceRevenueTop15,
        serviceSubscriberCount,
        revenueByServiceCategory: Object.values(revenueByServiceCategory),
        radarData,
        serviceMasterList,
        totalServiceStats,
      },
    });
  } catch (error) {
    console.error('서비스 통계 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '서비스 통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
