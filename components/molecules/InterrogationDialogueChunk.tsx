/**
 * @file InterrogationDialogueChunk.tsx
 * @description A component that renders a single, actionable chunk of suspect testimony during an interrogation.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Lightbulb, Hourglass } from 'lucide-react';
import { DialogueChunkData } from '../../types';
import { GAME_MECHANICS } from '../../config';
import { selectTimeSpent } from '../../store/storySlice';
import ToggleButton from '../atoms/ToggleButton';

interface InterrogationDialogueChunkProps {
  chunk: DialogueChunkData;
  onCreateEvidence: (chunk: DialogueChunkData) => void;
  isEvidence: boolean;
  isRevealed: boolean;
}

const InterrogationDialogueChunk: React.FC<InterrogationDialogueChunkProps> = ({ chunk, onCreateEvidence, isEvidence, isRevealed }) => {
  const isGreeting = chunk.id.includes('-opening');
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));
  
  const timeToAdd = GAME_MECHANICS.CREATE_TESTIMONY_TIME_ADDITION;
  // No longer checking for affordability as there is no limit to time spent.

  const containerClasses = isRevealed
    ? 'bg-yellow-900/20 border-yellow-500/80 shadow-lg shadow-yellow-500/10'
    : 'bg-black/20 border-brand-border';
    
  // New handler for the toggle switch
  const handleToggle = (toggled: boolean) => {
    if (toggled && !isEvidence) { // No longer checking for affordability
        onCreateEvidence(chunk);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 max-w-full animate-fade-in flex-row`}
    >
      <div
        className={`p-4 rounded-lg flex-1 text-white rounded-bl-none border-2 transition-all duration-500 relative overflow-hidden ${containerClasses}`}
      >
        <div className="absolute -top-4 -right-4 text-brand-border/10 text-5xl font-oswald uppercase font-bold transform rotate-12 pointer-events-none">
          CONFIDENTIAL
        </div>
        <p className="text-base leading-relaxed mb-3 z-10 relative">{chunk.text}</p>
        
        {isRevealed && (
          <div className="mt-3 pt-3 border-t border-yellow-500/30 animate-fade-in z-10 relative">
            <h4 className="font-oswald text-yellow-400 uppercase text-xs tracking-wider mb-1 flex items-center gap-1.5 animate-pulse-subtle">
                <Lightbulb size={14} />
                Critical Clue Revealed
            </h4>
          </div>
        )}

        {!isGreeting && (
            <div className="pt-3 mt-3 border-t border-brand-border/20 z-10 relative">
                <div className="flex items-center justify-between gap-4">
                  <label className="font-oswald text-brand-text uppercase tracking-wider text-sm">Add to Timeline</label>
                  <div className="flex items-center gap-4">
                    {!isEvidence && (
                        <div className="flex items-center gap-2 text-yellow-400 font-mono text-base" title={`Time Added: ${timeToAdd}`}>
                            <Hourglass size={18} />
                            <span className="font-bold">{timeToAdd}</span>
                        </div>
                    )}
                    <ToggleButton
                      accessibleLabel={`Toggle statement as evidence`}
                      toggled={isEvidence}
                      onToggle={handleToggle}
                      disabled={isEvidence} // Only disable if already evidence
                    />
                  </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default InterrogationDialogueChunk;
