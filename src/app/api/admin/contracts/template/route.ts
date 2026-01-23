import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';

// 엑셀 템플릿 다운로드 API
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

    // 관리자 권한 확인
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 템플릿 데이터 생성
    const templateData = [
      {
        '순번': 1,
        '증권사코드': 'MIRAE',
        '증권사명': '미래에셋증권',
        '구분': 'DOMESTIC',
        '고객분류': 'SECURITIES',
        '당기매출(억원)': 10.5,
        'PowerBASE매출(억원)': 8.2,
        '2025예상매출(억원)': 12.0,
        '계약연도': 2025,
        '진행사항': '정상 운영 중',
        '서비스코드': 'NXT,SOR,FDS',
        '서비스금액(억원)': '3.0,2.5,2.7',
      },
      {
        '순번': 2,
        '증권사코드': 'SAMSUNG',
        '증권사명': '삼성증권',
        '구분': 'DOMESTIC',
        '고객분류': 'SECURITIES',
        '당기매출(억원)': 8.0,
        'PowerBASE매출(억원)': 6.5,
        '2025예상매출(억원)': 9.0,
        '계약연도': 2025,
        '진행사항': '',
        '서비스코드': 'NXT,SISE',
        '서비스금액(억원)': '4.0,2.5',
      },
    ];

    // 설명 시트 데이터
    const instructionData = [
      { '항목': '순번', '설명': '계약 순번 (숫자)', '필수여부': '필수', '예시': '1, 2, 3...' },
      { '항목': '증권사코드', '설명': '시스템에 등록된 증권사 코드', '필수여부': '필수', '예시': 'MIRAE, SAMSUNG, KB 등' },
      { '항목': '증권사명', '설명': '증권사 이름 (참고용, 코드로 매칭)', '필수여부': '선택', '예시': '미래에셋증권' },
      { '항목': '구분', '설명': 'DOMESTIC(국내), FOREIGN(외자계), MIGRATED(이관사)', '필수여부': '필수', '예시': 'DOMESTIC' },
      { '항목': '고객분류', '설명': 'SECURITIES(증권사), INSTITUTION(유관기관), ASSET_MGMT(자산운용), FUTURES(선물), MEDIA(언론)', '필수여부': '필수', '예시': 'SECURITIES' },
      { '항목': '당기매출(억원)', '설명': '현재 연도 매출액 (숫자)', '필수여부': '선택', '예시': '10.5' },
      { '항목': 'PowerBASE매출(억원)', '설명': 'PowerBASE 관련 매출액 (숫자)', '필수여부': '선택', '예시': '8.2' },
      { '항목': '2025예상매출(억원)', '설명': '2025년 예상 매출액 (숫자)', '필수여부': '선택', '예시': '12.0' },
      { '항목': '계약연도', '설명': '계약 기준 연도 (숫자)', '필수여부': '선택', '예시': '2025' },
      { '항목': '진행사항', '설명': '계약 진행 상황 메모', '필수여부': '선택', '예시': '정상 운영 중' },
      { '항목': '서비스코드', '설명': '계약 서비스 코드 (쉼표로 구분)', '필수여부': '선택', '예시': 'NXT,SOR,FDS' },
      { '항목': '서비스금액(억원)', '설명': '각 서비스별 금액 (쉼표로 구분, 서비스코드 순서와 일치)', '필수여부': '선택', '예시': '3.0,2.5,2.7' },
    ];

    // 구분/고객분류 코드 시트
    const codeData = [
      { '구분': '구분(Category)', '코드': 'DOMESTIC', '설명': '국내 증권사' },
      { '구분': '구분(Category)', '코드': 'FOREIGN', '설명': '외자계 증권사' },
      { '구분': '구분(Category)', '코드': 'MIGRATED', '설명': '이관사' },
      { '구분': '', '코드': '', '설명': '' },
      { '구분': '고객분류(CustomerType)', '코드': 'SECURITIES', '설명': '증권사' },
      { '구분': '고객분류(CustomerType)', '코드': 'INSTITUTION', '설명': '유관기관' },
      { '구분': '고객분류(CustomerType)', '코드': 'ASSET_MGMT', '설명': '자산운용사' },
      { '구분': '고객분류(CustomerType)', '코드': 'FUTURES', '설명': '선물사' },
      { '구분': '고객분류(CustomerType)', '코드': 'MEDIA', '설명': '신문/언론사' },
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 계약정보 시트 (메인)
    const contractSheet = XLSX.utils.json_to_sheet(templateData);

    // 컬럼 너비 설정
    contractSheet['!cols'] = [
      { wch: 8 },   // 순번
      { wch: 15 },  // 증권사코드
      { wch: 20 },  // 증권사명
      { wch: 12 },  // 구분
      { wch: 15 },  // 고객분류
      { wch: 18 },  // 당기매출
      { wch: 20 },  // PowerBASE매출
      { wch: 20 },  // 2025예상매출
      { wch: 10 },  // 계약연도
      { wch: 30 },  // 진행사항
      { wch: 25 },  // 서비스코드
      { wch: 25 },  // 서비스금액
    ];

    XLSX.utils.book_append_sheet(workbook, contractSheet, '계약정보');

    // 작성안내 시트
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 25 },
      { wch: 50 },
      { wch: 10 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, '작성안내');

    // 코드정보 시트
    const codeSheet = XLSX.utils.json_to_sheet(codeData);
    codeSheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, codeSheet, '코드정보');

    // 엑셀 파일 생성
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성 (날짜 포함)
    const today = new Date().toISOString().split('T')[0];
    const filename = `계약정보_업로드_템플릿_${today}.xlsx`;

    // 응답 반환
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
