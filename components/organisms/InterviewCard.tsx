import React from 'react';
import { Character } from '../../types';

interface InterviewCardProps {
  character: Character;
  question: string;
  answer: string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ character, question, answer }) => {
  return (
    <div className="bg-brand-surface rounded-lg p-4">
      <h3 className="text-xl font-oswald text-white uppercase tracking-wider">{character.name}</h3>
      <p className="text-brand-text-muted">Question: {question}</p>
      <p className="text-brand-text-muted">Answer: {answer}</p>
    </div>
  );
};

export default InterviewCard;