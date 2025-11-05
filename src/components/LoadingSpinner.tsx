'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-10 h-10 border-4 border-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
