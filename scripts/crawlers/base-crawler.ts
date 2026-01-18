import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CrawledNews {
  title: string;
  content?: string;
  sourceUrl: string;
  sourceName: string;
  category?: string;
  imageUrl?: string;
  publishedAt: Date;
}

export interface CrawlerConfig {
  name: string;
  targetUrl: string;
  companyCode: string;
}

export abstract class BaseCrawler {
  protected config: CrawlerConfig;
  protected prisma = prisma;

  constructor(config: CrawlerConfig) {
    this.config = config;
  }

  // 크롤링 로그 시작
  protected async startCrawlLog(): Promise<string> {
    const log = await this.prisma.crawlLog.create({
      data: {
        targetUrl: this.config.targetUrl,
        status: 'RUNNING',
      },
    });
    return log.id;
  }

  // 크롤링 로그 완료
  protected async completeCrawlLog(
    logId: string,
    status: 'SUCCESS' | 'FAILED',
    itemsFound: number,
    errorMessage?: string
  ) {
    await this.prisma.crawlLog.update({
      where: { id: logId },
      data: {
        status,
        itemsFound,
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  // 증권사 ID 조회
  protected async getCompanyId(): Promise<string | null> {
    const company = await this.prisma.securitiesCompany.findUnique({
      where: { code: this.config.companyCode },
      select: { id: true },
    });
    return company?.id || null;
  }

  // 중복 뉴스 확인
  protected async isDuplicate(sourceUrl: string): Promise<boolean> {
    const existing = await this.prisma.news.findFirst({
      where: { sourceUrl },
      select: { id: true },
    });
    return !!existing;
  }

  // 뉴스 저장
  protected async saveNews(companyId: string, news: CrawledNews): Promise<boolean> {
    try {
      // 중복 확인
      if (await this.isDuplicate(news.sourceUrl)) {
        console.log(`  ⏭️  중복 뉴스 스킵: ${news.title.substring(0, 30)}...`);
        return false;
      }

      // 인사 뉴스 판별
      const isPersonnel = this.detectPersonnelNews(news.title, news.content || '');
      const category = isPersonnel ? 'PERSONNEL' : (news.category || 'GENERAL');

      await this.prisma.news.create({
        data: {
          companyId,
          title: news.title,
          content: news.content,
          sourceUrl: news.sourceUrl,
          sourceName: news.sourceName,
          imageUrl: news.imageUrl,
          category,
          isPersonnel,
          publishedAt: news.publishedAt,
        },
      });

      console.log(`  ✅ 저장됨: ${news.title.substring(0, 40)}...`);
      return true;
    } catch (error) {
      console.error(`  ❌ 저장 실패: ${news.title}`, error);
      return false;
    }
  }

  // 인사 뉴스 판별
  protected detectPersonnelNews(title: string, content: string): boolean {
    const personnelKeywords = [
      '인사',
      '임명',
      '선임',
      '승진',
      '취임',
      '사임',
      '퇴임',
      '대표이사',
      '부사장',
      '전무',
      '상무',
      '이사',
      '본부장',
      '부문장',
      '센터장',
      '조직개편',
    ];

    const text = `${title} ${content}`.toLowerCase();
    return personnelKeywords.some(keyword => text.includes(keyword));
  }

  // 카테고리 분류
  protected classifyCategory(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();

    if (this.detectPersonnelNews(title, content)) return 'PERSONNEL';
    if (/실적|영업이익|순이익|매출|분기|결산/.test(text)) return 'BUSINESS';
    if (/펀드|etf|상품|서비스|출시|오픈/.test(text)) return 'PRODUCT';
    if (/공시|ir|주주|배당|유상증자/.test(text)) return 'IR';
    if (/세미나|컨퍼런스|이벤트|행사|강연/.test(text)) return 'EVENT';

    return 'GENERAL';
  }

  // 크롤링 실행 (구현 필수)
  abstract crawl(): Promise<CrawledNews[]>;

  // 전체 실행 프로세스
  async run(): Promise<{ success: boolean; itemsFound: number; error?: string }> {
    console.log(`\n🕷️  [${this.config.name}] 크롤링 시작...`);
    console.log(`   URL: ${this.config.targetUrl}\n`);

    const logId = await this.startCrawlLog();
    let savedCount = 0;

    try {
      const companyId = await this.getCompanyId();
      if (!companyId) {
        throw new Error(`증권사 코드를 찾을 수 없습니다: ${this.config.companyCode}`);
      }

      const newsList = await this.crawl();
      console.log(`   📰 ${newsList.length}개 뉴스 발견\n`);

      for (const news of newsList) {
        const saved = await this.saveNews(companyId, news);
        if (saved) savedCount++;
      }

      await this.completeCrawlLog(logId, 'SUCCESS', savedCount);
      console.log(`\n✅ [${this.config.name}] 크롤링 완료: ${savedCount}개 저장됨\n`);

      return { success: true, itemsFound: savedCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      await this.completeCrawlLog(logId, 'FAILED', savedCount, errorMessage);
      console.error(`\n❌ [${this.config.name}] 크롤링 실패: ${errorMessage}\n`);

      return { success: false, itemsFound: savedCount, error: errorMessage };
    }
  }
}

export { prisma };
