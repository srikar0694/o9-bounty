import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectSuggestUsersOpen, setSuggestUsersOpen, selectBugDetailId } from '../features/ui/uiSlice';
import { useGetSuggestedUsersQuery, useTagUsersToBugMutation } from '../services/rtkApi';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function SuggestUsersDialog() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectSuggestUsersOpen);
  const bugId = useAppSelector(selectBugDetailId);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { data: suggestedUsers, isLoading } = useGetSuggestedUsersQuery(bugId!, {
    skip: !bugId || !isOpen,
  });
  
  const [tagUsers, { isLoading: isTagging }] = useTagUsersToBugMutation();

  const handleClose = () => {
    dispatch(setSuggestUsersOpen(false));
    setSelectedUsers([]);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddSelected = async () => {
    if (!bugId || selectedUsers.length === 0) return;
    
    try {
      await tagUsers({
        bugId,
        payload: { user_ids: selectedUsers }
      }).unwrap();
      
      handleClose();
    } catch (error) {
      console.error('Failed to tag users:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Suggested Users
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestedUsers?.users && suggestedUsers.users.length > 0 ? (
              <div className="space-y-3">
                {suggestedUsers.users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {user.score.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No suggested users available</p>
              </div>
            )}
          </div>

          {suggestedUsers?.users && suggestedUsers.users.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelected}
                  disabled={selectedUsers.length === 0 || isTagging}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTagging ? 'Adding...' : `Add Selected (${selectedUsers.length})`}
                </button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}