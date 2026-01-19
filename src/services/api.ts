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

export default api;
