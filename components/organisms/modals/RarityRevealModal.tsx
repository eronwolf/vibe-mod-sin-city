/**
 * @file RarityRevealModal.tsx
 * @description A modal that provides a dramatic, full-screen "reveal" for newly discovered evidence.
 * It uses a multi-stage animation and rarity-specific styling to create an engaging player experience.
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { hideModal } from '../../../store/uiSlice';
import { selectObjectById } from '../../../store/storySlice';
import { RARITY_CONFIG } from '../../../config';
import ImageWithLoader from '../../molecules/ImageWithLoader';
import Button from '../../atoms/Button';
import { useCardImage } from '../../../hooks/useCardImage';

interface RarityRevealModalProps {
  objectId: string;
}

type RevealStage = 'initial' | 'glowing' | 'revealed';

const RarityRevealModal: React.FC<RarityRevealModalProps> = ({ objectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const object = useSelector((state: RootState) => selectObjectById(state, objectId));
  const [stage, setStage] = useState<RevealStage>('initial');

  const { imageUrl, isLoading } = useCardImage(object, 'selectiveColor');

  useEffect(() => {
    // --- Staged Animation Controller ---
    // This creates a cinematic, multi-stage reveal effect.
    const glowTimer = setTimeout(() => {
      setStage('glowing');
    }, 100); // Start glowing almost immediately.

    const revealTimer = setTimeout(() => {
      setStage('revealed');
    }, 1200); // Reveal the text after the glow animation completes.

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  if (!object) {
    // This can happen briefly as state updates. Render nothing to avoid errors.
    return null;
  }
  
  const config = object?.rarity ? (RARITY_CONFIG[object.rarity] ?? { color: '#888', label: '', flavorText: '', glowClass: '' }) : null;
  // CSS custom property to pass the dynamic glow color to the animation, if available
  const glowStyle = config ? ({ '--glow-color': config.color } as React.CSSProperties) : undefined;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => dispatch(hideModal())}
    >
      <div
        className="relative w-full max-w-sm rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={glowStyle}
      >
        <div 
            className={`w-full h-auto aspect-[3/4] bg-brand-surface rounded-xl border-4 transition-all duration-1000
                ${stage === 'initial' ? 'border-transparent' : config ? `border-[${config.color}]` : 'border-transparent'}
                ${stage === 'glowing' ? 'animate-reveal-glow' : ''}
                ${stage === 'revealed' && config ? config.glowClass : ''}
            `}
        >
          <ImageWithLoader 
            imageUrl={imageUrl} 
            isLoading={isLoading} 
            alt={`Evidence: ${object.name}`} 
            objectFit="cover"
          />
        </div>
        
        {stage === 'revealed' && config && (
            <div className="absolute inset-x-0 bottom-0 text-center p-6 bg-gradient-to-t from-black via-black/90 to-transparent animate-fade-in">
                <div className="flex justify-center mb-2">
                     <div
                        className={`px-4 py-1.5 rounded-full text-lg font-oswald uppercase tracking-widest border-2`}
                        style={{
                            backgroundColor: `${config.color}20`,
                            borderColor: config.color,
                            color: config.color,
                            textShadow: `0 0 8px ${config.color}`,
                        }}
                    >
                        {config.label}
                    </div>
                </div>
                <p className="text-white text-lg drop-shadow-lg mb-4">{config.flavorText}</p>
                <Button onClick={() => dispatch(hideModal())} className="w-full">
                    Continue
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RarityRevealModal;
