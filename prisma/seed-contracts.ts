import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 서비스 마스터 데이터
const serviceMasters = [
  { code: 'NXT', name: 'NXT (Next Generation Trading)', category: 'TRADING', description: '차세대 트레이딩 시스템' },
  { code: 'SOR', name: 'Smart Order Routing', category: 'TRADING', description: '스마트 주문 라우팅' },
  { code: 'FDS', name: 'Fraud Detection System', category: 'COMPLIANCE', description: '이상거래탐지시스템' },
  { code: 'NIGHT_DERIVATIVE', name: '야간파생', category: 'TRADING', description: '야간파생상품 거래' },
  { code: 'SOC2', name: 'SOC2', category: 'INFRA', description: 'SOC2 인증 관련 서비스' },
  { code: 'MTS_SIMPLE', name: 'MTS 간편모드', category: 'CHANNEL', description: '모바일 트레이딩 간편모드' },
  { code: 'WOORI_SETTLEMENT', name: '우리은행체결송신', category: 'INFRA', description: '우리은행 체결 연동' },
  { code: 'CALL_CENTER', name: '통합콜센터', category: 'CHANNEL', description: '통합 고객센터 시스템' },
  { code: 'ELB_DLB', name: 'ELB/DLB', category: 'TRADING', description: 'ELS/DLS 상품 처리' },
  { code: 'FOREIGN_BOND', name: '외화채권', category: 'TRADING', description: '외화채권 거래' },
  { code: 'EMAIL_SERVICE', name: 'E-MAIL서비스(망분리)', category: 'INFRA', description: '망분리 이메일 서비스' },
  { code: 'STOCK_LENDING', name: '자기주식대차', category: 'TRADING', description: '자기주식 대차거래' },
  { code: 'OVERSEAS_STOCK', name: '해외주식', category: 'TRADING', description: '해외주식 거래' },
  { code: 'SHORT_SELLING', name: '공매도연계서비스', category: 'TRADING', description: '공매도 연계 서비스' },
  { code: 'HEDGE_FUND_FEE', name: '헤지펀드성과보수', category: 'TRADING', description: '헤지펀드 성과보수 계산' },
  { code: 'KOSMOS_NEO', name: 'KOSMOS NEO', category: 'TRADING', description: '코스모스 네오 시스템' },
  { code: 'KOSMOS_NEO_NXT', name: 'KOSMOS NEO(NXT 참여)', category: 'TRADING', description: '코스모스 네오 NXT 연동' },
  { code: 'CMA', name: 'CMA서비스', category: 'TRADING', description: 'CMA 계좌 서비스' },
  { code: 'CARBON_EMISSION', name: '탄소배출권 PB전송서비스', category: 'TRADING', description: '탄소배출권 거래' },
  { code: 'KT_IDC', name: 'KT IDC', category: 'INFRA', description: 'KT IDC 서비스' },
  { code: 'API_NFS', name: 'API(NFS) 포함', category: 'INFRA', description: 'API 및 NFS 연동' },
  { code: 'HINT', name: 'HINT', category: 'CHANNEL', description: 'HINT 정보 서비스' },
  { code: 'SYSTEM_IF', name: '타시스템 I/F', category: 'INFRA', description: '타시스템 인터페이스' },
  { code: 'KTB_FUTURES', name: '국채금리선물', category: 'TRADING', description: '국채금리선물 거래' },
  { code: 'AML_UPGRADE', name: 'AML고도화', category: 'COMPLIANCE', description: '자금세탁방지 고도화' },
  { code: 'OVERSEAS_STOCK_SUPPORT', name: '해외주식 투자지원금', category: 'TRADING', description: '해외주식 투자지원' },
  { code: 'FVPL_LOAN', name: 'FVPL 매입대출채권', category: 'TRADING', description: 'FVPL 대출채권' },
  { code: 'MTS_BOND', name: 'MTS(장외채권,해외채권,비대면계좌개설)', category: 'CHANNEL', description: 'MTS 채권 및 비대면' },
  { code: 'SPOT_POST', name: '현물후처리', category: 'TRADING', description: '현물 후처리' },
  { code: 'COLLATERAL_MGMT', name: '담보통합관리', category: 'TRADING', description: '담보 통합관리' },
  { code: 'ETF', name: 'ETF', category: 'TRADING', description: 'ETF 거래' },
  { code: 'SPOT_NFS_MINI', name: '현물 NFS 미니원장', category: 'TRADING', description: '현물 NFS 미니원장' },
  { code: 'ANTI_FORGERY', name: '위변조방지 증명서', category: 'COMPLIANCE', description: '위변조방지 증명서' },
  { code: 'SPEED_ORDER', name: '스피드주문', category: 'TRADING', description: '고속 주문 시스템' },
];

