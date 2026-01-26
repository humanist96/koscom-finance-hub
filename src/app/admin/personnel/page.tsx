'use client';

import { useState } from 'react';
import {
  PersonnelFilters,
  PersonnelTable,
  PersonnelForm,
  PersonnelUpload,
  DeleteConfirmModal,
  usePersonnelManagement,
} from '@/components/admin/personnel';

type TabType = 'list' | 'upload';

export default function AdminPersonnelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  const {
    items,
    companies,
    loading,
    actionLoading,
    companyFilter,
    setCompanyFilter,
    changeTypeFilter,
    setChangeTypeFilter,
    sourceTypeFilter,
    setSourceTypeFilter,
    searchQuery,
    setSearchQuery,
    fetchItems,
    downloadTemplate,
    showFormModal,
    editItem,
    openAddForm,
    openEditForm,
    closeFormModal,
    handleFormSubmit,
    deleteItemId,
    deleteItemName,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDelete,
  } = usePersonnelManagement();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">인사정보 관리</h1>
        <p className="text-gray-600">증권사 인사정보를 등록하고 관리합니다.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            인사정보 목록
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            엑셀 업로드
          </button>
        </nav>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <>
          <PersonnelFilters
            companies={companies}
            companyFilter={companyFilter}
            onCompanyFilterChange={setCompanyFilter}
            changeTypeFilter={changeTypeFilter}
            onChangeTypeFilterChange={setChangeTypeFilter}
            sourceTypeFilter={sourceTypeFilter}
            onSourceTypeFilterChange={setSourceTypeFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onRefresh={fetchItems}
            onAddNew={openAddForm}
            onDownloadTemplate={downloadTemplate}
            loading={loading}
          />

          <PersonnelTable
            items={items}
            loading={loading}
            actionLoading={actionLoading}
            onEdit={openEditForm}
            onDelete={(id) => {
              const item = items.find((i) => i.id === id);
              openDeleteConfirm(id, item?.personName || '');
            }}
          />

          <PersonnelForm
            open={showFormModal}
            onClose={closeFormModal}
            onSubmit={handleFormSubmit}
            editItem={editItem}
            companies={companies}
            isLoading={actionLoading === 'create' || actionLoading === editItem?.id}
          />

          <DeleteConfirmModal
            open={!!deleteItemId}
            onClose={closeDeleteConfirm}
            onConfirm={handleDelete}
            isLoading={actionLoading === deleteItemId}
            personName={deleteItemName}
          />
        </>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && <PersonnelUpload />}
    </div>
  );
}
