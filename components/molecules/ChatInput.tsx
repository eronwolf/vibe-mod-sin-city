/**
 * @file ChatInput.tsx
 * @description A component that handles all user input for a chat interface, including free-form text and suggested questions.
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectTimeSpent } from '../../store/storySlice';
import { NotebookPen, Send, ChevronRight, Hourglass } from 'lucide-react';
import Button from '../atoms/Button';
import { GAME_MECHANICS } from '../../config';

interface ChatInputProps {
  suggestedQuestions: string[];
  isAiResponding: boolean;
  onSendMessage: (text: string) => void;
  mode: 'interview' | 'interrogation';
  initialQuestions?: string[] | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ suggestedQuestions, isAiResponding, onSendMessage, mode, initialQuestions }) => {
  const [inputValue, setInputValue] = useState('');
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));
  const questionTimeAddition = GAME_MECHANICS.QUESTION_TIME_ADDITION;
  // No longer checking for affordability as there is no limit to time spent.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAiResponding || !inputValue.trim()) return; // No longer checking for affordability
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestedClick = (question: string) => {
    if (isAiResponding) return; // No longer checking for affordability
    onSendMessage(question);
  };
  
  // A helper to determine if an action should be disabled.
  const isDisabled = isAiResponding; // Only disable if AI is responding

  // Render initial questions if they exist.
  if (initialQuestions) {
    return (
      <div className="p-4 bg-brand-bg border-t-2 border-brand-border space-y-3">
        <h3 className="font-oswald text-brand-primary uppercase tracking-wider text-center">Select Your Opening Question</h3>
        {initialQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(q)} // No need for separate handler
            disabled={isAiResponding} // Initial question doesn't check canAfford, as that was done on LOI select
            className="w-full p-4 bg-brand-surface rounded-lg text-left font-oswald uppercase tracking-wider text-lg
                       flex justify-between items-center
                       transition-all duration-200 ease-in-out 
                       border-l-4 border-brand-border
                       hover:border-brand-primary hover:bg-brand-primary/10
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{q}</span>
            <ChevronRight size={24} className="flex-shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  // Render normal chat input for follow-up questions.
  return (
    <div className="p-4 bg-brand-bg border-t-2 border-brand-border">
      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSuggestedClick(q)}
            disabled={isDisabled}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface rounded-full text-sm text-brand-text-muted hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-brand-surface rounded-full p-1 pl-4 border border-brand-border focus-within:border-brand-primary transition-colors">
          <NotebookPen size={20} className="text-brand-text-muted mr-2 flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={"Enter your question..."} // No longer "Insufficient Tokens"
            disabled={isDisabled}
            className="w-full bg-transparent focus:outline-none text-white placeholder:text-brand-text-muted disabled:opacity-50"
          />
        </div>
        <Button
            type="submit"
            className="w-12 h-12 rounded-full p-0 flex items-center justify-center flex-shrink-0"
            disabled={isDisabled || !inputValue.trim()}
        >
            {isAiResponding ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
                <Send size={20} />
            )}
        </Button>
      </form>
       {/* Persistent Time Addition Indicator */}
       <div className="text-center text-xs text-brand-text-muted mt-2 flex items-center justify-center gap-2">
          <Hourglass size={14} className="text-yellow-400" />
          <span>Time added per question: {questionTimeAddition}</span>
        </div>
    </div>
  );
};

export default ChatInput;