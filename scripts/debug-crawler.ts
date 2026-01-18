import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  const url = 'https://search.naver.com/search.naver?where=news&query=삼성증권&sort=1';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

  // 페이지 HTML 일부 출력
  const html = await page.content();

  // 뉴스 관련 클래스 찾기
  const classes = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const newsClasses = new Set<string>();

    allElements.forEach(el => {
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ');
        classes.forEach(c => {
          if (c.includes('news') || c.includes('list') || c.includes('item') || c.includes('tit')) {
            newsClasses.add(c);
          }
        });
      }
    });

    return Array.from(newsClasses).slice(0, 30);
  });

  console.log('발견된 클래스:', classes);

  // 링크들 확인
  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a[href*="news.naver"], a[class*="tit"]');
    return Array.from(anchors).slice(0, 10).map(a => ({
      text: a.textContent?.trim().substring(0, 50),
      href: (a as HTMLAnchorElement).href,
      class: a.className
    }));
  });

  console.log('\n링크들:', JSON.stringify(links, null, 2));

  await browser.close();
}

main();
