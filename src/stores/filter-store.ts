import { create } from 'zustand';
import type { NewsCategory, PersonnelChangeType } from '@/types';

interface FilterState {
  // 뉴스 필터
  selectedCompanyIds: string[];
  selectedCategories: NewsCategory[];
  showPersonnelOnly: boolean;
  showPowerbaseOnly: boolean;
  dateRange: 'today' | '3days' | '1week' | '1month' | 'all';
  searchKeyword: string;

  // 액션
  setSelectedCompanyIds: (ids: string[]) => void;
  toggleCompany: (id: string) => void;
  setSelectedCategories: (categories: NewsCategory[]) => void;
  toggleCategory: (category: NewsCategory) => void;
  setShowPersonnelOnly: (value: boolean) => void;
  setShowPowerbaseOnly: (value: boolean) => void;
  setDateRange: (range: 'today' | '3days' | '1week' | '1month' | 'all') => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
}

const initialState = {
  selectedCompanyIds: [] as string[],
  selectedCategories: [] as NewsCategory[],
  showPersonnelOnly: false,
  showPowerbaseOnly: false,
  dateRange: '1week' as const,
  searchKeyword: '',
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initialState,

  setSelectedCompanyIds: ids => set({ selectedCompanyIds: ids }),

  toggleCompany: id => {
    const current = get().selectedCompanyIds;
    const newIds = current.includes(id)
      ? current.filter(cid => cid !== id)
      : [...current, id];
    set({ selectedCompanyIds: newIds });
  },

  setSelectedCategories: categories => set({ selectedCategories: categories }),

  toggleCategory: category => {
    const current = get().selectedCategories;
    const newCategories = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    set({ selectedCategories: newCategories });
  },

  setShowPersonnelOnly: value => set({ showPersonnelOnly: value }),

  setShowPowerbaseOnly: value => set({ showPowerbaseOnly: value }),

  setDateRange: range => set({ dateRange: range }),

  setSearchKeyword: keyword => set({ searchKeyword: keyword }),

  resetFilters: () => set(initialState),
}));
