import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// 유효한 구분 값
const VALID_CATEGORIES = ['DOMESTIC', 'FOREIGN', 'MIGRATED'];

// 유효한 고객분류 값
const VALID_CUSTOMER_TYPES = ['SECURITIES', 'INSTITUTION', 'ASSET_MGMT', 'FUTURES', 'MEDIA'];

// 서비스 상태 기본값
const DEFAULT_SERVICE_STATUS = 'CONTRACTED';

interface UploadRow {
  '순번'?: number;
  '증권사코드': string;
  '증권사명'?: string;
  '구분': string;
  '고객분류': string;
  '당기매출(억원)'?: number;
  'PowerBASE매출(억원)'?: number;
  '2025예상매출(억원)'?: number;
  '계약연도'?: number;
  '진행사항'?: string;
  '서비스코드'?: string;
  '서비스금액(억원)'?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string | number;
}

interface ProcessedContract {
  companyId: string;
  companyName: string;
  orderNumber: number;
  category: string;
  customerType: string;
  currentRevenue: number | null;
  powerbaseRevenue: number | null;
  year2025Revenue: number | null;
  contractYear: number;
  progressNotes: string | null;
  services: Array<{
    serviceCode: string;
    serviceName: string;
    amount: number | null;
    status: string;
  }>;
}

