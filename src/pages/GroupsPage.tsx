import React, { useState } from 'react';
import { useGetGroupsQuery, useCreateGroupMutation } from '../services/rtkApi';
import { CreateGroupForm } from '../components/forms/CreateGroupForm';
import { GroupList } from '../components/GroupList';
import { PlusIcon } from '@heroicons/react/24/outline';

export function GroupsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: groups, isLoading } = useGetGroupsQuery();
  const [createGroup] = useCreateGroupMutation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage teams and user groups</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Group
        </button>
      </div>

      {showCreateForm && (
        <CreateGroupForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={createGroup}
        />
      )}

      <GroupList groups={groups} isLoading={isLoading} />
    </div>
  );
}