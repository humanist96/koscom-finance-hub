'use client';

import { useState, useEffect, useCallback } from 'react';
import { PersonnelItem } from './constants';

interface Company {
  id: string;
  name: string;
  code: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function usePersonnelManagement() {
  const [items, setItems] = useState<PersonnelItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Filters
  const [companyFilter, setCompanyFilter] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState<PersonnelItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');

  // Fetch companies for dropdown
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/companies?limit=100');
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data.items || data.data || []);
      }
    } catch (error) {
      console.error('증권사 목록 조회 실패:', error);
    }
  }, []);

  // Fetch personnel list
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));

      if (companyFilter) params.set('companyIds', companyFilter);
      if (changeTypeFilter) params.set('changeTypes', changeTypeFilter);
      if (sourceTypeFilter) params.set('sourceTypes', sourceTypeFilter);
      if (searchQuery) params.set('keyword', searchQuery);

      const res = await fetch(`/api/admin/personnel?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.data.items);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('인사정보 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [companyFilter, changeTypeFilter, sourceTypeFilter, searchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // PersonnelFormData type
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

  // Create personnel
  const handleCreate = async (data: PersonnelFormData): Promise<boolean> => {
    setActionLoading('create');
    try {
      const res = await fetch('/api/admin/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        await fetchItems();
        setShowFormModal(false);
        return true;
      } else {
        alert(result.error || '등록에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('인사정보 등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Update personnel
  const handleUpdate = async (id: string, data: PersonnelFormData): Promise<boolean> => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/personnel/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        await fetchItems();
        setShowFormModal(false);
        setEditItem(null);
        return true;
      } else {
        alert(result.error || '수정에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('인사정보 수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Delete personnel
  const handleDelete = async (): Promise<boolean> => {
    if (!deleteItemId) return false;

    setActionLoading(deleteItemId);
    try {
      const res = await fetch(`/api/admin/personnel/${deleteItemId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        await fetchItems();
        setDeleteItemId(null);
        setDeleteItemName('');
        return true;
      } else {
        alert(result.error || '삭제에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('인사정보 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Form submit handler
  const handleFormSubmit = async (data: PersonnelFormData): Promise<void> => {
    if (editItem) {
      await handleUpdate(editItem.id, data);
    } else {
      await handleCreate(data);
    }
  };

  // Open add form
  const openAddForm = () => {
    setEditItem(null);
    setShowFormModal(true);
  };

  // Open edit form
  const openEditForm = (item: PersonnelItem) => {
    setEditItem(item);
    setShowFormModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (id: string, personName: string) => {
    setDeleteItemId(id);
    setDeleteItemName(personName);
  };

  // Close form modal
  const closeFormModal = () => {
    setShowFormModal(false);
    setEditItem(null);
  };

  // Close delete confirmation
  const closeDeleteConfirm = () => {
    setDeleteItemId(null);
    setDeleteItemName('');
  };

  // Download template
  const downloadTemplate = async () => {
    try {
      const res = await fetch('/api/admin/personnel/template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `인사정보_업로드_템플릿_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('템플릿 다운로드 실패:', error);
      alert('템플릿 다운로드에 실패했습니다.');
    }
  };

  return {
    // Data
    items,
    companies,
    loading,
    actionLoading,
    pagination,

    // Filters
    companyFilter,
    setCompanyFilter,
    changeTypeFilter,
    setChangeTypeFilter,
    sourceTypeFilter,
    setSourceTypeFilter,
    searchQuery,
    setSearchQuery,

    // Actions
    fetchItems,
    downloadTemplate,

    // Form modal
    showFormModal,
    editItem,
    openAddForm,
    openEditForm,
    closeFormModal,
    handleFormSubmit,

    // Delete confirmation
    deleteItemId,
    deleteItemName,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDelete,
  };
}
