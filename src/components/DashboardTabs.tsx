import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectActiveTab } from '../features/ui/uiSlice';
import { setActiveTab } from '../features/ui/uiSlice';
import { BugList } from './BugList';

type TabType = 'open-bugs' | 'tagged-bugs' | 'working-bugs' | 'resolved-bugs';

export function DashboardTabs() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);

  const tabs = [
    { id: 'open-bugs' as TabType, name: 'Open Bugs' },
    { id: 'tagged-bugs' as TabType, name: 'Tagged Bugs' },
    { id: 'working-bugs' as TabType, name: 'Working Bugs' },
    { id: 'resolved-bugs' as TabType, name: 'Resolved Bugs' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
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
      
      <div className="p-6">
        <BugList variant={activeTab as TabType} />
      </div>
    </div>
  );
}