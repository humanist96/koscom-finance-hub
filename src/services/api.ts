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
