import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Securities Intelligence Hub API',
        version: '1.0.0',
        description: `
KOSCOM 금융영업부를 위한 AI 기반 금융 인텔리전스 플랫폼 API

## 인증
대부분의 API는 NextAuth.js 세션 기반 인증이 필요합니다.
로그인 후 세션 쿠키가 자동으로 전송됩니다.

## 응답 형식
모든 API는 다음 형식으로 응답합니다:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
\`\`\`

오류 시:
\`\`\`json
{
  "success": false,
  "error": "오류 메시지",
  "code": "ERROR_CODE"
}
\`\`\`
        `,
        contact: {
          name: 'KOSCOM 금융영업부',
          email: 'support@koscom.co.kr',
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          description: 'API Server',
        },
      ],
      tags: [
        { name: 'Auth', description: '인증 관련 API' },
        { name: 'News', description: '뉴스 조회 API' },
        { name: 'Companies', description: '증권사 정보 API' },
        { name: 'Contracts', description: '계약 현황 API' },
        { name: 'Personnel', description: '인사 정보 API' },
        { name: 'Reports', description: '리포트 API' },
        { name: 'Admin', description: '관리자 API' },
        { name: 'Search', description: '검색 API' },
      ],
      paths: {
        // Auth APIs
        '/api/auth/login': {
          post: {
            tags: ['Auth'],
            summary: '로그인',
            description: '이메일/비밀번호로 로그인합니다.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'user@koscom.co.kr' },
                      password: { type: 'string', example: 'password123!' },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: '로그인 성공',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/AuthResponse',
                    },
                  },
                },
              },
              401: { description: '인증 실패' },
            },
          },
        },
        '/api/auth/register': {
          post: {
            tags: ['Auth'],
            summary: '회원가입',
            description: '새 사용자 계정을 생성합니다. 관리자 승인 후 사용 가능합니다.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RegisterRequest',
                  },
                },
              },
            },
            responses: {
              201: { description: '가입 성공 (승인 대기)' },
              400: { description: '유효성 검사 실패' },
              409: { description: '이메일 중복' },
            },
          },
        },

        // News APIs
        '/api/news': {
          get: {
            tags: ['News'],
            summary: '뉴스 목록 조회',
            description: '필터링된 뉴스 목록을 조회합니다.',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
              { name: 'companyId', in: 'query', schema: { type: 'string' }, description: '증권사 ID 필터' },
              { name: 'category', in: 'query', schema: { type: 'string', enum: ['GENERAL', 'PERSONNEL', 'BUSINESS', 'PRODUCT', 'IR', 'EVENT'] } },
              { name: 'search', in: 'query', schema: { type: 'string' }, description: '검색어' },
              { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            ],
            responses: {
              200: {
                description: '뉴스 목록',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/NewsListResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/api/news/{id}': {
          get: {
            tags: ['News'],
            summary: '뉴스 상세 조회',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            ],
            responses: {
              200: { description: '뉴스 상세 정보' },
              404: { description: '뉴스를 찾을 수 없음' },
            },
          },
        },

        // Companies APIs
        '/api/companies': {
          get: {
            tags: ['Companies'],
            summary: '증권사 목록 조회',
            parameters: [
              { name: 'isPowerbase', in: 'query', schema: { type: 'boolean' }, description: 'PowerBase 고객사만' },
            ],
            responses: {
              200: {
                description: '증권사 목록',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/CompanyListResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/api/companies/{id}': {
          get: {
            tags: ['Companies'],
            summary: '증권사 상세 조회',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            ],
            responses: {
              200: { description: '증권사 상세 정보' },
              404: { description: '증권사를 찾을 수 없음' },
            },
          },
        },

        // Contracts APIs
        '/api/contracts': {
          get: {
            tags: ['Contracts'],
            summary: '계약 목록 조회',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
              { name: 'category', in: 'query', schema: { type: 'string', enum: ['DOMESTIC', 'FOREIGN', 'MIGRATED'] } },
            ],
            responses: {
              200: { description: '계약 목록' },
            },
          },
        },
        '/api/contracts/stats': {
          get: {
            tags: ['Contracts'],
            summary: '계약 통계 조회',
            description: '매출, 고객 분류별 통계를 조회합니다.',
            responses: {
              200: {
                description: '계약 통계',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ContractStatsResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/api/contracts/services': {
          get: {
            tags: ['Contracts'],
            summary: '서비스별 계약 통계',
            responses: {
              200: { description: '서비스별 통계' },
            },
          },
        },
        '/api/contracts/insights': {
          get: {
            tags: ['Contracts'],
            summary: '영업 인사이트 조회',
            description: 'AI 기반 영업 기회 및 리스크 분석',
            responses: {
              200: { description: '인사이트 데이터' },
            },
          },
        },

        // Personnel APIs
        '/api/personnel': {
          get: {
            tags: ['Personnel'],
            summary: '인사 뉴스 조회',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
              { name: 'companyId', in: 'query', schema: { type: 'string' } },
            ],
            responses: {
              200: { description: '인사 뉴스 목록' },
            },
          },
        },
        '/api/personnel/changes': {
          get: {
            tags: ['Personnel'],
            summary: '인사 변동 이력 조회',
            responses: {
              200: { description: '인사 변동 목록' },
            },
          },
        },

        // Reports APIs
        '/api/reports': {
          get: {
            tags: ['Reports'],
            summary: '주간 리포트 목록',
            responses: {
              200: { description: '리포트 목록' },
            },
          },
        },
        '/api/reports/export/weekly': {
          get: {
            tags: ['Reports'],
            summary: '주간 리포트 PDF 내보내기',
            parameters: [
              { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            ],
            responses: {
              200: {
                description: 'PDF 파일',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
        },

        // Search API
        '/api/search': {
          get: {
            tags: ['Search'],
            summary: '통합 검색',
            parameters: [
              { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: '검색어' },
              { name: 'type', in: 'query', schema: { type: 'string', enum: ['news', 'company', 'all'] } },
            ],
            responses: {
              200: { description: '검색 결과' },
            },
          },
        },

        // Admin APIs
        '/api/admin/users': {
          get: {
            tags: ['Admin'],
            summary: '사용자 목록 (관리자)',
            parameters: [
              { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] } },
            ],
            responses: {
              200: { description: '사용자 목록' },
              403: { description: '권한 없음' },
            },
          },
          patch: {
            tags: ['Admin'],
            summary: '사용자 상태 변경 (관리자)',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['userId', 'action'],
                    properties: {
                      userId: { type: 'string' },
                      action: { type: 'string', enum: ['approve', 'reject', 'suspend', 'reactivate', 'resetPassword'] },
                      rejectReason: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              200: { description: '처리 성공' },
              403: { description: '권한 없음' },
            },
          },
        },

        // Crawl API
        '/api/crawl': {
          post: {
            tags: ['Admin'],
            summary: '뉴스 크롤링 실행 (시스템)',
            description: 'Vercel Cron 또는 관리자가 수동으로 크롤링을 실행합니다.',
            security: [{ bearerAuth: [] }],
            responses: {
              200: { description: '크롤링 완료' },
              401: { description: '인증 실패' },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'CRON_SECRET 토큰',
          },
        },
        schemas: {
          AuthResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          RegisterRequest: {
            type: 'object',
            required: ['email', 'password', 'name'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
              name: { type: 'string', minLength: 2 },
              department: { type: 'string' },
              position: { type: 'string' },
              employeeId: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
              status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] },
              department: { type: 'string' },
              position: { type: 'string' },
            },
          },
          NewsListResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/News' },
                  },
                },
              },
              meta: { $ref: '#/components/schemas/PaginationMeta' },
            },
          },
          News: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string' },
              url: { type: 'string', format: 'uri' },
              category: { type: 'string' },
              publishedAt: { type: 'string', format: 'date-time' },
              company: { $ref: '#/components/schemas/CompanySummary' },
            },
          },
          CompanyListResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Company' },
              },
            },
          },
          Company: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              nameEn: { type: 'string' },
              code: { type: 'string' },
              isPowerbaseClient: { type: 'boolean' },
              category: { type: 'string' },
            },
          },
          CompanySummary: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          ContractStatsResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  totalStats: {
                    type: 'object',
                    properties: {
                      totalContracts: { type: 'integer' },
                      totalPowerbaseRevenue: { type: 'number' },
                      totalYear2025Revenue: { type: 'number' },
                    },
                  },
                  revenueByCategory: { type: 'array', items: { type: 'object' } },
                  revenueByCustomerType: { type: 'array', items: { type: 'object' } },
                  revenueTop20: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
          PaginationMeta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
  });
  return spec;
};
