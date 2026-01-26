import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// 유효한 변동유형 값
const VALID_CHANGE_TYPES = ['APPOINTMENT', 'PROMOTION', 'TRANSFER', 'RESIGNATION', 'RETIREMENT'];

interface UploadRow {
  '증권사코드': string;
  '인물명': string;
  '직책'?: string;
  '부서'?: string;
  '변동유형': string;
  '이전직책'?: string;
  '발령일'?: string;
  '발표일': string;
  '출처URL'?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string | number;
}

interface ProcessedPersonnel {
  companyId: string;
  companyName: string;
  personName: string;
  position: string | null;
  department: string | null;
  changeType: string;
  previousPosition: string | null;
  effectiveDate: Date | null;
  announcedAt: Date;
  sourceUrl: string | null;
}

// 날짜 파싱 함수
function parseDate(value: unknown): Date | null {
  if (!value) return null;

  // 엑셀 숫자 형식 (시리얼 넘버)
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date;
  }

  // 문자열 형식
  const dateStr = String(value).trim();
  if (!dateStr) return null;

  // YYYY-MM-DD 형식
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // YYYY/MM/DD 형식
  const slashMatch = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[1]), parseInt(slashMatch[2]) - 1, parseInt(slashMatch[3]));
  }

  // 기타 파싱 시도
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// 인사정보 엑셀 업로드 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string; // 'preview' 또는 'confirm'

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

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

    // 데이터 검증 및 변환
    const validationErrors: ValidationError[] = [];
    const processedPersonnel: ProcessedPersonnel[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2; // 엑셀 행 번호 (헤더 제외)

      // 필수 필드 검증: 증권사코드
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

      // 필수 필드 검증: 인물명
      if (!row['인물명']) {
        validationErrors.push({
          row: rowNum,
          field: '인물명',
          message: '인물명은 필수입니다.',
        });
        return;
      }

      // 필수 필드 검증: 변동유형
      const changeType = String(row['변동유형'] || '').toUpperCase().trim();
      if (!changeType || !VALID_CHANGE_TYPES.includes(changeType)) {
        validationErrors.push({
          row: rowNum,
          field: '변동유형',
          message: `유효하지 않은 변동유형입니다. (APPOINTMENT, PROMOTION, TRANSFER, RESIGNATION, RETIREMENT 중 선택)`,
          value: changeType,
        });
        return;
      }

      // 필수 필드 검증: 발표일
      const announcedAt = parseDate(row['발표일']);
      if (!announcedAt) {
        validationErrors.push({
          row: rowNum,
          field: '발표일',
          message: '발표일은 필수입니다. (YYYY-MM-DD 형식)',
          value: String(row['발표일'] || ''),
        });
        return;
      }

      // 선택 필드 파싱
      const effectiveDate = parseDate(row['발령일']);
      const sourceUrl = row['출처URL'] ? String(row['출처URL']).trim() : null;

      // URL 형식 검증 (있는 경우)
      if (sourceUrl && !sourceUrl.match(/^https?:\/\/.+/)) {
        validationErrors.push({
          row: rowNum,
          field: '출처URL',
          message: '올바른 URL 형식이 아닙니다. (http:// 또는 https://로 시작)',
          value: sourceUrl,
        });
        return;
      }

      // 처리된 인사정보 데이터 추가
      processedPersonnel.push({
        companyId: company.id,
        companyName: company.name,
        personName: String(row['인물명']).trim(),
        position: row['직책'] ? String(row['직책']).trim() : null,
        department: row['부서'] ? String(row['부서']).trim() : null,
        changeType,
        previousPosition: row['이전직책'] ? String(row['이전직책']).trim() : null,
        effectiveDate,
        announcedAt,
        sourceUrl,
      });
    });

    // 미리보기 모드: 검증 결과만 반환
    if (action === 'preview' || !action) {
      return NextResponse.json({
        success: true,
        data: {
          totalRows: rows.length,
          validRows: processedPersonnel.length,
          errorRows: validationErrors.length,
          errors: validationErrors,
          preview: processedPersonnel.slice(0, 10),
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

      const mode = formData.get('mode') as string; // 'replace' 또는 'merge'

      await prisma.$transaction(async (tx) => {
        if (mode === 'replace') {
          // 엑셀 업로드 데이터만 삭제 (크롤링/수기 입력 데이터는 유지)
          await tx.personnelChange.deleteMany({
            where: { sourceType: 'EXCEL_IMPORT' },
          });
        }

        // 새 데이터 삽입
        for (const personnel of processedPersonnel) {
          await tx.personnelChange.create({
            data: {
              companyId: personnel.companyId,
              personName: personnel.personName,
              position: personnel.position,
              department: personnel.department,
              changeType: personnel.changeType,
              previousPosition: personnel.previousPosition,
              effectiveDate: personnel.effectiveDate,
              announcedAt: personnel.announcedAt,
              sourceUrl: personnel.sourceUrl,
              sourceType: 'EXCEL_IMPORT',
              createdById: session.user.id,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          message: '인사정보가 성공적으로 업로드되었습니다.',
          totalRows: processedPersonnel.length,
          mode: mode,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('인사정보 업로드 실패:', error);
    return NextResponse.json(
      { success: false, error: '인사정보 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
