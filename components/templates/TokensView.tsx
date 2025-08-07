/**
 * @file components/templates/TokensView.tsx
 * @description Renders the new "Token Ledger" page, which serves as the central hub for the game's economy.
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { selectTimeSpent, selectBounties, subtractTimeSpent } from '../../store/storySlice';
import { Hourglass } from 'lucide-react';
import BountyCard from '../molecules/BountyCard';
import Button from '../atoms/Button';
import { TOKENS_VIEW_COPY } from '../../config';

const TokensView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));
  const bounties = useSelector((state: RootState) => selectBounties(state));

  const handleSubtractTimeSpent = () => {
    dispatch(subtractTimeSpent(100));
  };

  return (
    <div className="p-4 pb-40 h-full overflow-y-auto">
      <h1 className="text-4xl font-oswald text-brand-accent mb-2 uppercase">Time Spent Ledger</h1>
      
      {/* Time Spent Display */}
      <div className="bg-brand-surface border-2 border-brand-primary p-6 rounded-lg mb-8 flex flex-col items-center justify-center text-center shadow-lg shadow-brand-primary/20">
        <p className="font-oswald text-brand-text-muted uppercase tracking-wider mb-2">Total Time Spent</p>
        <div className="flex items-center gap-4">
          <Hourglass className="text-yellow-400 animate-sparkle-glow" size={40} />
          <span className="font-mono text-6xl text-white font-bold">{timeSpent}</span>
        </div>
      </div>
      
      {/* Narrative block explaining the token economy */}
      <div className="bg-black/20 p-4 rounded-lg border border-brand-border mb-8">
        <h3 className="font-oswald text-brand-primary uppercase tracking-wider mb-2">{TOKENS_VIEW_COPY.ABOUT_TITLE}</h3>
        <p className="text-brand-text-muted text-sm">{TOKENS_VIEW_COPY.ABOUT_BODY}</p>
      </div>


      {/* Bounties Section */}
      <div>
        <h2 className="text-2xl font-oswald text-brand-primary mb-3 border-b border-brand-primary/30 pb-1 uppercase tracking-wider">{TOKENS_VIEW_COPY.BOUNTY_TITLE}</h2>
        <p className="text-brand-text-muted mb-4 text-sm">{TOKENS_VIEW_COPY.BOUNTY_BODY}</p>
        <div className="space-y-3">
          {bounties.map(bounty => (
            <BountyCard
              key={bounty.id}
              title={bounty.title}
              description={bounty.description}
              reward={bounty.reward}
              onClick={() => alert("This mini-game is coming soon!")}
            />
          ))}
        </div>
      </div>

      {/* Temporary Button */}
      <div className="mt-8 p-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg text-center">
        <h3 className="font-oswald text-yellow-400 uppercase tracking-wider mb-2">Dev Tool</h3>
        <p className="text-sm text-yellow-300/80 mb-3">This is a temporary button to reduce time spent for testing.</p>
        <Button onClick={handleSubtractTimeSpent} variant="secondary">
          Reduce Time Spent by 100
        </Button>
      </div>
    </div>
  );
};

export default TokensView;