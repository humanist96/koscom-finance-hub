import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PowerBase 회원 증권사 목록
const securitiesCompanies = [
  { name: '삼성증권', code: 'SAMSUNG', websiteUrl: 'https://www.samsungpop.com', newsroomUrl: 'https://www.samsungpop.com/mbw/news/newsRoom.do' },
  { name: '미래에셋증권', code: 'MIRAE', websiteUrl: 'https://securities.miraeasset.com', newsroomUrl: 'https://securities.miraeasset.com/bbs/board/messageList.do?categoryId=1545' },
  { name: 'NH투자증권', code: 'NH', websiteUrl: 'https://www.nhqv.com', newsroomUrl: 'https://www.nhqv.com/company/news.do' },
  { name: 'KB증권', code: 'KB', websiteUrl: 'https://www.kbsec.com', newsroomUrl: 'https://www.kbsec.com/go.able?linkcd=s01040000' },
  { name: '한국투자증권', code: 'HANKOOK', websiteUrl: 'https://www.truefriend.com', newsroomUrl: 'https://www.truefriend.com/main/customer/notice/List.do' },
  { name: '신한투자증권', code: 'SHINHAN', websiteUrl: 'https://www.shinhaninvest.com', newsroomUrl: 'https://www.shinhaninvest.com/siw/company-info/press-release/news-list.do' },
  { name: '키움증권', code: 'KIWOOM', websiteUrl: 'https://www.kiwoom.com', newsroomUrl: 'https://www.kiwoom.com/h/customer/notice/VCustomerNoticeNewsList' },
  { name: '대신증권', code: 'DAISHIN', websiteUrl: 'https://www.daishin.com', newsroomUrl: 'https://www.daishin.com/g.ds?m=1010&p=3010' },
  { name: '하나증권', code: 'HANA', websiteUrl: 'https://www.hanaw.com', newsroomUrl: 'https://www.hanaw.com/main/company/press/news.do' },
  { name: '메리츠증권', code: 'MERITZ', websiteUrl: 'https://www.meritz.co.kr', newsroomUrl: 'https://www.meritz.co.kr/company/press.do' },
  { name: '유안타증권', code: 'YUANTA', websiteUrl: 'https://www.myasset.com', newsroomUrl: 'https://www.myasset.com/myasset/company/press.cmd' },
  { name: '현대차증권', code: 'HYUNDAI', websiteUrl: 'https://www.hmsec.com', newsroomUrl: 'https://www.hmsec.com/company/press.do' },
  { name: 'SK증권', code: 'SK', websiteUrl: 'https://www.sks.co.kr', newsroomUrl: 'https://www.sks.co.kr/company/news.do' },
  { name: '한화투자증권', code: 'HANWHA', websiteUrl: 'https://www.hanwhawm.com', newsroomUrl: 'https://www.hanwhawm.com/main/company/news/list.do' },
  { name: '교보증권', code: 'KYOBO', websiteUrl: 'https://www.iprovest.com', newsroomUrl: 'https://www.iprovest.com/weblogic/ABCompanyServlet?action=3&cmd=1' },
  { name: 'DB금융투자', code: 'DB', websiteUrl: 'https://www.db-fi.com', newsroomUrl: 'https://www.db-fi.com/company/news.do' },
  { name: 'IBK투자증권', code: 'IBK', websiteUrl: 'https://www.ibks.com', newsroomUrl: 'https://www.ibks.com/company/press.do' },
  { name: '유진투자증권', code: 'EUGENE', websiteUrl: 'https://www.eugenefn.com', newsroomUrl: 'https://www.eugenefn.com/company/news.do' },
  { name: '이베스트투자증권', code: 'EBEST', websiteUrl: 'https://www.ebestsec.co.kr', newsroomUrl: 'https://www.ebestsec.co.kr/company/news.do' },
  { name: '신영증권', code: 'SHINYOUNG', websiteUrl: 'https://www.shinyoung.com', newsroomUrl: 'https://www.shinyoung.com/company/news.do' },
  { name: '부국증권', code: 'BOOKOOK', websiteUrl: 'https://www.bookook.co.kr', newsroomUrl: 'https://www.bookook.co.kr/company/news.do' },
  { name: '케이프투자증권', code: 'CAPE', websiteUrl: 'https://www.capefn.com', newsroomUrl: 'https://www.capefn.com/company/news.do' },
  { name: '하이투자증권', code: 'HI', websiteUrl: 'https://www.hi-ib.com', newsroomUrl: 'https://www.hi-ib.com/company/news.do' },
  { name: '토스증권', code: 'TOSS', websiteUrl: 'https://tossinvest.com', newsroomUrl: 'https://toss.im/team/article' },
  { name: '카카오페이증권', code: 'KAKAOPAY', websiteUrl: 'https://paySec.kakaopay.com', newsroomUrl: 'https://www.kakaocorp.com/page/news/pressRelease' },
];

