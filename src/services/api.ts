import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  GetNewsParams,
  GetCompaniesParams,
  GetPersonnelParams,
  SearchParams,
} from '@/types/api';
import type { NewsListItem, PersonnelChangeWithCompany } from '@/types/news';
import type { SecuritiesCompany, SecuritiesCompanyWithStats } from '@/types/company';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 에러 인터셉터
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ====== 증권사 API ======
export const companiesApi = {
  // 증권사 목록 조회
  getAll: async (params?: GetCompaniesParams) => {
    const { data } = await api.get<ApiResponse<SecuritiesCompanyWithStats[]>>('/companies', {
      params,
    });
    return data;
  },

  // 증권사 상세 조회
  getById: async (id: string) => {
    const { data } = await api.get<
      ApiResponse<
        SecuritiesCompany & {
          news: NewsListItem[];
          personnel: PersonnelChangeWithCompany[];
          _count: { news: number; personnel: number };
        }
      >
    >(`/companies/${id}`);
    return data;
  },
};

// ====== 뉴스 API ======
export const newsApi = {
  // 뉴스 목록 조회
  getAll: async (params?: GetNewsParams) => {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.companyIds?.length) queryParams.companyIds = params.companyIds.join(',');
    if (params?.categories?.length) queryParams.categories = params.categories.join(',');
    if (params?.isPersonnel !== undefined) queryParams.isPersonnel = String(params.isPersonnel);
    if (params?.isPowerbaseOnly !== undefined) queryParams.isPowerbaseOnly = String(params.isPowerbaseOnly);
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.startDate) queryParams.dateRange = params.startDate;

    const { data } = await api.get<ApiResponse<PaginatedResponse<NewsListItem>>>('/news', {
      params: queryParams,
    });
    return data;
  },

  // 뉴스 상세 조회
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<NewsListItem>>(`/news/${id}`);
    return data;
  },
};

// ====== 인사 정보 API ======
export const personnelApi = {
  // 인사 정보 목록 조회
  getAll: async (params?: GetPersonnelParams) => {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.companyIds?.length) queryParams.companyIds = params.companyIds.join(',');
    if (params?.changeTypes?.length) queryParams.changeTypes = params.changeTypes.join(',');
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.startDate) queryParams.dateRange = params.startDate;

    const { data } = await api.get<ApiResponse<PaginatedResponse<PersonnelChangeWithCompany>>>(
      '/personnel',
      { params: queryParams }
    );
    return data;
  },
};

// ====== 검색 API ======
export const searchApi = {
  search: async (params: SearchParams) => {
    const { data } = await api.get<
      ApiResponse<{
        news?: NewsListItem[];
        personnel?: PersonnelChangeWithCompany[];
        companies?: SecuritiesCompany[];
      }>
    >('/search', {
      params: {
        q: params.query,
        type: params.type,
        limit: params.limit,
      },
    });
    return data;
  },
};

