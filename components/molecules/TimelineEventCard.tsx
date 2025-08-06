/**
 * @file TimelineEventCard.tsx
 * @description Renders a single, interactive evidence card for the main timeline.
 * It supports both a compact and an expanded view to optimize screen space on mobile.
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { selectAllEvidenceWithDetails, selectObjectById } from '../../store/storySlice';
import { setActiveCard } from '../../store/uiSlice';
import ImageWithLoader from './ImageWithLoader';
import { Character, StoryObject, TimelineTag } from '../../types';
import { useCardImage } from '../../hooks/useCardImage';
import { useUnlockSystem } from '../../hooks/useUnlockSystem';
import TagPill from './TagPill';
import { BrainCircuit, Hammer, Clock, ZoomIn } from 'lucide-react';
import Button from '../atoms/Button';
import RarityBadge from './RarityBadge';
import { RARITY_CONFIG } from '../../config';

type EvidenceWithDetails = ReturnType<typeof selectAllEvidenceWithDetails>[0];

const TAG_CONFIG = {
  motive: { Icon: BrainCircuit, label: 'Motive' },
  means: { Icon: Hammer, label: 'Means' },
  opportunity: { Icon: Clock, label: 'Opportunity' },
};

interface TimelineEventCardProps {
    evidence: EvidenceWithDetails;
    isExpanded: boolean;
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = React.memo(({ evidence, isExpanded }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { handleEvidenceTap } = useUnlockSystem();
    const cardData = evidence.details as (Character | StoryObject) | undefined;
    
    // --- Data Fetch & Image Loading ---
    const { imageUrl, isLoading } = useCardImage(cardData ?? null, 'selectiveColor');
    
    const fullObjectData = useSelector((state: RootState) =>
        evidence.cardType === 'object' ? selectObjectById(state, evidence.cardId) : null
    );

    if (!cardData) return null;

    const handleViewDetailsClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the node's expand/collapse toggle
        if (evidence.cardType === 'object') {
            // Trigger unlocks when timeline evidence is tapped
            handleEvidenceTap(evidence.cardId);
            dispatch(setActiveCard({ id: evidence.cardId, type: 'object' }));
        }
    };
    
    const rarityConfig = fullObjectData?.hasBeenUnlocked ? RARITY_CONFIG[fullObjectData.rarity] : null;
    const hasRarity = !!rarityConfig;

    let borderClasses = 'border-2';
    let borderColorStyle = {};

    if (hasRarity) {
        // A slightly thicker border for rarity on the timeline card.
        borderClasses = 'border-[3px]'; 
        borderColorStyle = { borderColor: rarityConfig.color };
    } else {
        borderClasses = `border-2 ${isExpanded ? 'border-brand-primary' : 'border-brand-border hover:border-brand-primary'}`;
    }
    
    const shadowClass = isExpanded ? 'shadow-brand-primary/20' : '';

    // The RarityBadge here is intentionally the small "pill" style for a more compact UI on the timeline.
    const TimelineRarityBadge = () => {
        if (!fullObjectData || !hasRarity) return null;
        const config = RARITY_CONFIG[fullObjectData.rarity];
        return (
             <div
                className={`px-3 py-1 rounded-full text-xs font-bold border animate-fade-in whitespace-nowrap`}
                style={{
                    backgroundColor: `${config.color}20`,
                    borderColor: `${config.color}80`,
                    color: config.color,
                    textShadow: `0 0 5px ${config.color}`,
                }}
                >
                {config.label}
            </div>
        )
    }

    return (
        <div className={`bg-brand-surface rounded-lg shadow-lg w-72 flex-shrink-0 animate-snap-in transition-all duration-300 ${shadowClass} ${borderClasses}`} style={borderColorStyle}>
            <div className="h-48 bg-brand-bg relative">
                <ImageWithLoader imageUrl={imageUrl} isLoading={isLoading} alt={evidence.name} objectFit="cover" />
                {/* Visual indicator for a collapsed (expandable) card */}
                {!isExpanded && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-primary/80 text-white flex items-center justify-center rounded-full text-lg font-bold">
                        +
                    </div>
                )}
            </div>
            <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-oswald text-xl text-brand-text uppercase leading-tight">{evidence.name}</h3>
                    {hasRarity && (
                        <div className="flex-shrink-0">
                            <TimelineRarityBadge />
                        </div>
                    )}
                </div>
                
                {/* --- Compact View --- */}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-brand-text-muted">{new Date(evidence.timestampCollected).toLocaleDateString()}</p>
                    {fullObjectData?.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {fullObjectData.tags.map(tag => {
                          const config = TAG_CONFIG[tag as TimelineTag];
                          return config ? <TagPill key={tag} {...config} /> : null;
                        })}
                      </div>
                    )}
                </div>
                
                {/* --- Expanded View --- */}
                {isExpanded && (
                    <div className="animate-fade-in mt-3 space-y-3">
                        <p className="text-sm text-brand-text mb-2 line-clamp-5">{fullObjectData?.description}</p>
                        {evidence.cardType === 'object' && (
                            <Button 
                                variant="secondary" 
                                className="w-full text-xs flex items-center justify-center gap-1" 
                                onClick={handleViewDetailsClick}
                            >
                                <ZoomIn size={14} />
                                View Details
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default TimelineEventCard;