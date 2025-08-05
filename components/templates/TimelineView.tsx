/**
 * @file TimelineView.tsx
 * @description The main container component for the "Interactive Case File" feature.
 * It orchestrates the entire puzzle-solving experience, including switching between
 * the workspace and the full timeline view, managing state, and rendering all sub-components.
 */
import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setViewMode,
  setActiveTab,
  setSelectedClueId,
  placeClueInSlot,
  clearLastIncorrectSlot,
  resetInvestigation,
  selectCaseFileState,
  selectClueById,
  selectSlotById,
  selectAllClues,
  selectActiveAnchor,
  selectIsPrimarySlotFilledForActiveAnchor,
  selectIsInvestigationComplete,
  selectSlotEntities,
  selectClueEntities,
  selectUnplacedClues,
} from '../../store/caseFileSlice';
import { showModal } from '../../store/uiSlice';
import { Clue, EvidenceSlot, TimelineAnchor, TimelineAnchorCategory } from '../../types';
import Button from '../atoms/Button';
import { FileCheck, RefreshCw, Eye, Edit } from 'lucide-react';

// --- Sub-Component: ClueCard ---
const ClueCard: React.FC<{ clue: Clue; isSelected: boolean; onClick: () => void; }> = React.memo(({ clue, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'bg-brand-primary/20 border-brand-primary scale-105' : 'bg-brand-surface border-brand-border hover:border-brand-primary/50'}`}
    >
      <p className="text-sm text-white">{clue.text}</p>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${clue.type === 'PRIMARY' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'}`}>{clue.type}</span>
        <span className="text-sm font-mono font-bold text-yellow-400">{clue.points} pts</span>
      </div>
    </div>
));

import EvidencePool from '../molecules/EvidencePool';

// --- Sub-Component: Slot ---
const Slot: React.FC<{ slotId: string; isPrimary?: boolean; isDisabled?: boolean; }> = React.memo(({ slotId, isPrimary = false, isDisabled = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const slot = useSelector((state: RootState) => selectSlotById(state, slotId));
  const placedClue = useSelector((state: RootState) => slot?.placedClueId ? selectClueById(state, slot.placedClueId) : null);
  const { lastIncorrectSlotId } = useSelector(selectCaseFileState);

  const isIncorrect = lastIncorrectSlotId === slotId;
  const animationClass = isIncorrect ? 'animate-shake' : '';

  useEffect(() => {
    if (isIncorrect) {
      const timer = setTimeout(() => dispatch(clearLastIncorrectSlot()), 500);
      return () => clearTimeout(timer);
    }
  }, [isIncorrect, dispatch]);

  const handleClick = () => {
    if (!placedClue && !isDisabled) {
      dispatch(placeClueInSlot({ slotId }));
    }
  };

  const baseClasses = "w-full p-4 rounded-lg transition-all duration-200 border-2 min-h-[80px]";
  const stateClasses = placedClue
    ? `bg-brand-surface border-brand-primary`
    : isDisabled
      ? `bg-black/20 border-brand-border/50 text-brand-text-muted/50 cursor-not-allowed`
      : `bg-black/30 border-dashed border-brand-border hover:border-brand-primary hover:bg-brand-primary/10 cursor-pointer`;
  
  const text = placedClue ? placedClue.text : (isPrimary ? "Place Primary Clue..." : "Place Supporting Clue...");

  return (
    <div onClick={handleClick} className={`${baseClasses} ${stateClasses} ${animationClass}`}>
      <p className={`text-sm ${placedClue ? 'text-white' : 'text-brand-text-muted'}`}>{text}</p>
    </div>
  );
});

// --- Sub-Component: AnchorDisplay ---
const AnchorDisplay: React.FC<{ anchor: TimelineAnchor; }> = React.memo(({ anchor }) => {
  const isPrimaryFilled = useSelector(selectIsPrimarySlotFilledForActiveAnchor);

  return (
    <div className="mt-6">
      <header className="mb-3">
        <h2 className="text-3xl font-oswald text-white uppercase">{anchor.title}</h2>
        <p className="text-brand-text-muted font-mono">{anchor.timeLabel}</p>
      </header>
      <div className="space-y-3">
        <Slot slotId={anchor.primarySlot.slotId} isPrimary />
        {isPrimaryFilled && anchor.supportingSlots.map(slot => (
          <Slot key={slot.slotId} slotId={slot.slotId} />
        ))}
        {!isPrimaryFilled && anchor.supportingSlots.map(slot => (
           <Slot key={slot.slotId} slotId={slot.slotId} isDisabled={true} />
        ))}
      </div>
    </div>
  );
});

// --- Sub-Component: Workspace ---
const Workspace: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeTab } = useSelector(selectCaseFileState);
  const activeAnchor = useSelector(selectActiveAnchor);
  const TABS: TimelineAnchorCategory[] = ['motive', 'opportunity', 'means'];

  return (
    <div className="animate-fade-in">
      <div className="bg-brand-surface/50 p-1 rounded-lg flex space-x-1 border border-brand-border mb-4">
        {TABS.map(tab => (
          <Button
            key={tab}
            onClick={() => dispatch(setActiveTab(tab))}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            className={`flex-1 capitalize ${activeTab !== tab && 'bg-transparent text-brand-text-muted hover:bg-white/10'}`}
          >
            {tab}
          </Button>
        ))}
      </div>
      {activeAnchor && <AnchorDisplay anchor={activeAnchor} />}
    </div>
  );
};

