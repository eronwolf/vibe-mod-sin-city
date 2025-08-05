import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setSelectedClueId,
  clearLastIncorrectSlot,
  resetInvestigation,
  selectCaseFileState,
  selectClueById,
  selectUnplacedClues,
  selectIsInvestigationComplete,
} from '../../store/caseFileSlice';
import { showModal } from '../../store/uiSlice';
import { Clue } from '../../types';
import Button from '../atoms/Button';
import { FileCheck, RefreshCw } from 'lucide-react';

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

// --- Sub-Component: EvidencePool ---
const EvidencePool: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const clues = useSelector(selectUnplacedClues);
  const { selectedClueId } = useSelector(selectCaseFileState);
  const isComplete = useSelector(selectIsInvestigationComplete);

  const handleSolve = () => dispatch(showModal({ type: 'caseSolved' }));
  const handleReset = () => dispatch(resetInvestigation());

  return (
    <div className="mt-8 pt-6 border-t-2 border-brand-border">
      <h3 className="text-2xl font-oswald text-brand-primary mb-4 uppercase">Evidence Pool</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {clues.map(clue => (
          <ClueCard
            key={clue.id}
            clue={clue}
            isSelected={clue.id === selectedClueId}
            onClick={() => dispatch(setSelectedClueId(clue.id === selectedClueId ? null : clue.id))}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSolve} disabled={!isComplete} className="w-full flex items-center justify-center gap-2">
          <FileCheck size={18} /> Solve The Case
        </Button>
        <Button onClick={handleReset} variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <RefreshCw size={18} /> Reset
        </Button>
      </div>
    </div>
  );
});

export default EvidencePool;