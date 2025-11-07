import React from 'react';

export default function Alert({ message, type }) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-900 border-green-700 text-green-300',
    error: 'bg-red-900 border-red-700 text-red-300',
  };

  return (
    <div className={`p-4 rounded-lg text-sm border ${styles[type] || 'bg-gray-700'}`}>
      {message}
    </div>
  );
}