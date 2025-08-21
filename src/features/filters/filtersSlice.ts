import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { PointSize } from '../../types/database';

interface FiltersState {
  status_code: string | null;
  points: PointSize | null;
  groupId: string | null;
  tagId: string | null;
  search: string;
  assignedTo: string | null;
}

const initialState: FiltersState = {
  status_code: null,
  points: null,
  groupId: null,
  tagId: null,
  search: '',
  assignedTo: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.status_code = action.payload;
    },
    setPointsFilter: (state, action: PayloadAction<PointSize | null>) => {
      state.points = action.payload;
    },
    setGroupFilter: (state, action: PayloadAction<string | null>) => {
      state.groupId = action.payload;
    },
    setTagFilter: (state, action: PayloadAction<string | null>) => {
      state.tagId = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setAssignedToFilter: (state, action: PayloadAction<string | null>) => {
      state.assignedTo = action.payload;
    },
    clearFilters: (state) => {
      return initialState;
    },
  },
});

export const {
  setStatusFilter,
  setPointsFilter,
  setGroupFilter,
  setTagFilter,
  setSearchFilter,
  setAssignedToFilter,
  clearFilters,
} = filtersSlice.actions;

// Selectors
export const selectFilters = (state: RootState) => state.filters;
export const selectStatusFilter = (state: RootState) => state.filters.status_code;
export const selectPointsFilter = (state: RootState) => state.filters.points;
export const selectGroupFilter = (state: RootState) => state.filters.groupId;
export const selectTagFilter = (state: RootState) => state.filters.tagId;
export const selectSearchFilter = (state: RootState) => state.filters.search;
export const selectAssignedToFilter = (state: RootState) => state.filters.assignedTo;

export default filtersSlice.reducer;