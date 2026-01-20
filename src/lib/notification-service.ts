import { prisma } from '@/lib/prisma';
import type { CreateNotificationInput, NotificationType, LinkType } from '@/types/alerts';

interface NewsData {
  id: string;
  title: string;
  companyId: string;
  company: {
    name: string;
  };
  content?: string | null;
  summary?: string | null;
}

interface PersonnelData {
  id: string;
  personName: string;
  position?: string | null;
  changeType: string;
  companyId: string;
  company: {
    name: string;
  };
}

// 인사이동 유형 라벨
const CHANGE_TYPE_LABELS: Record<string, string> = {
  APPOINTMENT: '선임',
  PROMOTION: '승진',
  TRANSFER: '전보',
  RESIGNATION: '사임',
  RETIREMENT: '퇴임',
};

export class NotificationService {
  /**
   * 알림 생성
   */
  async createNotification(input: CreateNotificationInput): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          linkType: input.linkType || null,
          linkId: input.linkId || null,
        },
      });
    } catch (error) {
      console.error('알림 생성 실패:', error);
    }
  }

  /**
   * 뉴스 관련 알림 처리
   * - 키워드 매칭 알림
   * - 관심 회사 뉴스 알림
   */
  async processNewsNotifications(news: NewsData): Promise<void> {
    try {
      // 1. 키워드 알림 체크
      await this.processKeywordAlerts(news);

      // 2. 회사 알림 체크
      await this.processCompanyNewsAlerts(news);
    } catch (error) {
      console.error('뉴스 알림 처리 실패:', error);
    }
  }

  /**
   * 키워드 매칭 알림 처리
   */
  private async processKeywordAlerts(news: NewsData): Promise<void> {
    // 모든 활성 키워드 알림 조회
    const keywordAlerts = await prisma.keywordAlert.findMany({
      where: { isActive: true },
      include: { keyword: true },
    });

    const searchText = `${news.title} ${news.content || ''} ${news.summary || ''}`.toLowerCase();

    for (const alert of keywordAlerts) {
      const keyword = alert.keyword.name.toLowerCase();

      if (searchText.includes(keyword)) {
        await this.createNotification({
          userId: alert.userId,
          type: 'KEYWORD_MATCH',
          title: `키워드 "${alert.keyword.name}" 매칭`,
          message: `[${news.company.name}] ${news.title}`,
          linkType: 'NEWS',
          linkId: news.id,
        });
      }
    }
  }

  /**
   * 회사 뉴스 알림 처리
   */
  private async processCompanyNewsAlerts(news: NewsData): Promise<void> {
    const companyAlerts = await prisma.companyAlert.findMany({
      where: {
        companyId: news.companyId,
        isActive: true,
        alertOnNews: true,
      },
    });

    for (const alert of companyAlerts) {
      await this.createNotification({
        userId: alert.userId,
        type: 'COMPANY_NEWS',
        title: `${news.company.name} 새 뉴스`,
        message: news.title,
        linkType: 'NEWS',
        linkId: news.id,
      });
    }
  }

  /**
   * 인사이동 알림 처리
   */
  async processPersonnelNotifications(personnel: PersonnelData): Promise<void> {
    try {
      const companyAlerts = await prisma.companyAlert.findMany({
        where: {
          companyId: personnel.companyId,
          isActive: true,
          alertOnPersonnel: true,
        },
      });

      const changeTypeLabel = CHANGE_TYPE_LABELS[personnel.changeType] || personnel.changeType;
      const positionText = personnel.position ? ` ${personnel.position}` : '';

      for (const alert of companyAlerts) {
        await this.createNotification({
          userId: alert.userId,
          type: 'PERSONNEL_CHANGE',
          title: `${personnel.company.name} 인사이동`,
          message: `${personnel.personName}${positionText} ${changeTypeLabel}`,
          linkType: 'PERSONNEL',
          linkId: personnel.id,
        });
      }
    } catch (error) {
      console.error('인사이동 알림 처리 실패:', error);
    }
  }

  /**
   * 주간 리포트 발행 알림
   */
  async processWeeklyReportNotification(reportId: string, weekRange: string): Promise<void> {
    try {
      // 모든 사용자에게 알림 (또는 특정 조건의 사용자만)
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      for (const user of users) {
        await this.createNotification({
          userId: user.id,
          type: 'WEEKLY_REPORT',
          title: '주간 리포트 발행',
          message: `${weekRange} 주간 증권사 동향 리포트가 발행되었습니다.`,
          linkType: 'REPORT',
          linkId: reportId,
        });
      }
    } catch (error) {
      console.error('주간 리포트 알림 처리 실패:', error);
    }
  }

  /**
   * 시스템 알림 발송
   */
  async sendSystemNotification(
    userId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'SYSTEM',
      title,
      message,
    });
  }

  /**
   * 여러 사용자에게 시스템 알림 발송
   */
  async broadcastSystemNotification(
    userIds: string[],
    title: string,
    message: string
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendSystemNotification(userId, title, message);
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationService = new NotificationService();
