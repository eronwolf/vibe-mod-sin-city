import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../../dndTypes';

interface EvidenceSquareProps {
  evidenceId: string;
  title: string;
  imageUrl: string;
  onClick: (evidenceId: string) => void;
  x: number; // Add x-coordinate
  y: number; // Add y-coordinate
}

const EvidenceSquare: React.FC<EvidenceSquareProps> = ({ evidenceId, title, imageUrl, onClick, x, y }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVIDENCE,
    item: { id: evidenceId, x, y, type: ItemTypes.EVIDENCE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`relative w-32 h-32 bg-brand-surface/80 backdrop-blur-md rounded-lg border-2 border-brand-border shadow-lg flex flex-col items-center justify-center cursor-grab ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onClick(evidenceId)} // Direct onClick
      style={{ position: 'absolute', left: x, top: y }}
    >
      <img src={imageUrl} alt={title} className="w-24 h-24 object-cover rounded-md mb-2" />
      <span className="text-white text-sm font-bold text-center px-1">{title}</span>
    </div>
  );
};

export default EvidenceSquare;