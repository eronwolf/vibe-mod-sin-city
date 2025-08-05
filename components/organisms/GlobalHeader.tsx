import React from 'react';

const GlobalHeader: React.FC = () => {
  return (
    <header className="w-full bg-brand-surface h-16 flex items-center justify-between px-4 border-b-2 border-brand-border shadow-lg">
      <h1 className="text-2xl font-oswald text-brand-accent uppercase">Wild Trail</h1>
      {/* Add any other header elements here if needed */}
    </header>
  );
};

export default GlobalHeader;