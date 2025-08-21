import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectBugDetailId, setBugDetailId } from '../features/ui/uiSlice';
import { selectIsAdmin } from '../features/auth/authSlice';
import { useGetBugByIdQuery, useUpdateBugMutation } from '../services/rtkApi';
import { BugEditForm } from './forms/BugEditForm';
import { StartHuntingForm } from './forms/StartHuntingForm';
import { SuggestUsersDialog } from './SuggestUsersDialog';
import { XMarkIcon, ExternalLinkIcon } from '@heroicons/react/24/outline';
import { formatDate, getStatusColor, getPointsColor } from '../lib/utils';

export function BugDetailPanel() {
  const dispatch = useAppDispatch();
  const bugId = useAppSelector(selectBugDetailId);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [isEditing, setIsEditing] = useState(false);
  const [showHuntingForm, setShowHuntingForm] = useState(false);
  
  const { data: bug, isLoading } = useGetBugByIdQuery(bugId!, {
    skip: !bugId,
  });

  const isOpen = !!bugId;

  const handleClose = () => {
    dispatch(setBugDetailId(null));
    setIsEditing(false);
    setShowHuntingForm(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Bug Details
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : bug ? (
            <div className="p-6 space-y-6">
              {/* Bug Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      Bug #{bug.ado_id}
                    </h2>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status_code)}`}>
                      {bug.status_code}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPointsColor(bug.points)}`}>
                      {bug.points}
                    </span>
                    
                    <span className="text-gray-500 text-sm">
                      Created: {formatDate(bug.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowHuntingForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Start Hunting
                  </button>
                </div>
              </div>

              {/* Bug Content */}
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{bug.details || 'No description available.'}</p>
                </div>
                
                {bug.start_date && (
                  <div className="mt-4">
                    <span className="font-semibold">Start Date:</span> {formatDate(bug.start_date)}
                    {bug.end_date && (
                      <>
                        <br />
                        <span className="font-semibold">End Date:</span> {formatDate(bug.end_date)}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Form */}
              {isEditing && isAdmin && (
                <BugEditForm 
                  bug={bug} 
                  onCancel={() => setIsEditing(false)}
                  onSuccess={() => {
                    setIsEditing(false);
                    dispatch(setBugDetailId(null));
                  }}
                />
              )}

              {/* Hunting Form */}
              {showHuntingForm && (
                <StartHuntingForm
                  bugId={bug.id}
                  onClose={() => setShowHuntingForm(false)}
                />
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Bug not found.</p>
            </div>
          )}
        </Dialog.Panel>
      </div>
      
      <SuggestUsersDialog />
    </Dialog>
  );
}