/**
 * @file ObjectCard.tsx
 * @description Renders the detailed view for a single object. This component is now fully data-driven,
 * rendering its sidebar actions dynamically based on the object's `components` array and the central
 * `componentRegistry`. The core gameplay loop of adding an item to the timeline is initiated here.
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StoryObject, PlayerAction, DataComponent, PurchaseInfo, Interaction } from '../../types';
import { addToTimeline, removeFromTimeline, selectTimeSpent } from '../../store/storySlice';
import { AppDispatch, RootState } from '../../store';
import { goBack, showModal, checkMilestoneProgress, addNewlyAddedEvidenceId } from '../../store/uiSlice';
import ImageWithLoader from '../molecules/ImageWithLoader';
import ToggleButton from '../atoms/ToggleButton';
import BackButton from '../atoms/BackButton';
import SidebarActionButton from '../atoms/SidebarActionButton';
import { useADA } from '../../hooks/useADA';
import { useCardImage } from '../../hooks/useCardImage';
import { useUnlockSystem } from '../../hooks/useUnlockSystem';
import { COMPONENT_REGISTRY } from './componentRegistry';
import RarityBadge from '../molecules/RarityBadge';
import { Hourglass } from 'lucide-react';
import SparkleEffect from '../atoms/SparkleEffect';
import { RARITY_CONFIG } from '../../config';

const ObjectCard: React.FC<{ object: StoryObject }> = ({ object }) => {
  const dispatch = useDispatch<AppDispatch>();
  const triggerADA = useADA();
  const timeSpent = useSelector((state: RootState) => selectTimeSpent(state));
  const { handleEvidenceTap } = useUnlockSystem();
  // Derive whether this object is currently on the timeline from the store
  const isOnTimelineFromStore = useSelector((state: RootState) => !!state.story.evidence?.some(e => e.cardId === object.id));
  
  // No longer checking for affordability as there is no limit to time spent.

  const handleGoBack = () => {
    dispatch(goBack());
  };
  
  /**
   * --- Core Gameplay Loop & Encapsulated User Flow ---
   * This function handles adding/removing an item from the evidence timeline.
   * On first add, it triggers the new Rarity Reveal modal.
   * @param {boolean} isAdding - True if the item is being added to the timeline.
   */
  const handleEvidenceToggle = (isAdding: boolean) => {
    // Use live store state to determine if it's currently on the timeline
    const currentlyOn = !!isOnTimelineFromStore;
    if (isAdding) {
      if (currentlyOn) return; // already on timeline, no-op

      const isFirstUnlock = !object.hasBeenUnlocked;
      dispatch(addToTimeline(object.id));
      if (isFirstUnlock) {
        handleEvidenceTap(object.id);
        dispatch(showModal({ type: 'rarityReveal', props: { objectId: object.id } }));
      }
      dispatch(checkMilestoneProgress());
      dispatch(addNewlyAddedEvidenceId(`ev-${object.id}`));
      const actionText = `has added the ${object.name} to the evidence timeline.`;
      triggerADA(PlayerAction.ADD_TO_TIMELINE, actionText, object.imagePrompt);
    } else {
      if (!currentlyOn) return; // nothing to remove
      dispatch(removeFromTimeline(object.id));
      const actionText = `has removed the ${object.name} from the timeline.`;
      triggerADA(PlayerAction.ADD_TO_TIMELINE, actionText, object.imagePrompt);
    }
  };

  /**
   * --- Robust Data Check ---
   * This helper function determines if a component's data is meaningful enough to warrant
   * an active button. It prevents users from opening empty modals. This is a key
   * maintainability improvement, making the UI more resilient to future changes in the data structure.
   * @param comp The data component to check.
   * @returns {boolean} True if the component's data is considered empty or invalid.
   */
  const isDataEmpty = (comp: DataComponent): boolean => {
    if (!comp.props) return true;
    switch (comp.type) {
      case 'purchaseInfo':
        // A PurchaseInfo component is empty if it has no meaningful data points.
        const info = comp.props as PurchaseInfo;
        return !info.brand && !info.model && !info.sku && !info.manufacturer && (!info.receipts || info.receipts.length === 0);
      case 'interaction':
        // An Interaction is not usable without a prompt and a solution.
        const interaction = comp.props as Interaction;
        return !interaction.prompt || !interaction.solution;
      default:
        // For other types, we maintain the original behavior: if props exist, the button is enabled.
        return false;
    }
  };
  
  const colorTreatment = object.isEvidence ? 'selectiveColor' : 'monochrome';
  const { imageUrl, isLoading } = useCardImage(object, colorTreatment);
  const rarityConfig = object.hasBeenUnlocked ? RARITY_CONFIG[object.rarity] : null;

  // Conditionally select which description to show based on whether the object has been unlocked.
  const descriptionToShow = object.hasBeenUnlocked 
    ? object.description 
    : object.unidentifiedDescription || object.description;

  return (
    <div className="w-full h-full flex flex-col bg-black animate-slide-in-bottom">
      <div 
        className="relative w-full h-auto aspect-[3/4] flex-shrink-0 bg-brand-bg rounded-b-lg transition-all duration-500"
        style={{
          border: object.hasBeenUnlocked && rarityConfig ? `4px solid ${rarityConfig.color}` : '4px solid transparent',
          boxShadow: object.hasBeenUnlocked && rarityConfig ? `0 0 15px ${rarityConfig.color}50` : 'none',
        }}
      >
        <header className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent">
          <BackButton onClick={handleGoBack} />
        </header>
        
        <ImageWithLoader imageUrl={imageUrl} isLoading={isLoading} alt={object.name} objectFit="cover" />
        
        {object.hasBeenUnlocked && rarityConfig && (
          <SparkleEffect rarity={object.rarity} />
        )}
        
        {/* --- Core Architectural Pattern: Data-Driven Sidebar Actions --- */}
        {/* Just like the CharacterCard, this card dynamically renders its action buttons
            based on the object's `components` array and the central `COMPONENT_REGISTRY`.
            This makes the UI highly scalable and easy to maintain. */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10 flex flex-col gap-2">
          {object.components.map(component => {
              const registryEntry = COMPONENT_REGISTRY[component.type];
              // Silently ignore if a component type isn't registered, preventing crashes from malformed data.
              if (!registryEntry) return null;
              
              const isDisabled = isDataEmpty(component);
              
              return (
                  <SidebarActionButton
                      key={component.type}
                      label={registryEntry.label}
                      Icon={registryEntry.Icon}
                      onClick={() => {
                        if (registryEntry.modal && !isDisabled) {
                          dispatch(showModal({ type: registryEntry.modal, props: component.props }));
                        }
                      }}
                      disabled={isDisabled}
                  />
              );
          })}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent"></div>
      </div>

      <div className="flex-1 w-full bg-brand-surface p-4 pb-40 overflow-y-auto">
        <h1 className="text-3xl font-oswald text-white uppercase tracking-wider mb-2">{object.name}</h1>
        
        <div className="flex items-center justify-between gap-4 mb-4 bg-black/30 p-3 rounded-lg border border-brand-border">
          <label className="font-oswald text-brand-text uppercase tracking-wider">Add to Timeline</label>
          <div className="flex items-center gap-4">
            {!object.isEvidence && typeof object.timeToAdd === 'number' && object.timeToAdd > 0 && (
                <div className="flex items-center gap-2 text-yellow-400 font-mono text-lg" title={`Time Added: ${object.timeToAdd}`}>
                    <Hourglass size={20} className="animate-sparkle-glow" />
                    <span className="font-bold">{object.timeToAdd}</span>
                </div>
            )}
            <ToggleButton
              accessibleLabel={`Toggle ${object.name} on timeline`}
              toggled={isOnTimelineFromStore}
              onToggle={handleEvidenceToggle}
              disabled={false} // Allow toggling on/off; removal is via the same toggle
            />
          </div>
        </div>
        
        <p className="text-white mb-6 leading-relaxed">{descriptionToShow}</p>
        
        {object.hasBeenUnlocked && (
          <RarityBadge rarity={object.rarity} />
        )}
      </div>
    </div>
  );
};

export default ObjectCard;