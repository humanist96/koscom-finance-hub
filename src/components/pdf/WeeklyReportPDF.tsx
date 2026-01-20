import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  businessSummary: string | null;
  personnelSummary: string | null;
  productSummary: string | null;
  irSummary: string | null;
  eventSummary: string | null;
  generalSummary: string | null;
  executiveSummary: string | null;
  closingRemarks: string | null;
  totalNewsCount: number;
  companyMentions: Record<string, number> | null;
  publishedAt: string | null;
}

interface WeeklyReportPDFProps {
  report: WeeklyReport;
}

// 헤더 컴포넌트
function PDFHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLogo}>
        <View style={styles.headerLogoBox}>
          <Text style={styles.headerLogoText}>K</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>KOSCOM</Text>
          <Text style={styles.headerSubtitle}>금융영업부 Hub</Text>
        </View>
      </View>
      <Text style={styles.headerDate}>
        발행일: {format(new Date(), 'yyyy년 M월 d일', { locale: ko })}
      </Text>
    </View>
  );
}

// 푸터 컴포넌트
function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        KOSCOM 금융영업부 Hub - 증권사 동향 리포트
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

// 카테고리 섹션 컴포넌트
function CategorySection({
  title,
  content,
  emoji,
}: {
  title: string;
  content: string | null;
  emoji: string;
}) {
  if (!content || content.includes('뉴스가 없습니다')) {
    return null;
  }

  return (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>
        {emoji} {title}
      </Text>
      <Text style={styles.categoryContent}>{content}</Text>
    </View>
  );
}

export function WeeklyReportPDF({ report }: WeeklyReportPDFProps) {
  const weekStart = format(new Date(report.weekStart), 'yyyy년 M월 d일', {
    locale: ko,
  });
  const weekEnd = format(new Date(report.weekEnd), 'M월 d일', { locale: ko });

  // 상위 10개 증권사
  const topCompanies = report.companyMentions
    ? Object.entries(report.companyMentions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];

  return (
    <Document
      title={`주간 증권사 동향 리포트 (${weekStart} ~ ${weekEnd})`}
      author="KOSCOM 금융영업부"
      subject="증권사 동향 분석 리포트"
      keywords="증권사, 동향, 분석, 리포트, KOSCOM"
    >
      <Page size="A4" style={styles.page}>
        <PDFHeader />

        {/* 리포트 제목 */}
        <Text style={styles.reportTitle}>주간 증권사 동향 리포트</Text>
        <Text style={styles.reportSubtitle}>
          PowerBase 회원 증권사의 주요 동향을 한눈에
        </Text>
        <Text style={styles.dateRange}>
          {weekStart} ~ {weekEnd}
        </Text>

        {/* 통계 */}
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{report.totalNewsCount}</Text>
            <Text style={styles.statLabel}>분석 뉴스</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{topCompanies.length}</Text>
            <Text style={styles.statLabel}>언급 증권사</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>분석 카테고리</Text>
          </View>
        </View>

        {/* 핵심 요약 */}
        {report.executiveSummary && (
          <View style={styles.executiveSummaryBox}>
            <Text style={styles.executiveSummaryTitle}>핵심 요약</Text>
            <Text style={styles.executiveSummaryText}>
              {report.executiveSummary}
            </Text>
          </View>
        )}

        {/* 주요 증권사 */}
        {topCompanies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이번 주 주요 증권사</Text>
            <View style={styles.companyList}>
              {topCompanies.map(([name, count]) => (
                <View key={name} style={styles.companyChip}>
                  <Text style={styles.companyChipText}>
                    {name} ({count}건)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* 2페이지: 카테고리별 상세 */}
      <Page size="A4" style={styles.page}>
        <PDFHeader />

        <Text style={styles.sectionTitle}>카테고리별 동향 분석</Text>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <CategorySection
              emoji="[1]"
              title="실적/사업 동향"
              content={report.businessSummary}
            />
            <CategorySection
              emoji="[2]"
              title="인사 동향"
              content={report.personnelSummary}
            />
            <CategorySection
              emoji="[3]"
              title="상품/서비스"
              content={report.productSummary}
            />
          </View>
          <View style={styles.column}>
            <CategorySection
              emoji="[4]"
              title="IR/공시"
              content={report.irSummary}
            />
            <CategorySection
              emoji="[5]"
              title="이벤트/행사"
              content={report.eventSummary}
            />
            <CategorySection
              emoji="[6]"
              title="기타 동향"
              content={report.generalSummary}
            />
          </View>
        </View>

        {/* 다음 주 전망 */}
        {report.closingRemarks && (
          <View style={styles.outlookBox}>
            <Text style={styles.outlookTitle}>다음 주 전망</Text>
            <Text style={styles.outlookText}>{report.closingRemarks}</Text>
          </View>
        )}

        {/* 면책 조항 */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            본 리포트는 AI가 뉴스 데이터를 분석하여 자동 생성한 것으로, 참고
            용으로만 활용해 주세요. KOSCOM 금융영업부 Hub
          </Text>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