// 고객사 계약 원본 데이터 (코스콤_고객사.md에서 파싱)
const customerContracts = [
  { orderNumber: 1, category: 'DOMESTIC', name: '(주)비엔케이투자증권', customerType: 'SECURITIES', currentRevenue: 71.51, powerbaseRevenue: 48.49, year2025Revenue: 4.71, progressNotes: null, services: { NXT: 1.54, FDS: 0.66, MTS_SIMPLE: 0.06, CALL_CENTER: 0.1, AML_UPGRADE: 1.99, ANTI_FORGERY: 0.24 } },
  { orderNumber: 2, category: 'DOMESTIC', name: '아이비케이투자증권(주)', customerType: 'SECURITIES', currentRevenue: 82.69, powerbaseRevenue: 45.22, year2025Revenue: 4.94, progressNotes: null, services: { NXT: 1.18, FDS: 0.75, EMAIL_SERVICE: 0.08, HEDGE_FUND_FEE: 0.12, SYSTEM_IF: 0.24, AML_UPGRADE: 1.99, OVERSEAS_STOCK_SUPPORT: 0.3, MTS_BOND: 0.18, SPOT_POST: 0.1 } },
  { orderNumber: 3, category: 'DOMESTIC', name: '(주)상상인증권', customerType: 'SECURITIES', currentRevenue: 62.64, powerbaseRevenue: 41.31, year2025Revenue: 3.29, progressNotes: null, services: { NXT: 1.54, FDS: 0.69, MTS_SIMPLE: 0.06, KT_IDC: 1 } },
  { orderNumber: 4, category: 'DOMESTIC', name: '한양증권', customerType: 'SECURITIES', currentRevenue: 58.42, powerbaseRevenue: 36.82, year2025Revenue: 7.45, progressNotes: '단독 MTS 앱 PB 개발 요청 예정', services: { NXT: 1.54, FDS: 0.66, MTS_SIMPLE: 0.06, OVERSEAS_STOCK: 3.66, HEDGE_FUND_FEE: 0.12, CARBON_EMISSION: 0.11, KT_IDC: 1, COLLATERAL_MGMT: 0.1, MTS_BOND: 0.18, SPEED_ORDER: 0.14 } },
  { orderNumber: 5, category: 'DOMESTIC', name: '다올투자증권 주식회사', customerType: 'SECURITIES', currentRevenue: 55.47, powerbaseRevenue: 33.17, year2025Revenue: 4.3, progressNotes: null, services: { NXT: 1.18, FDS: 0.72, ELB_DLB: 0.24, FOREIGN_BOND: 0.66, EMAIL_SERVICE: 0.08, SHORT_SELLING: 0.3, HEDGE_FUND_FEE: 0.12, KT_IDC: 1 } },
  { orderNumber: 6, category: 'DOMESTIC', name: '부국증권', customerType: 'SECURITIES', currentRevenue: 45.97, powerbaseRevenue: 29.57, year2025Revenue: 6.35, progressNotes: '한국거래소 8 TO 8에 관심 - 참여시 ATS 해지 고려', services: { NXT: 1.54, FDS: 0.66, NIGHT_DERIVATIVE: 2.64, MTS_SIMPLE: 0.06, STOCK_LENDING: 0.21, SYSTEM_IF: 0.24, KT_IDC: 1 } },
  { orderNumber: 7, category: 'DOMESTIC', name: '케이프투자증권', customerType: 'SECURITIES', currentRevenue: 37.69, powerbaseRevenue: 25.48, year2025Revenue: 5.71, progressNotes: '내부 CTI 재구축, 물리적 망분리전환', services: { NXT: 1.32, FDS: 0.69, NIGHT_DERIVATIVE: 2.64, MTS_SIMPLE: 0.06, KT_IDC: 1 } },
  { orderNumber: 8, category: 'DOMESTIC', name: '(주)우리투자증권', customerType: 'SECURITIES', currentRevenue: 31.13, powerbaseRevenue: 22.17, year2025Revenue: 6.69, progressNotes: "('26) 신탁업무/WRAP 서비스 계획\n('26) ETF LP 준비", services: { NXT: 1.18, FDS: 0.72, NIGHT_DERIVATIVE: 2.64, CALL_CENTER: 0.534, HEDGE_FUND_FEE: 0.12, KT_IDC: 1.5 } },
  { orderNumber: 9, category: 'FOREIGN', name: '제이피모간증권회사', customerType: 'SECURITIES', currentRevenue: 51.22, powerbaseRevenue: 21.84, year2025Revenue: 6.35, progressNotes: 'NXT 참여 계약서 계약 진행중', services: { NXT: 2.14, SOC2: 2.7, KOSMOS_NEO_NXT: 0.76, CMA: 0.75 } },
  { orderNumber: 10, category: 'FOREIGN', name: '골드만삭스증권회사서울지점', customerType: 'SECURITIES', currentRevenue: 35.22, powerbaseRevenue: 18.56, year2025Revenue: 3.54, progressNotes: null, services: { SOC2: 3.3, NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 11, category: 'FOREIGN', name: '메릴린치인터내셔날엘엘씨증권', customerType: 'SECURITIES', currentRevenue: 51.32, powerbaseRevenue: 18.02, year2025Revenue: 0.24, progressNotes: null, services: { NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 12, category: 'FOREIGN', name: '모간스탠리인터내셔날증권', customerType: 'SECURITIES', currentRevenue: 38.34, powerbaseRevenue: 17.84, year2025Revenue: 11.3, progressNotes: null, services: { SOC2: 2.4, API_NFS: 5.18, HINT: 3.48, SYSTEM_IF: 0.24 } },
  { orderNumber: 13, category: 'FOREIGN', name: '씨티그룹글로벌마켓증권', customerType: 'SECURITIES', currentRevenue: 29.94, powerbaseRevenue: 15.64, year2025Revenue: 3.56, progressNotes: 'SOR 글로벌 설명회 진행(10/22)', services: { NXT: 1.4, SOC2: 2.16 } },
  { orderNumber: 14, category: 'FOREIGN', name: '한국 에스지증권 주식회사', customerType: 'SECURITIES', currentRevenue: 28.49, powerbaseRevenue: 15.02, year2025Revenue: 2.85, progressNotes: null, services: { SOC2: 2.61, NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 15, category: 'FOREIGN', name: '비엔피파리바증권주식회사', customerType: 'SECURITIES', currentRevenue: 31.58, powerbaseRevenue: 14.81, year2025Revenue: 4.16, progressNotes: null, services: { NXT: 1.4, SOC2: 2.76 } },
  { orderNumber: 16, category: 'FOREIGN', name: '한국아이엠씨증권 주식회사', customerType: 'SECURITIES', currentRevenue: 23.02, powerbaseRevenue: 14, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 17, category: 'DOMESTIC', name: '디에스투자증권', customerType: 'SECURITIES', currentRevenue: 23.14, powerbaseRevenue: 13.97, year2025Revenue: 1.88, progressNotes: "('26) PB MTS 검토중\n('26년 6월 오픈예정) 자체 MTS - 비대면 + 국내주식 + 해외주식", services: { FDS: 0.66, STOCK_LENDING: 0.21, HEDGE_FUND_FEE: 0.12, CMA: 0.2, API_NFS: 0.25, MTS_BOND: 0.18, SPOT_NFS_MINI: 0.078, COLLATERAL_MGMT: 0.18 } },
  { orderNumber: 18, category: 'FOREIGN', name: '유비에스증권리미티드(영업소)', customerType: 'SECURITIES', currentRevenue: 29.39, powerbaseRevenue: 13.14, year2025Revenue: 2.16, progressNotes: null, services: { SOC2: 1.92, NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 19, category: 'DOMESTIC', name: '리딩투자증권 주식회사', customerType: 'SECURITIES', currentRevenue: 18.8, powerbaseRevenue: 13.08, year2025Revenue: 1.64, progressNotes: null, services: { NXT: 1.18, STOCK_LENDING: 0.21, API_NFS: 0.25 } },
  { orderNumber: 20, category: 'FOREIGN', name: '한국스탠다드차타드증권', customerType: 'SECURITIES', currentRevenue: 16.08, powerbaseRevenue: 11.16, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 21, category: 'FOREIGN', name: '씨엘에스에이코리아증권 주식회사', customerType: 'SECURITIES', currentRevenue: 19.9, powerbaseRevenue: 10.24, year2025Revenue: 4.48, progressNotes: 'NXT 참여 계약 예정', services: { NXT: 1.18, KOSMOS_NEO: 2.66, KOSMOS_NEO_NXT: 0.64 } },
  { orderNumber: 22, category: 'DOMESTIC', name: '금융감독원', customerType: 'INSTITUTION', currentRevenue: 11.95, powerbaseRevenue: 8.72, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 23, category: 'FOREIGN', name: '다이와증권캐피탈마켓코리아 주식회사', customerType: 'SECURITIES', currentRevenue: 15.16, powerbaseRevenue: 8.2, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 24, category: 'DOMESTIC', name: '흥국증권 주식회사', customerType: 'SECURITIES', currentRevenue: 12.93, powerbaseRevenue: 8.14, year2025Revenue: 1.55, progressNotes: "('26) PB MTS 사용 검토중", services: { NXT: 1.3, API_NFS: 0.25 } },
  { orderNumber: 25, category: 'DOMESTIC', name: '주식회사 카카오페이증권', customerType: 'SECURITIES', currentRevenue: 26.41, powerbaseRevenue: 7.82, year2025Revenue: 6.97, progressNotes: '장내채권 MTS 계약 체결완료', services: { SOR: 2.5, MTS_BOND: 4.47 } },
  { orderNumber: 26, category: 'DOMESTIC', name: '코리아에셋투자증권 주식회사', customerType: 'SECURITIES', currentRevenue: 12.43, powerbaseRevenue: 7.72, year2025Revenue: 1.75, progressNotes: null, services: { AML_UPGRADE: 1.5, API_NFS: 0.25 } },
  { orderNumber: 27, category: 'FOREIGN', name: '노무라금융투자 주식회사', customerType: 'SECURITIES', currentRevenue: 15.62, powerbaseRevenue: 7.59, year2025Revenue: 1.62, progressNotes: '국내 위탁매매 중개영업 해지 예정', services: { NXT: 1.38, NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 28, category: 'FOREIGN', name: '도이치증권주식회사', customerType: 'SECURITIES', currentRevenue: 15.74, powerbaseRevenue: 7.32, year2025Revenue: 3.06, progressNotes: '파생상품 야간시장 계약 완료', services: { SOC2: 2.82, NIGHT_DERIVATIVE: 0.24 } },
  { orderNumber: 29, category: 'FOREIGN', name: '맥쿼리증권(주)', customerType: 'SECURITIES', currentRevenue: 8.42, powerbaseRevenue: 6.22, year2025Revenue: 1.38, progressNotes: null, services: { NXT: 1.38 } },
  { orderNumber: 30, category: 'DOMESTIC', name: '케이씨지아이자산운용 주식회사', customerType: 'ASSET_MGMT', currentRevenue: 6.17, powerbaseRevenue: 5.52, year2025Revenue: 0.12, progressNotes: null, services: { FDS: 0.12 } },
  { orderNumber: 31, category: 'DOMESTIC', name: '넥스트증권 주식회사', customerType: 'SECURITIES', currentRevenue: 23.05, powerbaseRevenue: 5.43, year2025Revenue: 4.12, progressNotes: "('26년 3월) 자체 MTS 개발중\n('26년 6월 오픈예정) 자체 MTS - 비대면 + 국내주식 + 해외주식(AML/FATCA/FDS 사용예정)", services: { AML_UPGRADE: 4.12 } },
  { orderNumber: 32, category: 'FOREIGN', name: '홍콩상하이증권 서울지점', customerType: 'SECURITIES', currentRevenue: 16.23, powerbaseRevenue: 5.21, year2025Revenue: 6.92, progressNotes: null, services: { NXT: 1.18, NIGHT_DERIVATIVE: 0.24, API_NFS: 5.5 } },
  { orderNumber: 33, category: 'DOMESTIC', name: '미래에셋자산운용(주)', customerType: 'ASSET_MGMT', currentRevenue: 12.74, powerbaseRevenue: 4.93, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 34, category: 'DOMESTIC', name: '케이알투자증권(주)', customerType: 'SECURITIES', currentRevenue: 6.69, powerbaseRevenue: 4.48, year2025Revenue: 0.25, progressNotes: null, services: { API_NFS: 0.25 } },
  { orderNumber: 35, category: 'FOREIGN', name: '씨지에스 인터내셔널증권 홍콩 한국지점', customerType: 'SECURITIES', currentRevenue: 10.91, powerbaseRevenue: 3.81, year2025Revenue: 2.67, progressNotes: null, services: { KOSMOS_NEO: 2.67 } },
  { orderNumber: 36, category: 'DOMESTIC', name: '한화자산운용(주)', customerType: 'ASSET_MGMT', currentRevenue: 7.14, powerbaseRevenue: 3.75, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 37, category: 'DOMESTIC', name: '한국거래소', customerType: 'INSTITUTION', currentRevenue: 616.05, powerbaseRevenue: 3.47, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 38, category: 'DOMESTIC', name: '삼성자산운용(주)', customerType: 'ASSET_MGMT', currentRevenue: 10.97, powerbaseRevenue: 2.41, year2025Revenue: 0, progressNotes: '펀드판매시스템 서비스 변경계약 안내 - 기본료 인상(1.6 -> 2.3억) - 2년차부터 기본료 5% 인상', services: {} },
  { orderNumber: 39, category: 'MIGRATED', name: '미래에셋증권 주식회사', customerType: 'SECURITIES', currentRevenue: 56.57, powerbaseRevenue: 0.99, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 40, category: 'MIGRATED', name: '삼성증권', customerType: 'SECURITIES', currentRevenue: 46.83, powerbaseRevenue: 0.95, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 41, category: 'MIGRATED', name: '엔에이치투자증권(주)', customerType: 'SECURITIES', currentRevenue: 67.64, powerbaseRevenue: 0.91, year2025Revenue: 1.81, progressNotes: '임원진 교체 예정(전무, CIO, CISO 등)', services: { SOR: 1.57, KOSMOS_NEO: 0, KT_IDC: 0.242 } },
  { orderNumber: 42, category: 'MIGRATED', name: '신한투자증권(주)', customerType: 'SECURITIES', currentRevenue: 48.41, powerbaseRevenue: 0.91, year2025Revenue: 2.3, progressNotes: null, services: { SOR: 2.3 } },
  { orderNumber: 43, category: 'MIGRATED', name: '유진투자증권(주)', customerType: 'SECURITIES', currentRevenue: 34.68, powerbaseRevenue: 0.86, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 44, category: 'MIGRATED', name: '케이비증권 주식회사', customerType: 'SECURITIES', currentRevenue: 52.01, powerbaseRevenue: 0.8, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 45, category: 'MIGRATED', name: '키움증권', customerType: 'SECURITIES', currentRevenue: 69.7, powerbaseRevenue: 0.78, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 46, category: 'MIGRATED', name: '에스케이증권주식회사', customerType: 'SECURITIES', currentRevenue: 23.64, powerbaseRevenue: 0.78, year2025Revenue: 0, progressNotes: 'PB 윈백 영업 진행중 - PB 업무서비스 전달 예정 - PB 대 SK증권 갭분석 예정', services: {} },
  { orderNumber: 47, category: 'MIGRATED', name: '하나증권(주)', customerType: 'SECURITIES', currentRevenue: 39.13, powerbaseRevenue: 0.73, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 48, category: 'MIGRATED', name: '대신증권', customerType: 'SECURITIES', currentRevenue: 34.8, powerbaseRevenue: 0.73, year2025Revenue: 2.64, progressNotes: null, services: { SOR: 2.64 } },
  { orderNumber: 49, category: 'MIGRATED', name: '디비금융투자(주)', customerType: 'SECURITIES', currentRevenue: 28.8, powerbaseRevenue: 0.73, year2025Revenue: 3.58, progressNotes: 'PB 얼라이언스 강화 방문 예정', services: { SOR: 3.58 } },
  { orderNumber: 50, category: 'MIGRATED', name: '메리츠증권(주)', customerType: 'SECURITIES', currentRevenue: 44.77, powerbaseRevenue: 0.69, year2025Revenue: 0, progressNotes: '차세대 계획 및 신규사업 니즈 파악 방문 예정', services: {} },
  { orderNumber: 51, category: 'MIGRATED', name: '교보증권', customerType: 'SECURITIES', currentRevenue: 31.36, powerbaseRevenue: 0.69, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 52, category: 'MIGRATED', name: '현대차증권 주식회사', customerType: 'SECURITIES', currentRevenue: 18.2, powerbaseRevenue: 0.69, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 53, category: 'MIGRATED', name: '주식회사 아이엠증권', customerType: 'SECURITIES', currentRevenue: 22.9, powerbaseRevenue: 0.63, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 54, category: 'MIGRATED', name: '엘에스증권주식회사', customerType: 'SECURITIES', currentRevenue: 42.65, powerbaseRevenue: 0.6, year2025Revenue: 3.68, progressNotes: 'PB 얼라이언스 강화 방문 예정', services: { SOR: 3.68 } },
  { orderNumber: 55, category: 'MIGRATED', name: '유안타증권 주식회사', customerType: 'SECURITIES', currentRevenue: 31.13, powerbaseRevenue: 0.6, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 56, category: 'MIGRATED', name: '토스증권 주식회사', customerType: 'SECURITIES', currentRevenue: 27.94, powerbaseRevenue: 0.35, year2025Revenue: 2.64, progressNotes: null, services: { SOR: 2.64 } },
  { orderNumber: 57, category: 'DOMESTIC', name: '한국증권금융(주)', customerType: 'INSTITUTION', currentRevenue: 9.71, powerbaseRevenue: 0.24, year2025Revenue: 0, progressNotes: '통합콜센터 본인계좌 일괄지급정지 계약협의', services: {} },
  { orderNumber: 58, category: 'DOMESTIC', name: '유화증권', customerType: 'SECURITIES', currentRevenue: 9.63, powerbaseRevenue: 0.17, year2025Revenue: 0, progressNotes: 'PB 윈백 영업 진행중 - PB 업무서비스 전달 완료 - PB 대 유화증권 갭분석 거의 완료', services: {} },
  { orderNumber: 59, category: 'DOMESTIC', name: '엔에이치선물 주식회사', customerType: 'FUTURES', currentRevenue: 20.89, powerbaseRevenue: 0.13, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 60, category: 'DOMESTIC', name: '한화투자증권주식회사', customerType: 'SECURITIES', currentRevenue: 29.53, powerbaseRevenue: 0.09, year2025Revenue: 2.05, progressNotes: '차세대 계획 및 신규사업 니즈 파악 방문 예정', services: { SOR: 2.05 } },
  { orderNumber: 61, category: 'DOMESTIC', name: '삼성선물', customerType: 'FUTURES', currentRevenue: 20.32, powerbaseRevenue: 0.09, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 62, category: 'DOMESTIC', name: '유진투자선물(주)', customerType: 'FUTURES', currentRevenue: 12.18, powerbaseRevenue: 0.09, year2025Revenue: 0, progressNotes: null, services: {} },
  { orderNumber: 63, category: 'DOMESTIC', name: '로버스트자산운용', customerType: 'ASSET_MGMT', currentRevenue: 0, powerbaseRevenue: 0, year2025Revenue: 0, progressNotes: '펀드직판', services: {} },
  { orderNumber: 64, category: 'DOMESTIC', name: '머니투데이 신문', customerType: 'MEDIA', currentRevenue: 0, powerbaseRevenue: 0, year2025Revenue: 0.24, progressNotes: 'HINT 계약완료', services: { HINT: 0.24 } },
];

// 회사명 매핑 (원본 데이터 -> seed.ts의 SecuritiesCompany name)
const companyNameMapping: Record<string, string> = {
  '(주)비엔케이투자증권': 'BNK투자증권',
  '아이비케이투자증권(주)': 'IBK투자증권',
  '(주)상상인증권': '상상인증권',
  '한양증권': '한양증권',
  '다올투자증권 주식회사': '다올투자증권',
  '부국증권': '부국증권',
  '케이프투자증권': '케이프투자증권',
  '(주)우리투자증권': '우리투자증권',
  '제이피모간증권회사': 'JP모간증권',
  '골드만삭스증권회사서울지점': '골드만삭스증권',
  '메릴린치인터내셔날엘엘씨증권': '메릴린치증권',
  '모간스탠리인터내셔날증권': '모간스탠리증권',
  '씨티그룹글로벌마켓증권': '씨티그룹글로벌마켓증권',
  '한국 에스지증권 주식회사': 'SG증권',
  '비엔피파리바증권주식회사': 'BNP파리바증권',
  '한국아이엠씨증권 주식회사': '한국IMC증권',
  '디에스투자증권': 'DS투자증권',
  '유비에스증권리미티드(영업소)': 'UBS증권',
  '리딩투자증권 주식회사': '리딩투자증권',
  '한국스탠다드차타드증권': '스탠다드차타드증권',
  '씨엘에스에이코리아증권 주식회사': 'CLSA코리아증권',
  '금융감독원': '금융감독원',
  '다이와증권캐피탈마켓코리아 주식회사': '다이와증권',
  '흥국증권 주식회사': '흥국증권',
  '주식회사 카카오페이증권': '카카오페이증권',
  '코리아에셋투자증권 주식회사': '코리아에셋투자증권',
  '노무라금융투자 주식회사': '노무라금융투자',
  '도이치증권주식회사': '도이치증권',
  '맥쿼리증권(주)': '맥쿼리증권',
  '케이씨지아이자산운용 주식회사': 'KCGI자산운용',
  '넥스트증권 주식회사': '넥스트증권',
  '홍콩상하이증권 서울지점': 'HSBC증권',
  '미래에셋자산운용(주)': '미래에셋자산운용',
  '케이알투자증권(주)': 'KR투자증권',
  '씨지에스 인터내셔널증권 홍콩 한국지점': 'CGS인터내셔널증권',
  '한화자산운용(주)': '한화자산운용',
  '한국거래소': '한국거래소',
  '삼성자산운용(주)': '삼성자산운용',
  '미래에셋증권 주식회사': '미래에셋증권',
  '삼성증권': '삼성증권',
  '엔에이치투자증권(주)': 'NH투자증권',
  '신한투자증권(주)': '신한투자증권',
  '유진투자증권(주)': '유진투자증권',
  '케이비증권 주식회사': 'KB증권',
  '키움증권': '키움증권',
  '에스케이증권주식회사': 'SK증권',
  '하나증권(주)': '하나증권',
  '대신증권': '대신증권',
  '디비금융투자(주)': 'DB금융투자',
  '메리츠증권(주)': '메리츠증권',
  '교보증권': '교보증권',
  '현대차증권 주식회사': '현대차증권',
  '주식회사 아이엠증권': 'iM증권',
  '엘에스증권주식회사': 'LS증권',
  '유안타증권 주식회사': '유안타증권',
  '토스증권 주식회사': '토스증권',
  '한국증권금융(주)': '한국증권금융',
  '유화증권': '유화증권',
  '엔에이치선물 주식회사': 'NH선물',
  '한화투자증권주식회사': '한화투자증권',
  '삼성선물': '삼성선물',
  '유진투자선물(주)': '유진투자선물',
  '로버스트자산운용': '로버스트자산운용',
  '머니투데이 신문': '머니투데이',
};

async function main() {
  console.log('🏢 고객사 계약 데이터 시드 시작...\n');

  // 1. 서비스 마스터 데이터 삽입
  console.log('📋 서비스 마스터 데이터 삽입 중...');
  for (const service of serviceMasters) {
    await prisma.serviceMaster.upsert({
      where: { code: service.code },
      update: { name: service.name, category: service.category, description: service.description },
      create: service,
    });
  }
  console.log(`✅ ${serviceMasters.length}개 서비스 마스터 데이터 삽입 완료\n`);

  // 2. 기존 고객사 정보 가져오기
  const companies = await prisma.securitiesCompany.findMany();
  const companyMap = new Map(companies.map(c => [c.name, c.id]));

  // 3. 매핑되지 않은 회사는 새로 생성
  console.log('🔗 회사 매핑 및 신규 생성 중...');
  const newCompanies = [
    { name: '금융감독원', code: 'FSS' },
    { name: '한국거래소', code: 'KRX' },
    { name: '한국증권금융', code: 'KSFC' },
    { name: 'KCGI자산운용', code: 'KCGI' },
    { name: '미래에셋자산운용', code: 'MIRAE_AM' },
    { name: '한화자산운용', code: 'HANWHA_AM' },
    { name: '삼성자산운용', code: 'SAMSUNG_AM' },
    { name: '로버스트자산운용', code: 'ROBUST_AM' },
    { name: 'NH선물', code: 'NH_FUTURES' },
    { name: '삼성선물', code: 'SAMSUNG_FUTURES' },
    { name: '유진투자선물', code: 'EUGENE_FUTURES' },
    { name: '머니투데이', code: 'MONEYTODAY' },
    { name: '한화투자증권', code: 'HANWHAINV' },
  ];

  for (const company of newCompanies) {
    if (!companyMap.has(company.name)) {
      const created = await prisma.securitiesCompany.upsert({
        where: { code: company.code },
        update: {},
        create: {
          name: company.name,
          code: company.code,
          isPowerbaseClient: true,
        },
      });
      companyMap.set(company.name, created.id);
    }
  }

  // 4. 기존 계약 데이터 삭제
  console.log('🗑️  기존 계약 데이터 삭제 중...');
  await prisma.serviceContract.deleteMany({});
  await prisma.customerContract.deleteMany({});

  // 5. 고객사 계약 데이터 삽입
  console.log('📝 고객사 계약 데이터 삽입 중...');
  let successCount = 0;
  let skipCount = 0;

  for (const contract of customerContracts) {
    const mappedName = companyNameMapping[contract.name];
    if (!mappedName) {
      console.log(`⚠️  매핑되지 않은 회사: ${contract.name}`);
      skipCount++;
      continue;
    }

    const companyId = companyMap.get(mappedName);
    if (!companyId) {
      console.log(`⚠️  회사 ID를 찾을 수 없음: ${mappedName} (원본: ${contract.name})`);
      skipCount++;
      continue;
    }

    // 계약 정보 생성
    const createdContract = await prisma.customerContract.create({
      data: {
        companyId,
        orderNumber: contract.orderNumber,
        category: contract.category,
        customerType: contract.customerType,
        progressNotes: contract.progressNotes,
        currentRevenue: contract.currentRevenue,
        powerbaseRevenue: contract.powerbaseRevenue,
        year2025Revenue: contract.year2025Revenue,
        contractYear: 2025,
      },
    });

    // 서비스 계약 정보 생성
    const serviceEntries = Object.entries(contract.services);
    for (const [serviceCode, amount] of serviceEntries) {
      if (amount && amount > 0) {
        const serviceMaster = serviceMasters.find(s => s.code === serviceCode);
        await prisma.serviceContract.create({
          data: {
            contractId: createdContract.id,
            serviceCode,
            serviceName: serviceMaster?.name || serviceCode,
            amount,
            status: 'CONTRACTED',
          },
        });
      }
    }

    successCount++;
  }

  console.log(`✅ ${successCount}개 고객사 계약 데이터 삽입 완료`);
  if (skipCount > 0) {
    console.log(`⚠️  ${skipCount}개 고객사 스킵됨\n`);
  }

  // 6. 통계 출력
  const totalContracts = await prisma.customerContract.count();
  const totalServices = await prisma.serviceContract.count();
  const totalServiceMasters = await prisma.serviceMaster.count();

  console.log('\n📊 시드 결과 통계:');
  console.log(`  - 서비스 마스터: ${totalServiceMasters}개`);
  console.log(`  - 고객사 계약: ${totalContracts}개`);
  console.log(`  - 서비스 계약: ${totalServices}개`);

  console.log('\n🎉 고객사 계약 데이터 시드 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 삽입 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
