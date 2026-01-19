import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 국내 증권사 전체 목록 (대형 + 소형 + 외국계)
// isPowerbaseClient: 코스콤 Powerbase 고객사 여부
const securitiesCompanies = [
  // 대형 증권사 (Powerbase 고객사)
  { name: '삼성증권', code: 'SAMSUNG', websiteUrl: 'https://www.samsungpop.com', newsroomUrl: 'https://www.samsungpop.com/mbw/news/newsRoom.do', isPowerbaseClient: true },
  { name: '미래에셋증권', code: 'MIRAE', websiteUrl: 'https://securities.miraeasset.com', newsroomUrl: 'https://securities.miraeasset.com/bbs/board/messageList.do?categoryId=1545', isPowerbaseClient: true },
  { name: 'NH투자증권', code: 'NH', websiteUrl: 'https://www.nhqv.com', newsroomUrl: 'https://www.nhqv.com/company/news.do', isPowerbaseClient: true },
  { name: 'KB증권', code: 'KB', websiteUrl: 'https://www.kbsec.com', newsroomUrl: 'https://www.kbsec.com/go.able?linkcd=s01040000', isPowerbaseClient: true },
  { name: '한국투자증권', code: 'HANKOOK', websiteUrl: 'https://www.truefriend.com', newsroomUrl: 'https://www.truefriend.com/main/customer/notice/List.do', isPowerbaseClient: false },
  { name: '신한투자증권', code: 'SHINHAN', websiteUrl: 'https://www.shinhaninvest.com', newsroomUrl: 'https://www.shinhaninvest.com/siw/company-info/press-release/news-list.do', isPowerbaseClient: true },
  { name: '키움증권', code: 'KIWOOM', websiteUrl: 'https://www.kiwoom.com', newsroomUrl: 'https://www.kiwoom.com/h/customer/notice/VCustomerNoticeNewsList', isPowerbaseClient: true },
  { name: '대신증권', code: 'DAISHIN', websiteUrl: 'https://www.daishin.com', newsroomUrl: 'https://www.daishin.com/g.ds?m=1010&p=3010', isPowerbaseClient: true },
  { name: '하나증권', code: 'HANA', websiteUrl: 'https://www.hanaw.com', newsroomUrl: 'https://www.hanaw.com/main/company/press/news.do', isPowerbaseClient: true },
  { name: '메리츠증권', code: 'MERITZ', websiteUrl: 'https://www.meritz.co.kr', newsroomUrl: 'https://www.meritz.co.kr/company/press.do', isPowerbaseClient: true },
  { name: '유안타증권', code: 'YUANTA', websiteUrl: 'https://www.myasset.com', newsroomUrl: 'https://www.myasset.com/myasset/company/press.cmd', isPowerbaseClient: true },
  { name: '현대차증권', code: 'HYUNDAI', websiteUrl: 'https://www.hmsec.com', newsroomUrl: 'https://www.hmsec.com/company/press.do', isPowerbaseClient: true },
  { name: 'SK증권', code: 'SK', websiteUrl: 'https://www.sks.co.kr', newsroomUrl: 'https://www.sks.co.kr/company/news.do', isPowerbaseClient: true },
  { name: '한화투자증권', code: 'HANWHA', websiteUrl: 'https://www.hanwhawm.com', newsroomUrl: 'https://www.hanwhawm.com/main/company/news/list.do', isPowerbaseClient: true },
  { name: '교보증권', code: 'KYOBO', websiteUrl: 'https://www.iprovest.com', newsroomUrl: 'https://www.iprovest.com/weblogic/ABCompanyServlet?action=3&cmd=1', isPowerbaseClient: true },
  { name: 'DB금융투자', code: 'DB', websiteUrl: 'https://www.db-fi.com', newsroomUrl: 'https://www.db-fi.com/company/news.do', isPowerbaseClient: true },
  { name: 'IBK투자증권', code: 'IBK', websiteUrl: 'https://www.ibks.com', newsroomUrl: 'https://www.ibks.com/company/press.do', isPowerbaseClient: true },
  { name: '유진투자증권', code: 'EUGENE', websiteUrl: 'https://www.eugenefn.com', newsroomUrl: 'https://www.eugenefn.com/company/news.do', isPowerbaseClient: true },
  { name: '이베스트투자증권', code: 'EBEST', websiteUrl: 'https://www.ebestsec.co.kr', newsroomUrl: 'https://www.ebestsec.co.kr/company/news.do', isPowerbaseClient: false },
  { name: '신영증권', code: 'SHINYOUNG', websiteUrl: 'https://www.shinyoung.com', newsroomUrl: 'https://www.shinyoung.com/company/news.do', isPowerbaseClient: false },
  { name: '부국증권', code: 'BOOKOOK', websiteUrl: 'https://www.bookook.co.kr', newsroomUrl: 'https://www.bookook.co.kr/company/news.do', isPowerbaseClient: true },
  { name: '케이프투자증권', code: 'CAPE', websiteUrl: 'https://www.capefn.com', newsroomUrl: 'https://www.capefn.com/company/news.do', isPowerbaseClient: true },
  { name: '하이투자증권', code: 'HI', websiteUrl: 'https://www.hi-ib.com', newsroomUrl: 'https://www.hi-ib.com/company/news.do', isPowerbaseClient: false },
  { name: '토스증권', code: 'TOSS', websiteUrl: 'https://tossinvest.com', newsroomUrl: 'https://toss.im/team/article', isPowerbaseClient: true },
  { name: '카카오페이증권', code: 'KAKAOPAY', websiteUrl: 'https://paySec.kakaopay.com', newsroomUrl: 'https://www.kakaocorp.com/page/news/pressRelease', isPowerbaseClient: true },
  // 소형 증권사
  { name: 'BNK투자증권', code: 'BNK', websiteUrl: 'https://www.bnkfn.co.kr', newsroomUrl: 'https://www.bnkfn.co.kr/company/news', isPowerbaseClient: true },
  { name: 'DS투자증권', code: 'DS', websiteUrl: 'https://www.dssec.co.kr', newsroomUrl: 'https://www.dssec.co.kr', isPowerbaseClient: true },
  { name: 'iM증권', code: 'IM', websiteUrl: 'https://www.imsec.co.kr', newsroomUrl: 'https://www.imsec.co.kr', isPowerbaseClient: true },
  { name: 'KR투자증권', code: 'KR', websiteUrl: 'https://www.krsec.co.kr', newsroomUrl: 'https://www.krsec.co.kr', isPowerbaseClient: true },
  { name: 'LS증권', code: 'LS', websiteUrl: 'https://www.ls-sec.co.kr', newsroomUrl: 'https://www.ls-sec.co.kr', isPowerbaseClient: true },
  { name: '다올투자증권', code: 'DAOL', websiteUrl: 'https://www.daolsecurities.com', newsroomUrl: 'https://www.daolsecurities.com', isPowerbaseClient: true },
  { name: '리딩투자증권', code: 'LEADING', websiteUrl: 'https://www.leading.co.kr', newsroomUrl: 'https://www.leading.co.kr', isPowerbaseClient: true },
  { name: '상상인증권', code: 'SANGSANGIN', websiteUrl: 'https://www.sangsanginib.com', newsroomUrl: 'https://www.sangsanginib.com', isPowerbaseClient: true },
  { name: '유화증권', code: 'YUHWA', websiteUrl: 'https://www.yhs.co.kr', newsroomUrl: 'https://www.yhs.co.kr', isPowerbaseClient: true },
  { name: '한양증권', code: 'HANYANG', websiteUrl: 'https://www.hygood.co.kr', newsroomUrl: 'https://www.hygood.co.kr', isPowerbaseClient: true },
  { name: '코리아에셋투자증권', code: 'KOREAASSET', websiteUrl: 'https://www.koreaasset.co.kr', newsroomUrl: 'https://www.koreaasset.co.kr', isPowerbaseClient: true },
  { name: '흥국증권', code: 'HEUNGKUK', websiteUrl: 'https://www.heungkuksec.co.kr', newsroomUrl: 'https://www.heungkuksec.co.kr', isPowerbaseClient: true },
  { name: '나무증권', code: 'NAMU', websiteUrl: 'https://www.namuh.com', newsroomUrl: 'https://www.namuh.com', isPowerbaseClient: false },
  { name: '넥스트증권', code: 'NEXT', websiteUrl: 'https://www.nextsec.co.kr', newsroomUrl: 'https://www.nextsec.co.kr', isPowerbaseClient: true },
  { name: '한국포스증권', code: 'KOREAFOS', websiteUrl: 'https://www.fosstock.co.kr', newsroomUrl: 'https://www.fosstock.co.kr', isPowerbaseClient: false },
  // 외국계 증권사 (Powerbase 고객사)
  { name: '우리투자증권', code: 'WOORI', websiteUrl: 'https://www.wooriwm.com', newsroomUrl: 'https://www.wooriwm.com', isPowerbaseClient: true },
  { name: 'JP모간증권', code: 'JPMORGAN', websiteUrl: 'https://www.jpmorgan.com/KR/ko/about-us', newsroomUrl: 'https://www.jpmorgan.com/KR/ko/about-us', isPowerbaseClient: true },
  { name: '골드만삭스증권', code: 'GOLDMANSACHS', websiteUrl: 'https://www.goldmansachs.com', newsroomUrl: 'https://www.goldmansachs.com', isPowerbaseClient: true },
  { name: '메릴린치증권', code: 'MERRILLLYNCH', websiteUrl: 'https://www.ml.com', newsroomUrl: 'https://www.ml.com', isPowerbaseClient: true },
  { name: '모간스탠리증권', code: 'MORGANSTANLEY', websiteUrl: 'https://www.morganstanley.com', newsroomUrl: 'https://www.morganstanley.com', isPowerbaseClient: true },
  { name: '씨티그룹글로벌마켓증권', code: 'CITIGROUP', websiteUrl: 'https://www.citigroup.com', newsroomUrl: 'https://www.citigroup.com', isPowerbaseClient: true },
  { name: 'SG증권', code: 'SG', websiteUrl: 'https://www.sgcib.com', newsroomUrl: 'https://www.sgcib.com', isPowerbaseClient: true },
  { name: 'BNP파리바증권', code: 'BNPPARIBAS', websiteUrl: 'https://www.bnpparibas.com', newsroomUrl: 'https://www.bnpparibas.com', isPowerbaseClient: true },
  { name: '한국IMC증권', code: 'IMC', websiteUrl: 'https://www.imc.com', newsroomUrl: 'https://www.imc.com', isPowerbaseClient: true },
  { name: 'UBS증권', code: 'UBS', websiteUrl: 'https://www.ubs.com', newsroomUrl: 'https://www.ubs.com', isPowerbaseClient: true },
  { name: '스탠다드차타드증권', code: 'STANDARDCHARTERED', websiteUrl: 'https://www.sc.com', newsroomUrl: 'https://www.sc.com', isPowerbaseClient: true },
  { name: 'CLSA코리아증권', code: 'CLSA', websiteUrl: 'https://www.clsa.com', newsroomUrl: 'https://www.clsa.com', isPowerbaseClient: true },
  { name: '다이와증권', code: 'DAIWA', websiteUrl: 'https://www.daiwa.co.jp', newsroomUrl: 'https://www.daiwa.co.jp', isPowerbaseClient: true },
  { name: '노무라금융투자', code: 'NOMURA', websiteUrl: 'https://www.nomura.com', newsroomUrl: 'https://www.nomura.com', isPowerbaseClient: true },
  { name: '도이치증권', code: 'DEUTSCHE', websiteUrl: 'https://www.db.com', newsroomUrl: 'https://www.db.com', isPowerbaseClient: true },
  { name: '맥쿼리증권', code: 'MACQUARIE', websiteUrl: 'https://www.macquarie.com', newsroomUrl: 'https://www.macquarie.com', isPowerbaseClient: true },
  { name: 'HSBC증권', code: 'HSBC', websiteUrl: 'https://www.hsbc.com', newsroomUrl: 'https://www.hsbc.com', isPowerbaseClient: true },
  { name: 'CGS인터내셔널증권', code: 'CGS', websiteUrl: 'https://www.cgsi.com', newsroomUrl: 'https://www.cgsi.com', isPowerbaseClient: true },
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
      update: { isPowerbaseClient: company.isPowerbaseClient },
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
