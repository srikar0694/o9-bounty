import React, { useState } from 'react';
import { BugRow, PointSize } from '../../types/database';
import { useUpdateBugMutation, useGetBugStatusesQuery, useGetUsersQuery, useGetPointScaleQuery } from '../../services/rtkApi';
import { formatDate } from '../../lib/utils';

interface BugEditFormProps {
  bug: BugRow;
  onCancel: () => void;
  onSuccess: () => void;
}

export function BugEditForm({ bug, onCancel, onSuccess }: BugEditFormProps) {
  const [updateBug, { isLoading }] = useUpdateBugMutation();
  const { data: statuses } = useGetBugStatusesQuery();
  const { data: users } = useGetUsersQuery();
  const { data: pointScale } = useGetPointScaleQuery();

  const [formData, setFormData] = useState({
    points: bug.points,
    start_date: bug.start_date ? formatDate(bug.start_date, 'yyyy-MM-dd') : '',
    end_date: bug.end_date ? formatDate(bug.end_date, 'yyyy-MM-dd') : '',
    status_code: bug.status_code,
    details: bug.details || '',
    assigned_to: bug.assigned_to || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateBug({
        id: bug.id,
        payload: {
          ...formData,
          assigned_to: formData.assigned_to || null,
          end_date: formData.end_date || null,
        }
      }).unwrap();
      
      onSuccess();
    } catch (error) {
      console.error('Failed to update bug:', error);
    }
  };

  const getPointValue = (size: PointSize) => {
    const point = pointScale?.find(p => p.size === size);
    return point ? point.value : 0;
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Edit Bug</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Points */}
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <select
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value as PointSize })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {pointScale?.map((point) => (
                <option key={point.size} value={point.size}>
                  {point.size} ({point.value} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status_code}
              onChange={(e) => setFormData({ ...formData, status_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {statuses?.map((status) => (
                <option key={status.code} value={status.code}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Assigned To */}
          <div className="md:col-span-2">
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <select
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details */}
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
            Details
          </label>
          <textarea
            id="details"
            rows={4}
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Additional bug details..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}