// 엑셀 파일 업로드 및 미리보기 (검증만)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 폼 데이터 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string; // 'preview' 또는 'confirm'

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 확인
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 읽기
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 첫 번째 시트 (계약정보) 읽기
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<UploadRow>(sheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '업로드할 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 증권사 코드 → ID 매핑 조회
    const companies = await prisma.securitiesCompany.findMany({
      where: { code: { not: null } },
      select: { id: true, code: true, name: true },
    });
    const companyMap = new Map(
      companies
        .filter((c): c is typeof c & { code: string } => c.code !== null)
        .map(c => [c.code.toUpperCase(), { id: c.id, name: c.name }])
    );

    // 서비스 마스터 조회
    const serviceMasters = await prisma.serviceMaster.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
    });
    const serviceMap = new Map(serviceMasters.map(s => [s.code.toUpperCase(), s.name]));

    // 데이터 검증 및 변환
    const validationErrors: ValidationError[] = [];
    const processedContracts: ProcessedContract[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2; // 엑셀 행 번호 (헤더 제외)

      // 필수 필드 검증
      if (!row['증권사코드']) {
        validationErrors.push({
          row: rowNum,
          field: '증권사코드',
          message: '증권사코드는 필수입니다.',
        });
        return;
      }

      // 증권사 코드 검증
      const companyCode = String(row['증권사코드']).toUpperCase().trim();
      const company = companyMap.get(companyCode);
      if (!company) {
        validationErrors.push({
          row: rowNum,
          field: '증권사코드',
          message: `등록되지 않은 증권사코드입니다: ${companyCode}`,
          value: companyCode,
        });
        return;
      }

      // 구분 검증
      const category = String(row['구분'] || '').toUpperCase().trim();
      if (!category || !VALID_CATEGORIES.includes(category)) {
        validationErrors.push({
          row: rowNum,
          field: '구분',
          message: `유효하지 않은 구분입니다. (DOMESTIC, FOREIGN, MIGRATED 중 선택)`,
          value: category,
        });
        return;
      }

      // 고객분류 검증
      const customerType = String(row['고객분류'] || '').toUpperCase().trim();
      if (!customerType || !VALID_CUSTOMER_TYPES.includes(customerType)) {
        validationErrors.push({
          row: rowNum,
          field: '고객분류',
          message: `유효하지 않은 고객분류입니다. (SECURITIES, INSTITUTION, ASSET_MGMT, FUTURES, MEDIA 중 선택)`,
          value: customerType,
        });
        return;
      }

      // 숫자 필드 검증 및 변환
      const parseNumber = (value: unknown): number | null => {
        if (value === undefined || value === null || value === '') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      const orderNumber = parseNumber(row['순번']) ?? (index + 1);
      const currentRevenue = parseNumber(row['당기매출(억원)']);
      const powerbaseRevenue = parseNumber(row['PowerBASE매출(억원)']);
      const year2025Revenue = parseNumber(row['2025예상매출(억원)']);
      const contractYear = parseNumber(row['계약연도']) ?? new Date().getFullYear();

      // 서비스 정보 파싱
      const services: ProcessedContract['services'] = [];
      if (row['서비스코드']) {
        const serviceCodes = String(row['서비스코드']).split(',').map(s => s.trim().toUpperCase());
        const serviceAmounts = row['서비스금액(억원)']
          ? String(row['서비스금액(억원)']).split(',').map(s => parseNumber(s.trim()))
          : [];

        serviceCodes.forEach((code, idx) => {
          if (!code) return;

          const serviceName = serviceMap.get(code);
          if (!serviceName) {
            validationErrors.push({
              row: rowNum,
              field: '서비스코드',
              message: `등록되지 않은 서비스코드입니다: ${code}`,
              value: code,
            });
            return;
          }

          services.push({
            serviceCode: code,
            serviceName: serviceName,
            amount: serviceAmounts[idx] ?? null,
            status: DEFAULT_SERVICE_STATUS,
          });
        });
      }

      // 처리된 계약 데이터 추가
      processedContracts.push({
        companyId: company.id,
        companyName: company.name,
        orderNumber,
        category,
        customerType,
        currentRevenue,
        powerbaseRevenue,
        year2025Revenue,
        contractYear,
        progressNotes: row['진행사항'] ? String(row['진행사항']) : null,
        services,
      });
    });

    // 미리보기 모드: 검증 결과만 반환
    if (action === 'preview' || !action) {
      return NextResponse.json({
        success: true,
        data: {
          totalRows: rows.length,
          validRows: processedContracts.length,
          errorRows: validationErrors.length,
          errors: validationErrors,
          preview: processedContracts.slice(0, 10), // 처음 10개만 미리보기
        },
      });
    }

    // 확정 모드: 검증 오류가 있으면 중단
    if (action === 'confirm') {
      if (validationErrors.length > 0) {
        return NextResponse.json({
          success: false,
          error: '검증 오류가 있습니다. 오류를 수정 후 다시 시도해주세요.',
          data: {
            errors: validationErrors,
          },
        });
      }

      // 트랜잭션으로 데이터 저장
      const mode = formData.get('mode') as string; // 'replace' 또는 'merge'

      await prisma.$transaction(async (tx) => {
        if (mode === 'replace') {
          // 기존 데이터 삭제 (서비스 계약 → 고객 계약 순서)
          await tx.serviceContract.deleteMany({});
          await tx.customerContract.deleteMany({});
        }

        // 새 데이터 삽입
        for (const contract of processedContracts) {
          // 기존 계약 확인 (merge 모드일 때)
          let existingContract = null;
          if (mode === 'merge') {
            existingContract = await tx.customerContract.findFirst({
              where: {
                companyId: contract.companyId,
                contractYear: contract.contractYear,
              },
            });
          }

          if (existingContract) {
            // 기존 계약 업데이트
            await tx.serviceContract.deleteMany({
              where: { contractId: existingContract.id },
            });

            await tx.customerContract.update({
              where: { id: existingContract.id },
              data: {
                orderNumber: contract.orderNumber,
                category: contract.category,
                customerType: contract.customerType,
                currentRevenue: contract.currentRevenue,
                powerbaseRevenue: contract.powerbaseRevenue,
                year2025Revenue: contract.year2025Revenue,
                progressNotes: contract.progressNotes,
                updatedAt: new Date(),
              },
            });

            // 서비스 계약 추가
            if (contract.services.length > 0) {
              await tx.serviceContract.createMany({
                data: contract.services.map(s => ({
                  contractId: existingContract!.id,
                  serviceCode: s.serviceCode,
                  serviceName: s.serviceName,
                  amount: s.amount,
                  status: s.status,
                })),
              });
            }
          } else {
            // 새 계약 생성
            const newContract = await tx.customerContract.create({
              data: {
                companyId: contract.companyId,
                orderNumber: contract.orderNumber,
                category: contract.category,
                customerType: contract.customerType,
                currentRevenue: contract.currentRevenue,
                powerbaseRevenue: contract.powerbaseRevenue,
                year2025Revenue: contract.year2025Revenue,
                contractYear: contract.contractYear,
                progressNotes: contract.progressNotes,
              },
            });

            // 서비스 계약 추가
            if (contract.services.length > 0) {
              await tx.serviceContract.createMany({
                data: contract.services.map(s => ({
                  contractId: newContract.id,
                  serviceCode: s.serviceCode,
                  serviceName: s.serviceName,
                  amount: s.amount,
                  status: s.status,
                })),
              });
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          message: '계약 정보가 성공적으로 업로드되었습니다.',
          totalRows: processedContracts.length,
          mode: mode,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('계약 정보 업로드 실패:', error);
    return NextResponse.json(
      { success: false, error: '계약 정보 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
