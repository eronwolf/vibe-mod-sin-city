/**
 * @file components/molecules/ObjectRow.tsx
 * @description A reusable row component for displaying a single object in a list format.
 * This component was extracted from multiple cards to follow the DRY principle.
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { StoryObject } from '../../types';
import { AppDispatch } from '../../store';
import { setActiveCard } from '../../store/uiSlice';
import ImageWithLoader from './ImageWithLoader';
import { useCardImage } from '../../hooks/useCardImage';
import { Hourglass } from 'lucide-react';

const ObjectRow: React.FC<{ object: StoryObject }> = React.memo(({ object }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { imageUrl, isLoading } = useCardImage(object, 'selectiveColor');

    const handleClick = () => {
        dispatch(setActiveCard({ id: object.id, type: 'object' }));
    };

    const descriptionToShow = object.hasBeenUnlocked 
      ? object.description 
      : object.unidentifiedDescription || object.description;

    return (
        <div
            onClick={handleClick}
            className="flex items-center bg-brand-bg p-3 rounded-lg cursor-pointer hover:bg-brand-primary/10 transition-colors duration-200 animate-fade-in border-l-4 border-brand-border hover:border-brand-primary"
        >
            <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4 border border-brand-border bg-black">
                <ImageWithLoader imageUrl={imageUrl} isLoading={isLoading} alt={object.name} objectFit="cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-oswald text-brand-text truncate">{object.name}</h3>
                <p className="text-sm text-brand-text-muted line-clamp-2">{descriptionToShow}</p>
            </div>
        </div>
    )
});

export default ObjectRow;