// 샘플 뉴스 데이터는 더 이상 사용하지 않음
// 실제 뉴스는 크롤러(scripts/crawlers/final-crawler.ts)를 통해 수집
// 크롤러는 n.news.naver.com URL만 저장하므로 유효한 링크만 DB에 저장됨

// 샘플 인사 정보
const samplePersonnel = [
  {
    companyCode: 'SAMSUNG',
    personName: '김영호',
    position: '전무',
    department: '리테일사업부문',
    changeType: 'APPOINTMENT',
    previousPosition: '상무 (WM사업부)',
    announcedAt: new Date('2025-01-14T10:00:00'),
    effectiveDate: new Date('2025-02-01'),
  },
  {
    companyCode: 'MERITZ',
    personName: '박준호',
    position: '전무',
    department: 'IB부문',
    changeType: 'APPOINTMENT',
    previousPosition: null,
    announcedAt: new Date('2025-01-09T09:00:00'),
    effectiveDate: new Date('2025-01-15'),
  },
  {
    companyCode: 'MIRAE',
    personName: '이정민',
    position: '상무',
    department: '글로벌사업부',
    changeType: 'PROMOTION',
    previousPosition: '이사',
    announcedAt: new Date('2025-01-08T14:00:00'),
    effectiveDate: new Date('2025-01-15'),
  },
  {
    companyCode: 'NH',
    personName: '최민수',
    position: '본부장',
    department: '디지털사업본부',
    changeType: 'TRANSFER',
    previousPosition: '본부장 (리테일본부)',
    announcedAt: new Date('2025-01-07T11:00:00'),
    effectiveDate: new Date('2025-01-20'),
  },
];

async function main() {
  console.log('🌱 시드 데이터 삽입 시작...\n');

  // 1. 증권사 데이터 삽입
  console.log('📊 증권사 데이터 삽입 중...');
  for (const company of securitiesCompanies) {
    await prisma.securitiesCompany.upsert({
      where: { code: company.code },
      update: {},
      create: company,
    });
  }
  console.log(`✅ ${securitiesCompanies.length}개 증권사 데이터 삽입 완료\n`);

  // 2. 증권사 ID 매핑
  const companies = await prisma.securitiesCompany.findMany();
  const companyMap = new Map(companies.map(c => [c.code, c.id]));

  // 3. 뉴스 데이터는 크롤러를 통해 수집
  console.log('📰 뉴스 데이터는 크롤러(npm run crawl)를 통해 수집하세요.\n');

  // 4. 샘플 인사 정보 삽입
  console.log('👔 샘플 인사 정보 삽입 중...');
  for (const personnel of samplePersonnel) {
    const companyId = companyMap.get(personnel.companyCode);
    if (!companyId) continue;

    await prisma.personnelChange.create({
      data: {
        companyId,
        personName: personnel.personName,
        position: personnel.position,
        department: personnel.department,
        changeType: personnel.changeType,
        previousPosition: personnel.previousPosition,
        announcedAt: personnel.announcedAt,
        effectiveDate: personnel.effectiveDate,
      },
    });
  }
  console.log(`✅ ${samplePersonnel.length}개 인사 정보 삽입 완료\n`);

  console.log('🎉 시드 데이터 삽입 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 삽입 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
