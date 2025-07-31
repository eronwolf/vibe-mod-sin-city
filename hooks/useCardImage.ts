/**
 * @file hooks/useCardImage.ts
 * @description This custom hook encapsulates the logic for displaying an image for a game card.
 * It checks a Redux-based cache for an existing image URL. If not found, it adds a request
 * to a centralized, sequential queue to be processed, preventing API rate-limiting.
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { queueImageGeneration, processImageGenerationQueue } from '../store/storySlice';
import { Character, StoryObject, Location } from '../types';

// A union type for any card-like object that has an ID and an image prompt.
type Card = (Character | StoryObject | Location | { id: string; imagePrompt: string });

/**
 * A hook to manage fetching and displaying a card's image via a central queue.
 *
 * @param {Card | null} card - The card object (e.g., Character, StoryObject) for which to get an image.
 * @param {'monochrome' | 'selectiveColor' | 'map'} colorTreatment - The desired visual style for the image.
 * @returns {{ imageUrl: string | null, isLoading: boolean }} An object containing the image URL (or null) and a boolean loading state.
 */
export const useCardImage = (
  card: Card | null, 
  colorTreatment: 'monochrome' | 'selectiveColor' | 'map'
) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const imageUrl = useSelector((state: RootState) => (card ? state.story.imageUrls[card.id] : null));
  const isLoadingFromState = useSelector((state: RootState) => (card ? state.story.imageLoading[card.id] : false));

  useEffect(() => {
    // The core logic: dispatch to the queue only if...
    // 1. A valid card with an image prompt is provided.
    // 2. An image URL is NOT already in the cache.
    // 3. The image is NOT already in the process of being loaded.
    if (card && card.imagePrompt && !imageUrl && !isLoadingFromState) {
      dispatch(queueImageGeneration({
          cardId: card.id,
          prompt: card.imagePrompt,
          colorTreatment: colorTreatment
      }));
      // Kick off the queue processor. It has an internal guard to prevent multiple concurrent runs.
      dispatch(processImageGenerationQueue());
    }
  }, [card, imageUrl, isLoadingFromState, colorTreatment, dispatch]);

  const isLoading = isLoadingFromState || (!imageUrl && !!card?.imagePrompt);

  return { imageUrl: imageUrl ?? null, isLoading };
};