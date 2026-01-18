import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://search.naver.com/search.naver?where=news&query=삼성증권&sort=1', {
    waitUntil: 'networkidle2',
    timeout: 20000
  });

  await new Promise(r => setTimeout(r, 3000));

  const html = await page.content();
  fs.writeFileSync('/tmp/naver-news.html', html);

  // 뉴스 관련 요소 분석
  const analysis = await page.evaluate(() => {
    const result: string[] = [];

    // list_news 찾기
    const listNews = document.querySelector('.list_news');
    if (listNews) {
      result.push('list_news 발견: ' + listNews.children.length + '개 자식');

      // 첫 번째 아이템 분석
      const firstItem = listNews.children[0];
      if (firstItem) {
        result.push('첫 아이템 클래스: ' + firstItem.className);
        result.push('첫 아이템 HTML (500자): ' + firstItem.innerHTML.substring(0, 500));
      }
    }

    // 모든 뉴스 링크 찾기
    const newsLinks = document.querySelectorAll('a[href*="n.news.naver.com"]');
    result.push('뉴스 링크 수: ' + newsLinks.length);

    if (newsLinks.length > 0) {
      const first = newsLinks[0] as HTMLAnchorElement;
      result.push('첫 링크: ' + first.href);
      result.push('첫 링크 텍스트: ' + first.textContent?.substring(0, 100));
      result.push('첫 링크 부모: ' + first.parentElement?.className);
    }

    return result;
  });

  console.log('분석 결과:');
  analysis.forEach(line => console.log(line));

  await browser.close();
}

main();
