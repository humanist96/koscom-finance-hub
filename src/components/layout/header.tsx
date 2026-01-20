'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, Building2, X, Settings, User, LogOut, FileText, BarChart3, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearch } from '@/hooks/use-search';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { AlertBell } from '@/components/features/alerts';

export function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, isLoggedIn, logout } = useAuthStore();

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading } = useSearch(
    debouncedQuery.length >= 2 ? { query: debouncedQuery } : null
  );

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-bold leading-tight text-gray-900">KOSCOM</span>
            <span className="text-xs leading-tight text-blue-600">금융영업부 Hub</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            뉴스
          </Link>
          <Link
            href="/dashboard/personnel"
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            인사정보
          </Link>
          <Link
            href="/dashboard/companies"
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            증권사
          </Link>
          <Link
            href="/dashboard/contracts"
            className="flex items-center gap-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700"
          >
            <BarChart3 className="h-4 w-4" />
            계약현황
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <FileText className="h-4 w-4" />
            주간리포트
          </Link>
        </nav>

        {/* Search & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="검색어 입력..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Search Results Dropdown */}
                {debouncedQuery.length >= 2 && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-md border bg-white shadow-lg">
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        검색 중...
                      </div>
                    ) : searchResults?.data ? (
                      <div className="max-h-96 overflow-auto">
                        {searchResults.data.news && searchResults.data.news.length > 0 && (
                          <div className="p-2">
                            <div className="px-2 py-1 text-xs font-medium text-gray-500">
                              뉴스
                            </div>
                            {searchResults.data.news.slice(0, 5).map(news => (
                              <Link
                                key={news.id}
                                href={`/news/${news.id}`}
                                className="block rounded px-2 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery('');
                                }}
                              >
                                <div className="font-medium line-clamp-1">{news.title}</div>
                                <div className="text-xs text-gray-500">
                                  {news.company.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.data.companies &&
                          searchResults.data.companies.length > 0 && (
                            <div className="border-t p-2">
                              <div className="px-2 py-1 text-xs font-medium text-gray-500">
                                증권사
                              </div>
                              {searchResults.data.companies.map(company => (
                                <Link
                                  key={company.id}
                                  href={`/companies/${company.id}`}
                                  className="block rounded px-2 py-2 text-sm hover:bg-gray-100"
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery('');
                                  }}
                                >
                                  {company.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        {(!searchResults.data.news?.length &&
                          !searchResults.data.companies?.length) && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Alert Bell */}
          <AlertBell />

          {/* User Menu */}
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-3 text-sm transition-colors hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-medium text-white">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden font-medium sm:inline">{user.name}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg">
                    <div className="border-b px-4 py-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="mt-1 text-xs text-blue-600">
                        담당 {user.assignedCompanyIds?.length || 0}개 증권사
                      </p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      담당 증권사 설정
                    </Link>
                    <Link
                      href="/dashboard/settings/alerts"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      알림 설정
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <User className="mr-1 h-4 w-4" />
                로그인
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              {isLoggedIn && user && (
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-medium text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        담당 {user.assignedCompanyIds?.length || 0}개 증권사
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <nav className="flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  뉴스
                </Link>
                <Link
                  href="/dashboard/personnel"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  인사정보
                </Link>
                <Link
                  href="/dashboard/companies"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  증권사
                </Link>
                <Link
                  href="/dashboard/contracts"
                  className="flex items-center gap-2 text-lg font-medium text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-5 w-5" />
                  계약현황
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-2 text-lg font-medium text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  주간리포트
                </Link>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard/settings"
                      className="text-lg font-medium text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      담당 증권사 설정
                    </Link>
                    <button
                      className="text-left text-lg font-medium text-red-600"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-lg font-medium text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
