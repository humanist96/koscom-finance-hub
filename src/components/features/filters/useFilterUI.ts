'use client';

import { useMemo } from 'react';
import { useCompanies } from '@/hooks/use-companies';
import { useFilterStore } from '@/stores/filter-store';
import { useSession } from 'next-auth/react';
import type { NewsCategory } from '@/types/news';

/**
 * Shared filter UI logic hook
 * Extracts common filter state and computed values used by both
 * Sidebar and MobileFilter components
 */
export function useFilterUI() {
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies({ withStats: true });
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const user = session?.user;
  const assignedCompanyIds = user?.assignedCompanyIds || [];

  const filterStore = useFilterStore();
  const {
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
    setShowPowerbaseOnly,
    resetFilters,
  } = filterStore;

  const companies = companiesData?.data || [];

  // Static categories array
  const categories: NewsCategory[] = [
    'GENERAL',
    'PERSONNEL',
    'BUSINESS',
    'PRODUCT',
    'IR',
    'EVENT',
  ];

  // Sort companies with assigned ones first
  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      const aAssigned = assignedCompanyIds.includes(a.id);
      const bAssigned = assignedCompanyIds.includes(b.id);
      if (aAssigned && !bAssigned) return -1;
      if (!aAssigned && bAssigned) return 1;
      return 0;
    });
  }, [companies, assignedCompanyIds]);

  // Filter companies based on Powerbase toggle
  const filteredCompanies = useMemo(() => {
    return showPowerbaseOnly
      ? sortedCompanies.filter(c => c.isPowerbaseClient)
      : sortedCompanies;
  }, [sortedCompanies, showPowerbaseOnly]);

  // Count of Powerbase clients
  const powerbaseCount = useMemo(() => {
    return companies.filter(c => c.isPowerbaseClient).length;
  }, [companies]);

  // Check if any filters are active (for reset button visibility)
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCompanyIds.length > 0 ||
      selectedCategories.length > 0 ||
      dateRange !== '1week' ||
      showPersonnelOnly ||
      showPowerbaseOnly
    );
  }, [selectedCompanyIds, selectedCategories, dateRange, showPersonnelOnly, showPowerbaseOnly]);

  // Count of active filters (for badge display)
  const activeFilterCount = useMemo(() => {
    return (
      selectedCompanyIds.length +
      selectedCategories.length +
      (showPersonnelOnly ? 1 : 0) +
      (showPowerbaseOnly ? 1 : 0) +
      (dateRange !== '1week' ? 1 : 0)
    );
  }, [selectedCompanyIds, selectedCategories, showPersonnelOnly, showPowerbaseOnly, dateRange]);

  // Check if a company is assigned to the current user
  const isCompanyAssigned = (companyId: string) => {
    return assignedCompanyIds.includes(companyId);
  };

  return {
    // Data
    companies,
    filteredCompanies,
    sortedCompanies,
    categories,
    powerbaseCount,

    // Loading states
    isLoadingCompanies,

    // User state
    isLoggedIn,
    user,
    assignedCompanyIds,
    isCompanyAssigned,

    // Filter state
    selectedCompanyIds,
    selectedCategories,
    dateRange,
    showPersonnelOnly,
    showPowerbaseOnly,

    // Computed
    hasActiveFilters,
    activeFilterCount,

    // Actions
    toggleCompany,
    toggleCategory,
    setDateRange,
    setShowPersonnelOnly,
    setShowPowerbaseOnly,
    resetFilters,
  };
}

export type FilterUIState = ReturnType<typeof useFilterUI>;
