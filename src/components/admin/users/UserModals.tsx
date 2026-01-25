'use client';

import { useState } from 'react';
import { Check, KeyRound, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RejectModalProps {
  userId: string | null;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => void;
  isLoading: boolean;
}

export function RejectModal({ userId, onClose, onConfirm, isLoading }: RejectModalProps) {
  const [rejectReason, setRejectReason] = useState('');

  if (!userId) return null;

  const handleConfirm = () => {
    onConfirm(userId, rejectReason);
    setRejectReason('');
  };

  const handleClose = () => {
    setRejectReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">가입 거절</h3>
        <p className="text-sm text-gray-500 mb-4">
          거절 사유를 입력해주세요. (선택사항)
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="거절 사유 입력..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            거절하기
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ResetPasswordConfirmModalProps {
  userId: string | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  isLoading: boolean;
}

export function ResetPasswordConfirmModal({
  userId,
  onClose,
  onConfirm,
  isLoading,
}: ResetPasswordConfirmModalProps) {
  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 초기화</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>주의:</strong> 비밀번호를 초기화하면 임시 비밀번호가 생성됩니다.
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          선택한 사용자의 비밀번호를 초기화하시겠습니까?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => onConfirm(userId)}
            disabled={isLoading}
          >
            <KeyRound className="h-4 w-4 mr-1" />
            {isLoading ? '처리중...' : '초기화'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface PasswordResetResult {
  temporaryPassword: string;
  userEmail: string;
  userName: string;
  emailSent: boolean;
}

interface ResetPasswordResultModalProps {
  result: PasswordResetResult | null;
  onClose: () => void;
}

export function ResetPasswordResultModal({ result, onClose }: ResetPasswordResultModalProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">비밀번호 초기화 완료</h3>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">대상 사용자</p>
            <p className="font-medium">{result.userName}</p>
            <p className="text-sm text-gray-600">{result.userEmail}</p>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-xs text-purple-600 mb-2 font-medium">임시 비밀번호</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xl font-bold text-purple-700 tracking-wider font-mono">
                {result.temporaryPassword}
              </code>
              <Button
                size="sm"
                variant="outline"
                className={copied ? 'text-green-600 border-green-300' : 'text-purple-600 border-purple-300'}
                onClick={() => copyToClipboard(result.temporaryPassword)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {result.emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                임시 비밀번호가 이메일로 발송되었습니다.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                이메일 발송에 실패했습니다. 위의 임시 비밀번호를 직접 전달해주세요.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
