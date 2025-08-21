import React from 'react';
import { GroupRow } from '../types/database';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface GroupListProps {
  groups?: GroupRow[];
  isLoading: boolean;
}

export function GroupList({ groups = [], isLoading }: GroupListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {group.name}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {group.group_id}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created {new Date(group.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {/* Member count would be fetched separately */}
              Members
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}