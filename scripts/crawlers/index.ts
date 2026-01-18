import { crawlAllNaverNews } from './naver-news-crawler';
import { crawlAllSites } from './site-crawler';
import { prisma } from './base-crawler';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Securities Intelligence Hub - 데이터 수집 시작        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  const results: { source: string; success: boolean; count: number }[] = [];

  // 1. 네이버 뉴스 크롤링
  const naverClientId = process.env.NAVER_CLIENT_ID;
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

  if (naverClientId && naverClientSecret) {
    console.log('\n📰 네이버 뉴스 크롤링 시작...\n');
    try {
      const naverResults = await crawlAllNaverNews(naverClientId, naverClientSecret);
      const totalNaver = naverResults.reduce((sum, r) => sum + r.count, 0);
      results.push({ source: '네이버 뉴스', success: true, count: totalNaver });
    } catch (error) {
      console.error('네이버 뉴스 크롤링 실패:', error);
      results.push({ source: '네이버 뉴스', success: false, count: 0 });
    }
  } else {
    console.log('⚠️  네이버 API 키가 설정되지 않았습니다. 스킵합니다.\n');
  }

  // 2. 증권사 뉴스룸 크롤링
  console.log('\n🏢 증권사 뉴스룸 크롤링 시작...\n');
  try {
    const siteResults = await crawlAllSites();
    const totalSites = siteResults.reduce((sum, r) => sum + r.count, 0);
    results.push({ source: '증권사 뉴스룸', success: true, count: totalSites });
  } catch (error) {
    console.error('증권사 뉴스룸 크롤링 실패:', error);
    results.push({ source: '증권사 뉴스룸', success: false, count: 0 });
  }

  // 최종 결과
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalCount = results.reduce((sum, r) => sum + r.count, 0);

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    최종 결과 요약                          ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`║ ${status} ${r.source.padEnd(20)} : ${String(r.count).padStart(5)}개 저장     ║`);
  });
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║ 총 저장: ${String(totalCount).padStart(5)}개  |  소요 시간: ${elapsed.padStart(6)}초          ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('크롤러 실행 실패:', error);
  process.exit(1);
});
