'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Plus,
  Trash2,
  Building2,
  Tag,
  RefreshCw,
  ArrowLeft,
  Newspaper,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { useCompanies } from '@/hooks/use-companies';
import {
  useAlertSettings,
  useAddKeywordAlert,
  useDeleteKeywordAlert,
  useAddCompanyAlert,
  useUpdateCompanyAlert,
  useDeleteCompanyAlert,
} from '@/hooks/use-alerts';

export default function AlertSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const user = session?.user;

  const { data: settingsData, isLoading } = useAlertSettings(isLoggedIn ? user?.id ?? null : null);
  const { data: companiesData } = useCompanies({ withStats: false });

  const addKeywordAlert = useAddKeywordAlert();
  const deleteKeywordAlert = useDeleteKeywordAlert();
  const addCompanyAlert = useAddCompanyAlert();
  const updateCompanyAlert = useUpdateCompanyAlert();
  const deleteCompanyAlert = useDeleteCompanyAlert();

  const keywordAlerts = settingsData?.data?.keywordAlerts ?? [];
  const companyAlerts = settingsData?.data?.companyAlerts ?? [];
  const companies = companiesData?.data ?? [];

  // 이미 알림이 설정된 회사 ID 목록
  const alertedCompanyIds = new Set(companyAlerts.map(a => a.companyId));
  const availableCompanies = companies.filter(c => !alertedCompanyIds.has(c.id));

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newKeyword.trim()) return;

    try {
      await addKeywordAlert.mutateAsync({
        userId: user.id,
        keyword: newKeyword.trim(),
      });
      setNewKeyword('');
    } catch (error) {
      console.error('키워드 알림 추가 실패:', error);
    }
  };

  const handleAddCompany = async () => {
    if (!user?.id || !selectedCompanyId) return;

    try {
      await addCompanyAlert.mutateAsync({
        userId: user.id,
        companyId: selectedCompanyId,
      });
      setSelectedCompanyId('');
    } catch (error) {
      console.error('회사 알림 추가 실패:', error);
    }
  };

  const handleToggleCompanyAlert = async (
    alertId: string,
    field: 'alertOnNews' | 'alertOnPersonnel',
    currentValue: boolean
  ) => {
    try {
      await updateCompanyAlert.mutateAsync({
        id: alertId,
        [field]: !currentValue,
      });
    } catch (error) {
      console.error('알림 설정 변경 실패:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Bell className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500 mb-4">알림 설정을 관리하려면 로그인해주세요.</p>
        <Button onClick={() => router.push('/login')}>로그인</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            알림 설정
          </h1>
          <p className="text-gray-500 mt-1">
            관심 있는 키워드와 회사에 대한 알림을 설정하세요
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 키워드 알림 섹션 */}
          <section className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">키워드 알림</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              등록한 키워드가 뉴스 제목이나 내용에 포함되면 알림을 받습니다.
            </p>

            {/* 키워드 추가 폼 */}
            <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
              <Input
                placeholder="키워드 입력 (예: IPO, 인수합병)"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newKeyword.trim() || addKeywordAlert.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </form>

            {/* 키워드 목록 */}
            <div className="space-y-2">
              {keywordAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  등록된 키워드가 없습니다
                </p>
              ) : (
                keywordAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{alert.keyword.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKeywordAlert.mutate(alert.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 회사 알림 섹션 */}
          <section className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">회사 알림</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              선택한 회사의 뉴스와 인사이동 소식을 알림으로 받습니다.
            </p>

            {/* 회사 추가 */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">회사 선택...</option>
                {availableCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddCompany}
                disabled={!selectedCompanyId || addCompanyAlert.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>

            {/* 회사 목록 */}
            <div className="space-y-3">
              {companyAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  등록된 회사가 없습니다
                </p>
              ) : (
                companyAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{alert.company?.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* 뉴스 알림 토글 */}
                      <button
                        onClick={() =>
                          handleToggleCompanyAlert(alert.id, 'alertOnNews', alert.alertOnNews)
                        }
                        className={`flex items-center gap-1 text-sm ${
                          alert.alertOnNews ? 'text-blue-600' : 'text-gray-400'
                        }`}
                        title="뉴스 알림"
                      >
                        <Newspaper className="h-4 w-4" />
                        {alert.alertOnNews ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      {/* 인사이동 알림 토글 */}
                      <button
                        onClick={() =>
                          handleToggleCompanyAlert(
                            alert.id,
                            'alertOnPersonnel',
                            alert.alertOnPersonnel
                          )
                        }
                        className={`flex items-center gap-1 text-sm ${
                          alert.alertOnPersonnel ? 'text-purple-600' : 'text-gray-400'
                        }`}
                        title="인사이동 알림"
                      >
                        <Users className="h-4 w-4" />
                        {alert.alertOnPersonnel ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCompanyAlert.mutate(alert.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 도움말 */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-2">알림 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 키워드 알림: 뉴스 제목, 내용, AI 요약에서 키워드가 감지되면 알림</li>
              <li>• 회사 알림: 선택한 회사의 새 뉴스나 인사이동 발생 시 알림</li>
              <li>• 알림은 헤더의 벨 아이콘에서 확인할 수 있습니다</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
