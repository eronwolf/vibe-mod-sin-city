import React from 'react';
import GlobalHeader from '../organisms/GlobalHeader';
const BlankTimelineView: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <GlobalHeader />
      <div className="flex-grow">
        {/* This area will be blank */}
      </div>
    </div>
  );
};
export default BlankTimelineView;