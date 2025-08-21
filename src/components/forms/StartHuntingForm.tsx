import React, { useState } from 'react';
import { useStartHuntingSessionMutation, useGetUsersQuery } from '../../services/rtkApi';
import { useAppDispatch } from '../../app/hooks';
import { addToast } from '../../features/ui/uiSlice';

interface StartHuntingFormProps {
  bugId: string;
  onClose: () => void;
}

export function StartHuntingForm({ bugId, onClose }: StartHuntingFormProps) {
  const dispatch = useAppDispatch();
  const [startHunting, { isLoading }] = useStartHuntingSessionMutation();
  const { data: users } = useGetUsersQuery();

  const [formData, setFormData] = useState({
    repro_text: '',
    pr_link: '',
    assigned_module_lead: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await startHunting({
        bug_id: bugId,
        repro_text: formData.repro_text,
        pr_link: formData.pr_link || undefined,
        assigned_module_lead: formData.assigned_module_lead || undefined,
      }).unwrap();
      
      dispatch(addToast({
        message: 'Hunting session started successfully!',
        type: 'success',
      }));
      
      onClose();
    } catch (error) {
      dispatch(addToast({
        message: 'Failed to start hunting session',
        type: 'error',
      }));
    }
  };

  return (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold text-green-900 mb-4">Start Hunting Session</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Repro Text */}
        <div>
          <label htmlFor="repro_text" className="block text-sm font-medium text-gray-700 mb-2">
            Reproduction Steps *
          </label>
          <textarea
            id="repro_text"
            rows={4}
            required
            value={formData.repro_text}
            onChange={(e) => setFormData({ ...formData, repro_text: e.target.value })}
            placeholder="Describe the steps to reproduce this bug..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* PR Link */}
        <div>
          <label htmlFor="pr_link" className="block text-sm font-medium text-gray-700 mb-2">
            Pull Request Link (optional)
          </label>
          <input
            id="pr_link"
            type="url"
            value={formData.pr_link}
            onChange={(e) => setFormData({ ...formData, pr_link: e.target.value })}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Module Lead */}
        <div>
          <label htmlFor="module_lead" className="block text-sm font-medium text-gray-700 mb-2">
            Assign Module Lead (optional)
          </label>
          <select
            id="module_lead"
            value={formData.assigned_module_lead}
            onChange={(e) => setFormData({ ...formData, assigned_module_lead: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a module lead</option>
            {users?.filter(user => user.is_admin).map((user) => (
              <option key={user.id} value={user.id}>
                {user.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Starting...' : 'Start Hunting'}
          </button>
        </div>
      </form>
    </div>
  );
}