import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectFilters } from '../features/filters/filtersSlice';
import { setBugDetailId } from '../features/ui/uiSlice';
import { useGetOpenBugsQuery } from '../services/rtkApi';
import { BugDetailPanel } from './BugDetailPanel';
import { formatDate, getStatusColor, getPointsColor } from '../lib/utils';
import { ArrowTopRightOnSquareIcon, UserIcon } from '@heroicons/react/24/outline';

interface BugListProps {
  variant?: 'open-bugs' | 'tagged-bugs' | 'working-bugs' | 'resolved-bugs';
}

export function BugList({ variant = 'open-bugs' }: BugListProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const { data: bugs = [], isLoading, error } = useGetOpenBugsQuery();

  // Filter bugs based on current filters and variant
  const filteredBugs = bugs.filter(bug => {
    // Apply status filter
    if (filters.status_code && bug.status_code !== filters.status_code) {
      return false;
    }
    
    // Apply points filter
    if (filters.points && bug.points !== filters.points) {
      return false;
    }
    
    // Apply search filter
    if (filters.search && !bug.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply assigned filter
    if (filters.assignedTo && bug.assigned_to !== filters.assignedTo) {
      return false;
    }
    
    // Apply variant-specific filters
    switch (variant) {
      case 'tagged-bugs':
        // This would need additional data to filter by tags
        return true;
      case 'working-bugs':
        return bug.status_code === 'in_progress';
      case 'resolved-bugs':
        return bug.status_code === 'resolved' || bug.status_code === 'closed';
      case 'open-bugs':
      default:
        return bug.status_code === 'open';
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load bugs. Please try again.</p>
      </div>
    );
  }

  if (filteredBugs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bugs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredBugs.map((bug) => (
          <div
            key={bug.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => dispatch(setBugDetailId(bug.id))}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {bug.title}
                  </h3>
                  <a
                    href={bug.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {bug.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status_code)}`}>
                    {bug.status_label}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPointsColor(bug.points)}`}>
                    {bug.points} ({bug.points_value} pts)
                  </span>
                  
                  <span className="text-gray-500">
                    ADO: {bug.ado_state}
                  </span>
                  
                  <span className="text-gray-500">
                    {formatDate(bug.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="flex items-center text-sm text-gray-500">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {bug.creator_name}
                </div>
                
                {bug.assigned_name && (
                  <div className="text-xs text-gray-500">
                    Assigned: {bug.assigned_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BugDetailPanel />
    </>
  );
}