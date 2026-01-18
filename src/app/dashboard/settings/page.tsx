'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Save, LogOut, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

interface Company {
  id: string;
  name: string;
  code: string;
}

async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch('/api/companies');
  if (!res.ok) throw new Error('Failed to fetch companies');
  const data = await res.json();
  return data.data;
}

async function saveAssignedCompanies(userId: string, companyIds: string[]): Promise<void> {
  const res = await fetch('/api/auth/companies', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, companyIds }),
  });
  if (!res.ok) throw new Error('Failed to save companies');
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoggedIn, updateAssignedCompanies, logout } = useAuthStore();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });

  const mutation = useMutation({
    mutationFn: () => saveAssignedCompanies(user!.id, selectedCompanyIds),
    onSuccess: () => {
      updateAssignedCompanies(selectedCompanyIds);
      router.push('/dashboard');
    },
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (user?.assignedCompanyIds) {
      setSelectedCompanyIds(user.assignedCompanyIds);
    }
  }, [user]);

  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const selectAll = () => {
    if (companies) {
      setSelectedCompanyIds(companies.map((c) => c.id));
    }
  };

  const deselectAll = () => {
    setSelectedCompanyIds([]);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* User Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>내 정보</CardTitle>
          <CardDescription>로그인된 영업대표 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>담당 증권사 설정</CardTitle>
              <CardDescription>
                담당하는 증권사를 선택하면 해당 증권사의 뉴스만 필터링됩니다.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                전체 선택
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                전체 해제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">로딩 중...</div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {selectedCompanyIds.length}개 증권사 선택됨
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {companies?.map((company) => {
                  const isSelected = selectedCompanyIds.includes(company.id);
                  return (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                          isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate text-sm font-medium">{company.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  취소
                </Button>
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {mutation.isPending ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
