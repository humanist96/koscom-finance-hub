import { StyleSheet, Font } from '@react-pdf/renderer';

// 한글 폰트 등록 (로컬 폰트 파일)
const fontPath = process.cwd() + '/public/fonts';

Font.register({
  family: 'ArialUnicode',
  src: fontPath + '/ArialUnicode.ttf',
});

// 폰트 하이픈 비활성화
Font.registerHyphenationCallback(word => [word]);

export const styles = StyleSheet.create({
  // 페이지 기본
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'ArialUnicode',
    fontSize: 10,
    lineHeight: 1.6,
    backgroundColor: '#ffffff',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#64748b',
  },
  headerDate: {
    fontSize: 9,
    color: '#64748b',
  },

  // 푸터
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
  },

  // 리포트 제목
  reportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateRange: {
    fontSize: 12,
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },

  // 통계 박스
  statsBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
  },

  // 핵심 요약 박스
  executiveSummaryBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  executiveSummaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  executiveSummaryText: {
    fontSize: 11,
    color: '#1e3a8a',
    lineHeight: 1.7,
  },

  // 섹션
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionContent: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.7,
  },

  // 카테고리별 섹션
  categorySection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  categoryContent: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
  },

  // 회사 목록
  companyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  companyChip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  companyChipText: {
    fontSize: 9,
    color: '#3730a3',
  },

  // 전망 박스
  outlookBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  outlookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  outlookText: {
    fontSize: 10,
    color: '#78350f',
    lineHeight: 1.7,
  },

  // 면책 조항
  disclaimer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },

  // 뉴스 아이템 (회사별 뉴스 PDF용)
  newsItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  newsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  newsMeta: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },

  // 2열 레이아웃
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
});

export const colors = {
  primary: '#2563eb',
  primaryDark: '#1e40af',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  text: '#1e293b',
  textLight: '#64748b',
  background: '#f8fafc',
  border: '#e2e8f0',
};
