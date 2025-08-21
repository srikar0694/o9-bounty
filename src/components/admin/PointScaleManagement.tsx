import React, { useState } from 'react';
import { useGetPointScaleQuery, useUpdatePointScaleMutation } from '../../services/rtkApi';
import { PointSize } from '../../types/database';

export function PointScaleManagement() {
  const { data: pointScale = [], isLoading } = useGetPointScaleQuery();
  const [updatePointScale] = useUpdatePointScaleMutation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const startEditing = (id: number, currentValue: number) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    
    try {
      await updatePointScale({
        id: editingId,
        value: editValue,
      }).unwrap();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update point scale:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Point Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pointScale.map((point) => (
              <tr key={point.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {point.size}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === point.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  ) : (
                    point.value.toLocaleString()
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {editingId === point.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(point.id, point.value)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}