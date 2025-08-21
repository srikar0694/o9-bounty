import React from 'react';
import { useGetHuntingSessionsQuery, useAwardPointsMutation } from '../../services/rtkApi';
import { formatDate } from '../../lib/utils';
import { TrophyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function HuntingSessionManagement() {
  const { data: sessions = [], isLoading } = useGetHuntingSessionsQuery();
  const [awardPoints] = useAwardPointsMutation();

  const handleAwardPoints = async (sessionId: string, mode: 'rootcause' | 'fix' | 'both') => {
    try {
      await awardPoints({
        sessionId,
        payload: { mode }
      }).unwrap();
    } catch (error) {
      console.error('Failed to award points:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const pendingSessions = sessions.filter(s => !s.accepted_by_lead);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Pending Sessions ({pendingSessions.length})
        </h3>
        
        {pendingSessions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No pending sessions to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSessions.map((session) => (
              <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Session #{session.id.slice(0, 8)}...
                    </h4>
                    <p className="text-sm text-gray-600">
                      Bug: {session.bug_id.slice(0, 8)}... | Started: {formatDate(session.started_at)}
                    </p>
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>

                {session.repro_text && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Reproduction Steps:</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {session.repro_text}
                    </p>
                  </div>
                )}

                {session.pr_link && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Pull Request:</h5>
                    <a
                      href={session.pr_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {session.pr_link}
                    </a>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAwardPoints(session.id, 'rootcause')}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <TrophyIcon className="h-4 w-4 mr-1" />
                    Root Cause (10%)
                  </button>
                  
                  <button
                    onClick={() => handleAwardPoints(session.id, 'fix')}
                    className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    <TrophyIcon className="h-4 w-4 mr-1" />
                    Fix (90%)
                  </button>
                  
                  <button
                    onClick={() => handleAwardPoints(session.id, 'both')}
                    className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <TrophyIcon className="h-4 w-4 mr-1" />
                    Both (100%)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Completed Sessions
        </h3>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points Awarded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Awarded Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions
                .filter(s => s.accepted_by_lead)
                .slice(0, 10)
                .map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{session.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{session.bug_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.points_awarded?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.awarded_at ? formatDate(session.awarded_at) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}