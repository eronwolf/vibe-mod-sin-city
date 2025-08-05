import React from 'react';
import { Coins } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectTimeSpent } from '../../store/storySlice';

/**
 * @file TokenDisplay.tsx
 * @description A component to display the player's token balance.
 * This component is now connected to the Redux store to show the live token count.
 */
const TokenDisplay: React.FC = () => {
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));

  return (
    <div className="flex items-center gap-2 bg-brand-surface/80 backdrop-blur-md text-white font-bold py-2 px-4 rounded-full border-2 border-brand-border shadow-lg">
      <Coins className="text-yellow-400 animate-sparkle-glow" size={20} />
      <span className="font-mono text-lg">{timeSpent}</span>
    </div>
  );
};

export default TokenDisplay;