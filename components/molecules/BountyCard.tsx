/**
 * @file components/molecules/BountyCard.tsx
 * @description A card component representing a single bounty or mini-game that the player can undertake to earn tokens.
 */
import React from 'react';
import { Hourglass } from 'lucide-react';
import Button from '../atoms/Button';

interface BountyCardProps {
  title: string;
  description: string;
  reward: number;
  onClick: () => void;
}

const BountyCard: React.FC<BountyCardProps> = ({ title, description, reward, onClick }) => {
  return (
    <div className="bg-brand-surface p-4 rounded-lg border-l-4 border-brand-border hover:border-brand-primary transition-colors duration-200 flex items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-oswald text-lg text-white uppercase">{title}</h3>
        <p className="text-sm text-brand-text-muted mb-3">{description}</p>
        <div className="flex items-center gap-2 text-yellow-400 font-bold">
          <Hourglass size={16} />
          <span>{reward} Time Reduction</span>
        </div>
      </div>
      <Button onClick={onClick} className="flex-shrink-0 text-sm">
        Start
      </Button>
    </div>
  );
};

export default BountyCard;