// ====== 계약 API ======
export interface GetContractsParams {
  page?: number;
  limit?: number;
  category?: 'DOMESTIC' | 'FOREIGN' | 'MIGRATED';
  customerType?: 'SECURITIES' | 'INSTITUTION' | 'ASSET_MGMT' | 'FUTURES' | 'MEDIA';
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContractItem {
  id: string;
  companyId: string;
  orderNumber: number;
  category: string;
  customerType: string;
  progressNotes: string | null;
  currentRevenue: number | null;
  powerbaseRevenue: number | null;
  year2025Revenue: number | null;
  contractYear: number;
  company: {
    id: string;
    name: string;
    code: string | null;
  };
  services: {
    id: string;
    serviceCode: string;
    serviceName: string;
    amount: number | null;
    status: string;
  }[];
}

export interface ContractStats {
  revenueTop20: {
    companyId: string;
    companyName: string;
    powerbaseRevenue: number;
    currentRevenue: number;
    year2025Revenue: number;
    category: string;
  }[];
  revenueByCustomerType: {
    type: string;
    totalRevenue: number;
    count: number;
  }[];
  revenueByCategory: {
    category: string;
    powerbaseRevenue: number;
    year2025Revenue: number;
    count: number;
  }[];
  revenueComparison: {
    companyName: string;
    companyId: string;
    powerbaseRevenue: number;
    currentRevenue: number;
    year2025Revenue: number;
    category: string;
    customerType: string;
  }[];
  companyCountByType: {
    type: string;
    count: number;
  }[];
  totalStats: {
    totalContracts: number;
    totalPowerbaseRevenue: number;
    totalYear2025Revenue: number;
    totalCurrentRevenue: number;
  };
  year2025Top10: {
    companyId: string;
    companyName: string;
    year2025Revenue: number;
    category: string;
  }[];
}

export interface ServiceStats {
  serviceRevenueTop15: {
    serviceCode: string;
    serviceName: string;
    category: string;
    totalAmount: number;
    contractCount: number;
  }[];
  serviceSubscriberCount: {
    serviceCode: string;
    serviceName: string;
    category: string;
    subscriberCount: number;
    totalAmount: number;
  }[];
  revenueByServiceCategory: {
    category: string;
    totalAmount: number;
    serviceCount: number;
  }[];
  radarData: {
    service: string;
    serviceCode: string;
    domestic: number;
    foreign: number;
  }[];
  serviceMasterList: {
    code: string;
    name: string;
    category: string;
    description: string | null;
  }[];
  totalServiceStats: {
    totalServices: number;
    totalServiceContracts: number;
    totalServiceRevenue: number;
  };
}

// ====== 알림 API ======
export interface GetAlertsParams {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkType: string | null;
  linkId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AlertSettingsData {
  keywordAlerts: {
    id: string;
    userId: string;
    keywordId: string;
    keyword: { id: string; name: string };
    isActive: boolean;
    createdAt: string;
  }[];
  companyAlerts: {
    id: string;
    userId: string;
    companyId: string;
    company: { id: string; name: string; logoUrl: string | null };
    alertOnNews: boolean;
    alertOnPersonnel: boolean;
    isActive: boolean;
    createdAt: string;
  }[];
}

export const alertsApi = {
  // 알림 목록 조회
  getAll: async (params: GetAlertsParams) => {
    const { data } = await api.get<ApiResponse<{
      notifications: NotificationItem[];
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    }>>('/alerts', { params });
    return data;
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (userId: string) => {
    const { data } = await api.get<ApiResponse<{ count: number }>>('/alerts/unread-count', {
      params: { userId },
    });
    return data;
  },

  // 알림 읽음 처리
  markAsRead: async (id: string) => {
    const { data } = await api.patch<ApiResponse<NotificationItem>>(`/alerts/${id}/read`);
    return data;
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async (userId: string) => {
    const { data } = await api.patch<ApiResponse<{ updatedCount: number }>>('/alerts/read-all', {
      userId,
    });
    return data;
  },

  // 알림 삭제
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/alerts/${id}`);
    return data;
  },

  // 알림 설정 조회
  getSettings: async (userId: string) => {
    const { data } = await api.get<ApiResponse<AlertSettingsData>>('/alerts/settings', {
      params: { userId },
    });
    return data;
  },

  // 키워드 알림 추가
  addKeywordAlert: async (userId: string, keyword: string) => {
    const { data } = await api.post<ApiResponse<AlertSettingsData['keywordAlerts'][0]>>(
      '/alerts/settings/keywords',
      { userId, keyword }
    );
    return data;
  },

  // 키워드 알림 삭제
  deleteKeywordAlert: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/alerts/settings/keywords/${id}`);
    return data;
  },

  // 회사 알림 추가
  addCompanyAlert: async (userId: string, companyId: string, options?: {
    alertOnNews?: boolean;
    alertOnPersonnel?: boolean;
  }) => {
    const { data } = await api.post<ApiResponse<AlertSettingsData['companyAlerts'][0]>>(
      '/alerts/settings/companies',
      { userId, companyId, ...options }
    );
    return data;
  },

  // 회사 알림 수정
  updateCompanyAlert: async (id: string, options: {
    alertOnNews?: boolean;
    alertOnPersonnel?: boolean;
    isActive?: boolean;
  }) => {
    const { data } = await api.patch<ApiResponse<AlertSettingsData['companyAlerts'][0]>>(
      `/alerts/settings/companies/${id}`,
      options
    );
    return data;
  },

  // 회사 알림 삭제
  deleteCompanyAlert: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/alerts/settings/companies/${id}`);
    return data;
  },
};

export const contractsApi = {
  // 계약 목록 조회
  getAll: async (params?: GetContractsParams) => {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.category) queryParams.category = params.category;
    if (params?.customerType) queryParams.customerType = params.customerType;
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const { data } = await api.get<ApiResponse<PaginatedResponse<ContractItem>>>('/contracts', {
      params: queryParams,
    });
    return data;
  },

  // 계약 통계 조회
  getStats: async () => {
    const { data } = await api.get<ApiResponse<ContractStats>>('/contracts/stats');
    return data;
  },

  // 서비스별 통계 조회
  getServiceStats: async () => {
    const { data } = await api.get<ApiResponse<ServiceStats>>('/contracts/services');
    return data;
  },
};

export default api;
