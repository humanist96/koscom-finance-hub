import { NextResponse } from 'next/server';
import { getLastCrawlStatus, runCrawler } from '@/lib/crawler-service';

// GET: 마지막 크롤링 상태 조회
export async function GET() {
  try {
    const status = await getLastCrawlStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get crawl status' },
      { status: 500 }
    );
  }
}

// POST: 크롤링 실행
export async function POST() {
  try {
    const { isRunning } = await getLastCrawlStatus();

    if (isRunning) {
      return NextResponse.json(
        { error: '크롤링이 이미 실행 중입니다.' },
        { status: 409 }
      );
    }

    // 비동기로 크롤링 실행 (응답은 바로 반환)
    runCrawler().catch(console.error);

    return NextResponse.json({
      message: '크롤링이 시작되었습니다.',
      startedAt: new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start crawler' },
      { status: 500 }
    );
  }
}
