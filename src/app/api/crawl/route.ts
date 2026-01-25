import { NextResponse } from 'next/server';
import { getLastCrawlStatus, runServerlessCrawler } from '@/lib/serverless-crawler';
import { generateWeeklyReport } from '@/lib/weekly-report-service';

// Vercel Cron이 호출할 수 있도록 설정
export const maxDuration = 300; // 5분 타임아웃
export const dynamic = 'force-dynamic';

// GET: 마지막 크롤링 상태 조회
export async function GET() {
  try {
    const status = await getLastCrawlStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get crawl status:', error);
    return NextResponse.json(
      { error: 'Failed to get crawl status' },
      { status: 500 }
    );
  }
}

// POST: 크롤링 실행 (수동 또는 Cron에서 호출)
export async function POST(request: Request) {
  try {
    // Vercel Cron 인증 확인 (선택사항)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // CRON_SECRET이 설정된 경우 인증 강제
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    const { isRunning } = await getLastCrawlStatus();

    if (isRunning) {
      return NextResponse.json(
        { error: '크롤링이 이미 실행 중입니다.' },
        { status: 409 }
      );
    }

    // 동기적으로 크롤링 실행 (Vercel Cron은 응답을 기다림)
    const result = await runServerlessCrawler();

    // 월요일(1)에는 주간 리포트도 생성
    const today = new Date();
    let reportResult = null;
    if (today.getDay() === 1) { // Monday
      console.log('Monday detected - generating weekly report...');
      reportResult = await generateWeeklyReport();
    }

    return NextResponse.json({
      message: '크롤링이 완료되었습니다.',
      ...result,
      weeklyReport: reportResult,
    });
  } catch (error) {
    console.error('Failed to run crawler:', error);
    return NextResponse.json(
      { error: 'Failed to run crawler', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
