import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectToasts, removeToast } from '../features/ui/uiSlice';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function ToastContainer() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon;
      case 'error':
        return ExclamationCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
      default:
        return InformationCircleIcon;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.type);
        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${getToastStyles(toast.type)} animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start">
              <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}