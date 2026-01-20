// 알림 타입 정의

export type NotificationType =
  | 'KEYWORD_MATCH'      // 키워드 매칭
  | 'COMPANY_NEWS'       // 관심 회사 뉴스
  | 'PERSONNEL_CHANGE'   // 인사이동
  | 'WEEKLY_REPORT'      // 주간 리포트 발행
  | 'SYSTEM';            // 시스템 알림

export type LinkType = 'NEWS' | 'PERSONNEL' | 'COMPANY' | 'REPORT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkType?: LinkType | null;
  linkId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CompanyAlert {
  id: string;
  userId: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  alertOnNews: boolean;
  alertOnPersonnel: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface KeywordAlertWithKeyword {
  id: string;
  userId: string;
  keywordId: string;
  keyword: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface AlertSettings {
  keywordAlerts: KeywordAlertWithKeyword[];
  companyAlerts: CompanyAlert[];
}

// API 요청/응답 타입
export interface CreateKeywordAlertRequest {
  keyword: string;
}

export interface CreateCompanyAlertRequest {
  companyId: string;
  alertOnNews?: boolean;
  alertOnPersonnel?: boolean;
}

export interface UpdateCompanyAlertRequest {
  alertOnNews?: boolean;
  alertOnPersonnel?: boolean;
  isActive?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

// 알림 생성 요청 (내부 서비스용)
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkType?: LinkType;
  linkId?: string;
}
