import React, { useState } from 'react';
import { AdminRoute } from '../routes/AdminRoute';
import { UserManagement } from '../components/admin/UserManagement';
import { PointScaleManagement } from '../components/admin/PointScaleManagement';
import { HuntingSessionManagement } from '../components/admin/HuntingSessionManagement';

type TabType = 'users' | 'points' | 'sessions';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  const tabs = [
    { id: 'users' as TabType, name: 'Users', description: 'Manage user permissions' },
    { id: 'points' as TabType, name: 'Point Scale', description: 'Configure point values' },
    { id: 'sessions' as TabType, name: 'Hunting Sessions', description: 'Review and award points' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage system settings and user activities</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'points' && <PointScaleManagement />}
        {activeTab === 'sessions' && <HuntingSessionManagement />}
      </div>
    </div>
  );
}