/**
 * @file useUnlockSystem.ts
 * @description Custom hook to handle the unlock system for timeline symbols and entities.
 * This hook manages the visibility and unlocking of timeline symbols based on evidence interactions.
 */

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectAllObjects, selectAllEvents, selectAllSublocations, unlockEntity } from '../store/storySlice';
import { StoryObject, StoryEvent, Sublocation } from '../types';

/**
 * Hook to handle unlocking entities when evidence is tapped.
 * @returns Object with functions to handle unlocking and visibility checks.
 */
export const useUnlockSystem = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allObjects = useSelector(selectAllObjects);
  const allEvents = useSelector(selectAllEvents);
  const allSublocations = useSelector(selectAllSublocations);

  /**
   * Handles unlocking entities when evidence is tapped.
   * @param objectId - The ID of the object being tapped.
   */
  const handleEvidenceTap = (objectId: string) => {
    const object = allObjects.find(obj => obj.id === objectId);
    if (!object || !object.unlocks) return;

    // Process each unlock
    object.unlocks.forEach(unlock => {
      dispatch(unlockEntity({
        type: unlock.type,
        ref: unlock.ref,
        timeToAdd: unlock.time
      }));
    });
  };

  /**
   * Checks if a timeline symbol should be visible based on unlock status.
   * @param entityId - The ID of the entity to check.
   * @param entityType - The type of entity ('character', 'object', 'event').
   * @returns boolean indicating if the symbol should be visible.
   */
  const isSymbolVisible = (entityId: string, entityType: 'character' | 'object' | 'event'): boolean => {
    switch (entityType) {
      case 'character':
        // Characters are always visible
        return true;
      case 'object':
        const object = allObjects.find(obj => obj.id === entityId);
        return object ? object.hasBeenUnlocked || false : false;
      case 'event':
        const event = allEvents.find(evt => evt.id === entityId);
        return event ? event.hasBeenUnlocked || false : false;
      default:
        return false;
    }
  };

  /**
   * Gets all visible timeline symbols for the drag-and-drop interface.
   * @returns Object with filtered arrays of visible entities.
   */
  const getVisibleTimelineSymbols = () => {
    // Filter characters (persons) - always visible
    const persons = allObjects.filter(obj => obj.category === 'character' && obj.hasBeenUnlocked);
    
    // Filter items (evidence objects) - only visible if unlocked
    const items = allObjects.filter(obj => 
      (obj.category === 'physical' || obj.category === 'document') && 
      obj.hasBeenUnlocked
    );
    
    // Filter events - only visible if unlocked
    const events = allEvents.filter(evt => evt.hasBeenUnlocked);

    return { persons, items, events };
  };

  return {
    handleEvidenceTap,
    isSymbolVisible,
    getVisibleTimelineSymbols,
  };
}; 