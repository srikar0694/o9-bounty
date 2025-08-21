import React from 'react';
import { BugList } from '../components/BugList';
import { BugFilters } from '../components/BugFilters';

export function BugsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Bugs</h1>
          <p className="text-gray-600">Browse and manage available bug bounties</p>
        </div>
      </div>

      <BugFilters />
      <BugList />
    </div>
  );
}