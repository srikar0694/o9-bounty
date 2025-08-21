import React from 'react';
import { UserStatsRow } from '../types/database';
import { 
  BugAntIcon, 
  EyeIcon, 
  PlayIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline';

interface DashboardCardsProps {
  stats?: UserStatsRow | null;
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      name: 'Bugs Solved',
      value: stats?.bugs_solved || 0,
      icon: BugAntIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Bugs Identified',
      value: stats?.bugs_identified || 0,
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Bugs',
      value: stats?.active_bugs || 0,
      icon: PlayIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Points Earned',
      value: stats?.points_earned || 0,
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {card.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {typeof card.value === 'number' && card.name.includes('Points') 
                    ? card.value.toLocaleString()
                    : card.value
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}