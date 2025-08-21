import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectProfile } from '../features/auth/authSlice';
import { useGetUserStatsQuery } from '../services/rtkApi';
import { DashboardCards } from '../components/DashboardCards';
import { DashboardTabs } from '../components/DashboardTabs';

export function DashboardPage() {
  const profile = useAppSelector(selectProfile);
  const { data: stats, isLoading } = useGetUserStatsQuery(profile?.id || '', {
    skip: !profile?.id,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.display_name}!
        </h1>
        <p className="text-gray-600">Here's your bug bounty activity overview</p>
      </div>

      <DashboardCards stats={stats} />
      <DashboardTabs />
    </div>
  );
}