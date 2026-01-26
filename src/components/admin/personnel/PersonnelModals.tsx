'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  personName?: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  personName,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            인사정보 삭제
          </DialogTitle>
          <DialogDescription>
            {personName ? (
              <>
                <strong>{personName}</strong>님의 인사정보를 삭제하시겠습니까?
              </>
            ) : (
              '이 인사정보를 삭제하시겠습니까?'
            )}
            <br />
            <span className="text-red-500">삭제된 데이터는 복구할 수 없습니다.</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
