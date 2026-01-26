'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CHANGE_TYPE_OPTIONS, PersonnelItem } from './constants';

interface Company {
  id: string;
  name: string;
  code: string | null;
}

interface PersonnelFormData {
  companyId: string;
  personName: string;
  position: string;
  department: string;
  changeType: string;
  previousPosition: string;
  sourceUrl: string;
  effectiveDate: string;
  announcedAt: string;
}

interface PersonnelFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PersonnelFormData) => Promise<void>;
  editItem: PersonnelItem | null;
  companies: Company[];
  isLoading: boolean;
}

function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

const initialFormData: PersonnelFormData = {
  companyId: '',
  personName: '',
  position: '',
  department: '',
  changeType: '',
  previousPosition: '',
  sourceUrl: '',
  effectiveDate: '',
  announcedAt: new Date().toISOString().split('T')[0],
};

export function PersonnelForm({
  open,
  onClose,
  onSubmit,
  editItem,
  companies,
  isLoading,
}: PersonnelFormProps) {
  const [formData, setFormData] = useState<PersonnelFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonnelFormData, string>>>({});

  useEffect(() => {
    if (editItem) {
      setFormData({
        companyId: editItem.companyId,
        personName: editItem.personName,
        position: editItem.position || '',
        department: editItem.department || '',
        changeType: editItem.changeType,
        previousPosition: editItem.previousPosition || '',
        sourceUrl: editItem.sourceUrl || '',
        effectiveDate: formatDateForInput(editItem.effectiveDate),
        announcedAt: formatDateForInput(editItem.announcedAt),
      });
    } else {
      setFormData({
        ...initialFormData,
        announcedAt: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [editItem, open]);

  const handleChange = (field: keyof PersonnelFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonnelFormData, string>> = {};

    if (!formData.companyId) {
      newErrors.companyId = '증권사를 선택해주세요';
    }
    if (!formData.personName.trim()) {
      newErrors.personName = '인물명을 입력해주세요';
    }
    if (!formData.changeType) {
      newErrors.changeType = '변동유형을 선택해주세요';
    }
    if (!formData.announcedAt) {
      newErrors.announcedAt = '발표일을 입력해주세요';
    }
    if (formData.sourceUrl && !formData.sourceUrl.match(/^https?:\/\/.+/)) {
      newErrors.sourceUrl = '올바른 URL 형식을 입력해주세요 (http:// 또는 https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editItem ? '인사정보 수정' : '인사정보 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                증권사 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">증권사 선택</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인물명 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.personName}
                onChange={(e) => handleChange('personName', e.target.value)}
                placeholder="홍길동"
              />
              {errors.personName && (
                <p className="text-red-500 text-sm mt-1">{errors.personName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                변동유형 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.changeType}
                onChange={(e) => handleChange('changeType', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">변동유형 선택</option>
                {CHANGE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.changeType && (
                <p className="text-red-500 text-sm mt-1">{errors.changeType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직책
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="부사장"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서
              </label>
              <Input
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="리테일본부"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이전 직책
              </label>
              <Input
                value={formData.previousPosition}
                onChange={(e) => handleChange('previousPosition', e.target.value)}
                placeholder="전무"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                발표일 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.announcedAt}
                onChange={(e) => handleChange('announcedAt', e.target.value)}
              />
              {errors.announcedAt && (
                <p className="text-red-500 text-sm mt-1">{errors.announcedAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                발령일
              </label>
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange('effectiveDate', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출처 URL
              </label>
              <Input
                value={formData.sourceUrl}
                onChange={(e) => handleChange('sourceUrl', e.target.value)}
                placeholder="https://..."
              />
              {errors.sourceUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.sourceUrl}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : editItem ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
