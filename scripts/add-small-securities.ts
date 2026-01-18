import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 추가할 소형 증권사 목록
const additionalCompanies = [
  { name: 'BNK투자증권', code: 'BNK', websiteUrl: 'https://www.bnkfn.co.kr', newsroomUrl: 'https://www.bnkfn.co.kr/company/news' },
  { name: 'DS투자증권', code: 'DS', websiteUrl: 'https://www.dssec.co.kr', newsroomUrl: 'https://www.dssec.co.kr' },
  { name: 'iM증권', code: 'IM', websiteUrl: 'https://www.imsec.co.kr', newsroomUrl: 'https://www.imsec.co.kr' },
  { name: 'KR투자증권', code: 'KR', websiteUrl: 'https://www.krsec.co.kr', newsroomUrl: 'https://www.krsec.co.kr' },
  { name: 'LS증권', code: 'LS', websiteUrl: 'https://www.ls-sec.co.kr', newsroomUrl: 'https://www.ls-sec.co.kr' },
  { name: '다올투자증권', code: 'DAOL', websiteUrl: 'https://www.daolsecurities.com', newsroomUrl: 'https://www.daolsecurities.com' },
  { name: '리딩투자증권', code: 'LEADING', websiteUrl: 'https://www.leading.co.kr', newsroomUrl: 'https://www.leading.co.kr' },
  { name: '상상인증권', code: 'SANGSANGIN', websiteUrl: 'https://www.sangsanginib.com', newsroomUrl: 'https://www.sangsanginib.com' },
  { name: '유화증권', code: 'YUHWA', websiteUrl: 'https://www.yhs.co.kr', newsroomUrl: 'https://www.yhs.co.kr' },
  { name: '한양증권', code: 'HANYANG', websiteUrl: 'https://www.hygood.co.kr', newsroomUrl: 'https://www.hygood.co.kr' },
  { name: '코리아에셋투자증권', code: 'KOREAASSET', websiteUrl: 'https://www.koreaasset.co.kr', newsroomUrl: 'https://www.koreaasset.co.kr' },
  { name: '흥국증권', code: 'HEUNGKUK', websiteUrl: 'https://www.heungkuksec.co.kr', newsroomUrl: 'https://www.heungkuksec.co.kr' },
  { name: '나무증권', code: 'NAMU', websiteUrl: 'https://www.namuh.com', newsroomUrl: 'https://www.namuh.com' },
  { name: '넥스트증권', code: 'NEXT', websiteUrl: 'https://www.nextsec.co.kr', newsroomUrl: 'https://www.nextsec.co.kr' },
  { name: '신한금융투자', code: 'SHINHANGOLD', websiteUrl: 'https://www.shinhaninvest.com', newsroomUrl: 'https://www.shinhaninvest.com' },
  { name: '하나금융투자', code: 'HANAGOLD', websiteUrl: 'https://www.hanaw.com', newsroomUrl: 'https://www.hanaw.com' },
  { name: '한국포스증권', code: 'KOREAFOS', websiteUrl: 'https://www.fosstock.co.kr', newsroomUrl: 'https://www.fosstock.co.kr' },
  { name: '비엔케이자산운용', code: 'BNKASSET', websiteUrl: 'https://www.bnkasset.co.kr', newsroomUrl: 'https://www.bnkasset.co.kr' },
];

async function main() {
  console.log('🏢 소형 증권사 추가 시작...\n');

  let addedCount = 0;
  let skippedCount = 0;

  for (const company of additionalCompanies) {
    // 이미 존재하는지 확인 (이름 또는 코드로)
    const existing = await prisma.securitiesCompany.findFirst({
      where: {
        OR: [
          { name: company.name },
          { code: company.code },
        ],
      },
    });

    if (existing) {
      console.log(`⏭️  이미 존재: ${company.name}`);
      skippedCount++;
      continue;
    }

    await prisma.securitiesCompany.create({
      data: company,
    });
    console.log(`✅ 추가됨: ${company.name}`);
    addedCount++;
  }

  console.log(`\n📊 결과: ${addedCount}개 추가, ${skippedCount}개 스킵`);

  // 전체 증권사 수 확인
  const totalCount = await prisma.securitiesCompany.count();
  console.log(`📈 총 증권사 수: ${totalCount}개`);
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
