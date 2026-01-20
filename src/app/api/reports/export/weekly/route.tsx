import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { WeeklyReportPDF } from '@/components/pdf';
import { format } from 'date-fns';
import React, { ReactElement } from 'react';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    // 리포트 조회 (ID가 있으면 해당 리포트, 없으면 최신 리포트)
    const report = reportId
      ? await prisma.weeklyReport.findUnique({
          where: { id: reportId },
        })
      : await prisma.weeklyReport.findFirst({
          orderBy: { weekStart: 'desc' },
        });

    if (!report) {
      return NextResponse.json(
        { success: false, error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // companyMentions JSON 파싱
    const companyMentions = report.companyMentions
      ? JSON.parse(report.companyMentions)
      : null;

    const reportData = {
      ...report,
      weekStart: report.weekStart.toISOString(),
      weekEnd: report.weekEnd.toISOString(),
      publishedAt: report.publishedAt?.toISOString() || null,
      companyMentions,
    };

    // PDF 생성
    const pdfBuffer = await renderToBuffer(
      React.createElement(WeeklyReportPDF, { report: reportData }) as ReactElement<DocumentProps>
    );

    // 파일명 생성
    const filename = `주간리포트_${format(new Date(report.weekStart), 'yyyyMMdd')}_${format(new Date(report.weekEnd), 'yyyyMMdd')}.pdf`;

    // PDF 응답 반환
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'PDF 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
