/**
 * @file QuestionSelectView.tsx
 * @description A component that renders the screen for selecting a line of questioning in the new interrogation flow.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectTimeSpent } from '../../store/storySlice';
import { ChevronRight, X, CheckCircle, ShieldQuestion, Hourglass } from 'lucide-react';
import { Character, LineOfInquiryData } from '../../types';
import ImageWithLoader from '../molecules/ImageWithLoader';
import { useCardImage } from '../../hooks/useCardImage';
import { GAME_MECHANICS } from '../../config';
import { daisyTremblyInterview } from '../../data/DaisyTrembly';
import { kermitInterview } from '../../data/Kermit';
import InterviewCard from './InterviewCard';

interface QuestionSelectViewProps {
  character: Character;
  status: Record<string, 'completed'>;
  onEndInterrogation: () => void;
}

const QuestionSelectView: React.FC<QuestionSelectViewProps> = ({ character, status, onEndInterrogation }) => {
  const { imageUrl, isLoading } = useCardImage(character, 'selectiveColor');
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));
  const questionTimeAddition = GAME_MECHANICS.QUESTION_TIME_ADDITION;
  // No longer checking for affordability as there is no limit to time spent.
  //const playerTokens = useSelector((state: RootState) => selectPlayerTokens(state));
  //const questionCost = GAME_MECHANICS.QUESTION_COST;
  //const canAfford = playerTokens >= GAME_MECHANICS.QUESTION_COST;
  const [selectedQuestion, setSelectedQuestion] = React.useState(null);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);

  const renderStatusIcon = (loiId: string) => {
    const loiStatus = status[loiId];
    if (loiStatus === 'completed') {
      return <CheckCircle size={24} className="flex-shrink-0 text-brand-accent" />;
    }
    return <ChevronRight size={24} className="flex-shrink-0" />;
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-brand-bg relative animate-fade-in">
        <button
            onClick={onEndInterrogation}
            className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:bg-brand-primary hover:text-white transition-colors z-10"
            aria-label="End Interrogation"
        >
            <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-border bg-brand-surface mb-3 shadow-lg">
                <ImageWithLoader imageUrl={imageUrl} isLoading={isLoading} alt={character.name} objectFit="cover" />
            </div>
            <h2 className="text-2xl font-oswald text-white uppercase tracking-wider">Interrogation Plan</h2>
            <p className="text-brand-text-muted">Suspect: {character.name}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-brand-surface border border-brand-border flex items-center gap-3 mb-6">
            <ShieldQuestion size={24} className="text-brand-primary flex-shrink-0" />
            <p className="text-sm text-brand-text-muted">
                Choose a line of inquiry to pursue. Each new line adds <span className="text-yellow-400 font-bold">{questionTimeAddition} to time spent</span>.
            </p>
        </div>

        <div className="space-y-3">
            {/* {linesOfInquiry.map((loi) => {
              const loiStatus = status[loi.id];
              const isDisabled = loiStatus === 'completed'; // Only disable if completed
              
              let statusClasses = 'border-brand-border hover:border-brand-primary hover:bg-brand-primary/10';
              if (loiStatus === 'completed') {
                  statusClasses = 'border-brand-accent/50 bg-brand-accent/10 text-brand-accent opacity-70 cursor-default';
              }
              // No longer need to add opacity/cursor-not-allowed for affordability
 */}
            {(character.name === "Daisy Trembly" ? daisyTremblyInterview.suspects : kermitInterview.questions).map((qa, index) => {
              return (
                  <button
                      key={index}
                      onClick={() => {
                        setSelectedQuestion(qa.question);
                        setSelectedAnswer(qa.answer);
                      }}
                      className={`w-full p-4 bg-brand-surface rounded-lg text-left font-oswald uppercase tracking-wider text-lg
                                flex justify-between items-center
                                transition-all duration-200 ease-in-out
                                border-l-4
                                border-brand-border hover:border-brand-primary hover:bg-brand-primary/10`}
                  >
                      <span>{qa.question}</span>
                  </button>
              );
            })}
        </div>
       {/* No longer displaying "Insufficient tokens" message as there is no limit */}
        {selectedQuestion && selectedAnswer && (
          <InterviewCard character={character} question={selectedQuestion} answer={selectedAnswer} />
        )}
    </div>
  );
};

export default QuestionSelectView;
