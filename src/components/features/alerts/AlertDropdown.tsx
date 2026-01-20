'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Newspaper,
  Users,
  Building2,
  FileText,
  Info,
  Settings,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts, useMarkAsRead, useMarkAllAsRead, useDeleteAlert } from '@/hooks/use-alerts';

interface AlertDropdownProps {
  onClose: () => void;
  userId: string;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  KEYWORD_MATCH: <Newspaper className="h-4 w-4 text-blue-500" />,
  COMPANY_NEWS: <Building2 className="h-4 w-4 text-green-500" />,
  PERSONNEL_CHANGE: <Users className="h-4 w-4 text-purple-500" />,
  WEEKLY_REPORT: <FileText className="h-4 w-4 text-orange-500" />,
  SYSTEM: <Info className="h-4 w-4 text-gray-500" />,
};

const LINK_PATHS: Record<string, string> = {
  NEWS: '/dashboard',
  PERSONNEL: '/dashboard/personnel',
  COMPANY: '/dashboard/companies',
  REPORT: '/dashboard/reports',
};

export function AlertDropdown({ onClose, userId }: AlertDropdownProps) {
  const [page] = useState(1);

  const { data, isLoading, refetch } = useAlerts({
    userId,
    page,
    limit: 10,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteAlert = useDeleteAlert();

  const notifications = data?.data?.notifications ?? [];
  const hasNotifications = notifications.length > 0;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync(userId);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteAlert.mutateAsync(id);
  };

  const getNotificationLink = (linkType: string | null, linkId: string | null) => {
    if (!linkType) return null;
    const basePath = LINK_PATHS[linkType];
    if (!basePath) return null;
    return linkId ? `${basePath}?highlight=${linkId}` : basePath;
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-white shadow-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">알림</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
            title="새로고침"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {hasNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 px-2 text-xs"
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              모두 읽음
            </Button>
          )}
          <Link href="/dashboard/settings/alerts" onClick={onClose}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="알림 설정">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 알림 목록 */}
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : hasNotifications ? (
          <div className="divide-y">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification.linkType, notification.linkId);
              const content = (
                <div
                  className={`group relative flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 pt-0.5">
                    {NOTIFICATION_ICONS[notification.type] || (
                      <Bell className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        title="읽음 처리"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 읽지 않음 표시 */}
                  {!notification.isRead && (
                    <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
                  )}
                </div>
              );

              return link ? (
                <Link
                  key={notification.id}
                  href={link}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead.mutate(notification.id);
                    }
                    onClose();
                  }}
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BellOff className="h-12 w-12 mb-3" />
            <p className="text-sm">알림이 없습니다</p>
            <p className="mt-1 text-xs">새로운 소식이 있으면 알려드릴게요</p>
          </div>
        )}
      </ScrollArea>

      {/* 푸터 */}
      {hasNotifications && (
        <div className="border-t px-4 py-2">
          <Link
            href="/dashboard/settings/alerts"
            className="block text-center text-sm text-blue-600 hover:underline"
            onClick={onClose}
          >
            알림 설정 관리
          </Link>
        </div>
      )}
    </div>
  );
}