// --- Sub-Component: FullTimeline ---
const FullTimeline: React.FC = React.memo(() => {
    const anchors = useSelector((state: RootState) => state.caseFile.anchors);
    const slots = useSelector(selectSlotEntities);
    const clues = useSelector(selectClueEntities);

    const renderSlot = (slot: EvidenceSlot) => {
        const placedClue = slot.placedClueId ? clues[slot.placedClueId] : null;
        return (
            <div key={slot.slotId} className={`p-3 rounded-lg border-2 ${placedClue ? 'bg-brand-surface border-brand-primary/50' : 'bg-black/30 border-dashed border-brand-border/50'}`}>
                <p className={`text-sm ${placedClue ? 'text-white' : 'text-brand-text-muted'}`}>{placedClue ? placedClue.text : 'Empty Slot'}</p>
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-6 relative">
            <div className="absolute top-12 bottom-12 left-4 w-0.5 bg-brand-border/50"></div>
            {anchors.map(anchor => (
                <div key={anchor.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-primary border-4 border-brand-surface flex items-center justify-center z-10"></div>
                    </div>
                    <div className="flex-1 mt-[-8px]">
                        <h3 className="text-2xl font-oswald uppercase text-white">{anchor.title}</h3>
                        <p className="text-brand-text-muted mb-3">{anchor.timeLabel}</p>
                        <div className="space-y-2">
                           {renderSlot(slots[anchor.primarySlot.slotId]!)}
                           {anchor.supportingSlots.map(s => renderSlot(slots[s.slotId]!))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});


// --- Main Component: TimelineView ---
const TimelineView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { viewMode, score } = useSelector(selectCaseFileState);

  return (
    <div className="p-4 pb-40 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-oswald text-brand-accent uppercase">Case File</h1>
          <p className="text-yellow-400 font-bold font-mono">Score: {score}</p>
        </div>
        <div className="bg-brand-surface p-1 rounded-lg flex space-x-1 border border-brand-border">
          <button onClick={() => dispatch(setViewMode('workspace'))} className={`p-2 rounded-md ${viewMode === 'workspace' ? 'bg-brand-primary text-white' : 'text-brand-text-muted'}`}>
              <Edit size={20} />
          </button>
          <button onClick={() => dispatch(setViewMode('fullTimeline'))} className={`p-2 rounded-md ${viewMode === 'fullTimeline' ? 'bg-brand-primary text-white' : 'text-brand-text-muted'}`}>
              <Eye size={20} />
          </button>
        </div>
      </header>

      {viewMode === 'workspace' ? <Workspace /> : <FullTimeline />}
    </div>
  );
};

export default TimelineView;