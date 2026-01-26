import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// 인사정보 엑셀 템플릿 다운로드 API
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 로그인된 모든 사용자 허용
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 증권사 목록 조회 (코드 시트용)
    const companies = await prisma.securitiesCompany.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
      orderBy: { name: 'asc' },
    });

    // 템플릿 데이터 생성
    const templateData = [
      {
        '증권사코드': 'MIRAE',
        '인물명': '홍길동',
        '직책': '부사장',
        '부서': '리테일본부',
        '변동유형': 'PROMOTION',
        '이전직책': '전무',
        '발령일': '2025-02-01',
        '발표일': '2025-01-20',
        '출처URL': 'https://example.com/news/123',
      },
      {
        '증권사코드': 'SAMSUNG',
        '인물명': '김철수',
        '직책': '상무',
        '부서': 'WM사업부',
        '변동유형': 'APPOINTMENT',
        '이전직책': '',
        '발령일': '2025-02-15',
        '발표일': '2025-01-25',
        '출처URL': '',
      },
    ];

    // 작성안내 시트 데이터
    const instructionData = [
      { '항목': '증권사코드', '설명': '시스템에 등록된 증권사 코드', '필수여부': '필수', '예시': 'MIRAE, SAMSUNG, KB 등' },
      { '항목': '인물명', '설명': '인사이동 대상 인물의 이름', '필수여부': '필수', '예시': '홍길동' },
      { '항목': '직책', '설명': '현재(변동 후) 직책', '필수여부': '선택', '예시': '부사장, 전무, 상무' },
      { '항목': '부서', '설명': '소속 부서', '필수여부': '선택', '예시': '리테일본부, WM사업부' },
      { '항목': '변동유형', '설명': '인사 변동 유형 코드', '필수여부': '필수', '예시': 'PROMOTION, APPOINTMENT' },
      { '항목': '이전직책', '설명': '변동 전 직책 (승진/전보 시)', '필수여부': '선택', '예시': '전무, 이사' },
      { '항목': '발령일', '설명': '인사발령 적용일 (YYYY-MM-DD)', '필수여부': '선택', '예시': '2025-02-01' },
      { '항목': '발표일', '설명': '인사 발표일 (YYYY-MM-DD)', '필수여부': '필수', '예시': '2025-01-20' },
      { '항목': '출처URL', '설명': '관련 뉴스/공시 링크', '필수여부': '선택', '예시': 'https://...' },
    ];

    // 변동유형 코드 시트
    const changeTypeData = [
      { '코드': 'APPOINTMENT', '설명': '신규 임명', '비고': '새로운 직책에 임명되는 경우' },
      { '코드': 'PROMOTION', '설명': '승진', '비고': '기존 직책에서 상위 직책으로 승진' },
      { '코드': 'TRANSFER', '설명': '전보', '비고': '부서 이동 또는 직책 변경' },
      { '코드': 'RESIGNATION', '설명': '사임/퇴직', '비고': '자발적 퇴직' },
      { '코드': 'RETIREMENT', '설명': '정년퇴직', '비고': '정년에 의한 퇴직' },
    ];

    // 증권사 코드 시트
    const companyCodeData = companies.map((c) => ({
      '증권사코드': c.code || '',
      '증권사명': c.name,
    }));

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 인사정보 시트 (메인)
    const personnelSheet = XLSX.utils.json_to_sheet(templateData);
    personnelSheet['!cols'] = [
      { wch: 15 },  // 증권사코드
      { wch: 12 },  // 인물명
      { wch: 12 },  // 직책
      { wch: 15 },  // 부서
      { wch: 15 },  // 변동유형
      { wch: 12 },  // 이전직책
      { wch: 12 },  // 발령일
      { wch: 12 },  // 발표일
      { wch: 40 },  // 출처URL
    ];
    XLSX.utils.book_append_sheet(workbook, personnelSheet, '인사정보');

    // 작성안내 시트
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 10 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, '작성안내');

    // 변동유형 코드 시트
    const changeTypeSheet = XLSX.utils.json_to_sheet(changeTypeData);
    changeTypeSheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, changeTypeSheet, '변동유형코드');

    // 증권사코드 시트
    const companySheet = XLSX.utils.json_to_sheet(companyCodeData);
    companySheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, companySheet, '증권사코드');

    // 엑셀 파일 생성
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성 (날짜 포함)
    const today = new Date().toISOString().split('T')[0];
    const filename = `인사정보_업로드_템플릿_${today}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    console.error('템플릿 다운로드 실패:', error);
    return NextResponse.json(
      { success: false, error: '템플릿 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
