import { NextResponse } from 'next/server';
import { generateWeeklyReport, getLatestReport, getReportList } from '@/lib/weekly-report-service';

export const maxDuration = 300; // 5분 타임아웃
export const dynamic = 'force-dynamic';

// GET: 리포트 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'latest';

    if (type === 'list') {
      const reports = await getReportList(10);
      return NextResponse.json({ success: true, data: reports });
    }

    const report = await getLatestReport();
    if (!report) {
      return NextResponse.json(
        { success: false, error: '발행된 리포트가 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Failed to get report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get report' },
      { status: 500 }
    );
  }
}

// POST: 리포트 생성
export async function POST() {
  try {
    console.log('Starting weekly report generation...');
    const result = await generateWeeklyReport();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '주간 리포트가 생성되었습니다.',
      reportId: result.reportId,
    });
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
