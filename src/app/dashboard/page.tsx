'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { NewsList } from '@/components/features/news/news-list';
import { MobileFilter } from '@/components/features/news/mobile-filter';
import { UpdateStatus } from '@/components/features/news/update-status';

export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Update Status Bar */}
          <div className="mb-4">
            <UpdateStatus />
          </div>

          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">최근 뉴스</h1>
              <p className="mt-1 text-sm text-gray-500">
                PowerBase 회원 증권사의 최신 동향을 확인하세요
              </p>
            </div>
            {/* Mobile Filter Button */}
            <MobileFilter />
          </div>

          {/* News List */}
          <NewsList />
        </div>
      </div>
    </div>
  );
}
