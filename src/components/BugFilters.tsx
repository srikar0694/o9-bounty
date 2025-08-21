import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { 
  selectFilters,
  setStatusFilter,
  setPointsFilter,
  setSearchFilter,
  setAssignedToFilter,
  clearFilters
} from '../features/filters/filtersSlice';
import { useGetBugStatusesQuery, useGetUsersQuery } from '../services/rtkApi';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function BugFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const { data: statuses } = useGetBugStatusesQuery();
  const { data: users } = useGetUsersQuery();

  const pointSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== ''
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              placeholder="Search bug titles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters.status_code || ''}
            onChange={(e) => dispatch(setStatusFilter(e.target.value || null))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {statuses?.map((status) => (
              <option key={status.code} value={status.code}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Points Filter */}
        <div className="min-w-32">
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <select
            id="points"
            value={filters.points || ''}
            onChange={(e) => dispatch(setPointsFilter(e.target.value as any || null))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Sizes</option>
            {pointSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To Filter */}
        <div className="min-w-48">
          <label htmlFor="assigned" className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <select
            id="assigned"
            value={filters.assignedTo || ''}
            onChange={(e) => dispatch(setAssignedToFilter(e.target.value || null))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Users</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4 inline mr-2" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}