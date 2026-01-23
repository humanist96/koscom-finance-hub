import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/contracts/insights - 영업 인사이트 조회
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

    // 서비스 마스터 데이터 가져오기
    const serviceMasters = await prisma.serviceMaster.findMany({
      where: { isActive: true },
    });

    // 서비스별 가입 현황 계산
    const serviceSubscription = serviceMasters.reduce((acc, master) => {
      acc[master.code] = {
        code: master.code,
        name: master.name,
        category: master.category,
        subscribers: new Set<string>(),
        totalAmount: 0,
      };
      return acc;
    }, {} as Record<string, { code: string; name: string; category: string; subscribers: Set<string>; totalAmount: number }>);

    // 각 계약의 서비스 정보 수집
    contracts.forEach(contract => {
      contract.services.forEach(service => {
        if (serviceSubscription[service.serviceCode]) {
          serviceSubscription[service.serviceCode].subscribers.add(contract.companyId);
          serviceSubscription[service.serviceCode].totalAmount += Number(service.amount) || 0;
        }
      });
    });

    // 1. 업셀링 기회 - 이관사 분석
    const migratedContracts = contracts.filter(c => c.category === 'MIGRATED');
    const domesticContracts = contracts.filter(c => c.category === 'DOMESTIC');
    const foreignContracts = contracts.filter(c => c.category === 'FOREIGN');

    const migratedAvgRevenue = migratedContracts.length > 0
      ? migratedContracts.reduce((sum, c) => sum + (Number(c.powerbaseRevenue) || 0), 0) / migratedContracts.length
      : 0;
    const domesticAvgRevenue = domesticContracts.length > 0
      ? domesticContracts.reduce((sum, c) => sum + (Number(c.powerbaseRevenue) || 0), 0) / domesticContracts.length
      : 0;
    const foreignAvgRevenue = foreignContracts.length > 0
      ? foreignContracts.reduce((sum, c) => sum + (Number(c.powerbaseRevenue) || 0), 0) / foreignContracts.length
      : 0;

    const targetAvgRevenue = (domesticAvgRevenue + foreignAvgRevenue) / 2;
    const potentialRevenue = migratedContracts.length * (targetAvgRevenue - migratedAvgRevenue);

    const migratedCustomers = {
      count: migratedContracts.length,
      avgRevenue: Math.round(migratedAvgRevenue * 10) / 10,
      targetAvgRevenue: Math.round(targetAvgRevenue * 10) / 10,
      potentialRevenue: Math.round(potentialRevenue * 10) / 10,
      list: migratedContracts.map(c => ({
        companyId: c.companyId,
        companyName: c.company.name,
        currentRevenue: Number(c.powerbaseRevenue) || 0,
        serviceCount: c.services.length,
      })).sort((a, b) => b.currentRevenue - a.currentRevenue),
    };

    // 2. 서비스별 미가입사 수 (영업 기회)
    const totalCompanies = contracts.length;
    const serviceOpportunities = Object.values(serviceSubscription)
      .map(s => ({
        service: s.code,
        serviceName: s.name,
        category: s.category,
        subscribedCount: s.subscribers.size,
        potentialCount: totalCompanies - s.subscribers.size,
        avgAmount: s.subscribers.size > 0 ? Math.round(s.totalAmount / s.subscribers.size * 10) / 10 : 0,
        totalPotential: s.subscribers.size > 0
          ? Math.round((totalCompanies - s.subscribers.size) * (s.totalAmount / s.subscribers.size) * 10) / 10
          : 0,
      }))
      .filter(s => s.subscribedCount > 0 && s.potentialCount > 0)
      .sort((a, b) => b.totalPotential - a.totalPotential)
      .slice(0, 10);

    // 3. 집중 관리 고객 (2025년 예상 매출 TOP 10)
    const focusCustomers = contracts
      .filter(c => c.year2025Revenue && Number(c.year2025Revenue) > 0)
      .sort((a, b) => Number(b.year2025Revenue) - Number(a.year2025Revenue))
      .slice(0, 10)
      .map((c, index) => ({
        rank: index + 1,
        companyId: c.companyId,
        companyName: c.company.name,
        category: c.category,
        year2025Revenue: Number(c.year2025Revenue),
        powerbaseRevenue: Number(c.powerbaseRevenue) || 0,
        progressNotes: c.progressNotes || '',
        priority: index < 3 ? 'HIGH' : index < 7 ? 'MEDIUM' : 'LOW',
        actionRequired: getActionRequired(c),
      }));

    // 4. 리스크 고객 - 매출 감소/이탈 위험
    const riskCustomers = contracts
      .filter(c => {
        const notes = (c.progressNotes || '').toLowerCase();
        return notes.includes('해지') ||
               notes.includes('검토') ||
               notes.includes('축소') ||
               (Number(c.powerbaseRevenue) === 0 && Number(c.currentRevenue) > 0);
      })
      .map(c => ({
        companyId: c.companyId,
        companyName: c.company.name,
        currentRevenue: Number(c.currentRevenue) || 0,
        powerbaseRevenue: Number(c.powerbaseRevenue) || 0,
        riskType: getRiskType(c),
        riskNote: c.progressNotes || '매출 0 상태',
        riskLevel: getRiskLevel(c),
      }))
      .sort((a, b) => {
        const levelOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return levelOrder[a.riskLevel as keyof typeof levelOrder] - levelOrder[b.riskLevel as keyof typeof levelOrder];
      });

    // 5. 액션 아이템 분류
    const actionItems = {
      shortTerm: [] as ActionItem[],
      midTerm: [] as ActionItem[],
      longTerm: [] as ActionItem[],
    };

    // 진행중인 계약 (단기)
    contracts.forEach(c => {
      const notes = c.progressNotes || '';
      if (notes.includes('진행') || notes.includes('개발') || notes.includes('예정')) {
        actionItems.shortTerm.push({
          companyName: c.company.name,
          action: notes,
          priority: 'HIGH',
          estimatedRevenue: Number(c.year2025Revenue) || 0,
        });
      }
    });

    // 이관사 NXT 추가 (중기)
    const migratedWithoutNXT = migratedContracts.filter(c =>
      !c.services.some(s => s.serviceCode === 'NXT')
    );
    if (migratedWithoutNXT.length > 0) {
      actionItems.midTerm.push({
        companyName: `이관사 ${migratedWithoutNXT.length}개사`,
        action: 'NXT 서비스 도입 제안',
        priority: 'MEDIUM',
        estimatedRevenue: migratedWithoutNXT.length * 1.5,
      });
    }

    // 서비스 확대 (장기)
    const topServiceOpps = serviceOpportunities.slice(0, 3);
    topServiceOpps.forEach(s => {
      actionItems.longTerm.push({
        companyName: `${s.potentialCount}개사 대상`,
        action: `${s.serviceName} 서비스 확대`,
        priority: 'LOW',
        estimatedRevenue: s.totalPotential,
      });
    });

    // 신규 고객 계약 진행 (단기)
    const newContracts = contracts.filter(c => {
      const notes = (c.progressNotes || '').toLowerCase();
      return notes.includes('신규') || notes.includes('계약 진행');
    });
    newContracts.slice(0, 5).forEach(c => {
      actionItems.shortTerm.push({
        companyName: c.company.name,
        action: '신규 계약 진행',
        priority: 'HIGH',
        estimatedRevenue: Number(c.year2025Revenue) || 0,
      });
    });

    // 정렬 및 중복 제거
    actionItems.shortTerm = actionItems.shortTerm
      .filter((item, index, self) =>
        index === self.findIndex(t => t.companyName === item.companyName && t.action === item.action)
      )
      .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        upsellOpportunities: {
          migratedCustomers,
          serviceOpportunities,
        },
        focusCustomers,
        riskCustomers,
        actionItems,
        summary: {
          totalOpportunityRevenue: Math.round(potentialRevenue + serviceOpportunities.reduce((sum, s) => sum + s.totalPotential, 0)),
          atRiskRevenue: Math.round(riskCustomers.reduce((sum, r) => sum + r.powerbaseRevenue, 0) * 10) / 10,
          focusCustomersRevenue: Math.round(focusCustomers.reduce((sum, f) => sum + f.year2025Revenue, 0) * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error('영업 인사이트 조회 실패:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: '영업 인사이트를 불러오는데 실패했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
}

// 헬퍼 함수들
interface ActionItem {
  companyName: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRevenue: number;
}

interface ContractWithCompany {
  progressNotes: string | null;
  category: string;
  year2025Revenue: unknown;
  powerbaseRevenue: unknown;
  currentRevenue: unknown;
}

function getActionRequired(contract: ContractWithCompany): string {
  const notes = (contract.progressNotes || '').toLowerCase();
  if (notes.includes('신규')) return '신규 계약 추진';
  if (notes.includes('확대') || notes.includes('추가')) return '서비스 확대';
  if (notes.includes('개발')) return '개발 완료 후 계약';
  if (contract.category === 'MIGRATED') return '서비스 업그레이드';
  return '관계 유지';
}

function getRiskType(contract: ContractWithCompany): 'CHURN' | 'DOWNGRADE' | 'INACTIVE' {
  const notes = (contract.progressNotes || '').toLowerCase();
  if (notes.includes('해지')) return 'CHURN';
  if (notes.includes('축소') || notes.includes('감소')) return 'DOWNGRADE';
  return 'INACTIVE';
}

function getRiskLevel(contract: ContractWithCompany): 'HIGH' | 'MEDIUM' | 'LOW' {
  const notes = (contract.progressNotes || '').toLowerCase();
  const revenue = Number(contract.powerbaseRevenue) || 0;

  if (notes.includes('해지') && revenue > 5) return 'HIGH';
  if (notes.includes('해지') || revenue > 10) return 'MEDIUM';
  return 'LOW';
}
