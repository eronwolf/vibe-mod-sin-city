/**
 * @file GameScreen.tsx
 * @description This component acts as the main content router for the application.
 * It determines whether to display a list view or a detailed card view based on the current
 * UI state, including the new `EvidenceGroupCard`.
 */

import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import PeopleList from './PeopleList';
import LocationsList from './LocationsList';
import TokensView from './TokensView';
import TimelineView from './TimelineView';
import CharacterCard from '../organisms/CharacterCard';
import ObjectCard from '../organisms/ObjectCard';
import LocationCard from '../organisms/LocationCard';
import EvidenceGroupCard from '../organisms/EvidenceGroupCard';
import SocialMediaFeedCard from '../organisms/SocialMediaFeedCard';
import MugshotCard from '../organisms/MugshotCard';
import CollectionCard from '../organisms/CollectionCard';
import DialogueCard from '../organisms/DialogueCard';
import UnlockNotification from '../molecules/UnlockNotification';
import { useADA } from '../../hooks/useADA';
import { PlayerAction, ViewType, CardType } from '../../types';
import { selectCharacterById, selectLocationById, selectObjectById, selectEvidenceGroupById, setHasDiscoveredPaint } from '../../store/storySlice';

const VIEW_COMPONENTS: { [key in Exclude<ViewType, 'card'>]: React.FC } = {
  people: PeopleList,
  locations: LocationsList,
  timeline: TimelineView,
  tokens: TokensView,
  timeSpent: TokensView, // Assuming TokensView can be used for timeSpent or a new component will be created
};

const GameScreen: React.FC = () => {
  const { activeView, activeCardId, activeCardType, activeCollectionType, activeCollectionTitle } = useSelector((state: RootState) => state.ui);
  const hasDiscoveredPaint = useSelector((state: RootState) => state.story.hasDiscoveredPaint);
  const dispatch = useDispatch<AppDispatch>();
  const triggerADA = useADA();

  const activeCardData = useSelector((state: RootState) => {
    if (!activeCardId || !activeCardType) return null;
    switch(activeCardType) {
        case 'character': return selectCharacterById(state, activeCardId);
        case 'object': return selectObjectById(state, activeCardId);
        case 'location': return selectLocationById(state, activeCardId);
        case 'evidenceGroup': return selectEvidenceGroupById(state, activeCardId);
        // All these cards are associated with a character, so we fetch the character data.
        case 'socialMediaFeed': return selectCharacterById(state, activeCardId);
        case 'mugshot': return selectCharacterById(state, activeCardId);
        case 'collection': return selectCharacterById(state, activeCardId);
        case 'dialogue': return selectCharacterById(state, activeCardId);
        default: return null;
    }
  });
  
  const activeCardInfo = useMemo(() => {
    if (!activeCardData || !activeCardType) return null;
    // Map the card type to its data, ensuring the data is not null
    const cardDataMap: { [key in CardType | 'evidenceGroup' | 'socialMediaFeed' | 'mugshot' | 'collection']?: any } = {
      character: activeCardData,
      object: activeCardData,
      location: activeCardData,
      evidenceGroup: activeCardData,
      socialMediaFeed: activeCardData,
      mugshot: activeCardData,
      collection: activeCardData,
      dialogue: activeCardData,
    };
    const data = cardDataMap[activeCardType];
    return data ? { type: activeCardType, data } : null;
  }, [activeCardData, activeCardType]);

  useEffect(() => {
    if (activeCardInfo && activeCardInfo.type !== 'socialMediaFeed') {
      let isFirstPaintDiscovery = false;
      // --- Immediate State Change for Critical Discoveries ---
      // This is the ideal place to handle state changes that should not be debounced.
      // By dispatching here, we ensure the state is updated instantly when the player views the card,
      // and before the debounced ADA analysis is triggered. This fixes a potential race condition.
      if (activeCardInfo.type === 'object' && activeCardInfo.data.name === 'Fluorescent Paint' && !hasDiscoveredPaint) {
        dispatch(setHasDiscoveredPaint(true));
        isFirstPaintDiscovery = true;
      }

      triggerADA(
        PlayerAction.VIEW_CARD,
        `Player is viewing the card for ${activeCardInfo.data.name}.`,
        activeCardInfo.data.imagePrompt,
        { isFirstPaintDiscovery }
      );
    }
  }, [activeCardInfo, triggerADA, dispatch, hasDiscoveredPaint]);

  const renderContent = () => {
    if (activeView === 'card' && activeCardInfo) {
        switch(activeCardInfo.type) {
            case 'character': return <CharacterCard character={activeCardInfo.data} />;
            case 'object': return <ObjectCard object={activeCardInfo.data} />;
            case 'location': return <LocationCard location={activeCardInfo.data} />;
            case 'evidenceGroup': return <EvidenceGroupCard evidenceGroup={activeCardInfo.data} />;
            case 'socialMediaFeed': return <SocialMediaFeedCard character={activeCardInfo.data} />;
            case 'mugshot': return <MugshotCard character={activeCardInfo.data} />;
            case 'dialogue': return <DialogueCard character={activeCardInfo.data} />;
            case 'collection': 
                if (activeCollectionType && activeCollectionTitle) {
                    return <CollectionCard character={activeCardInfo.data} collectionType={activeCollectionType} title={activeCollectionTitle} />;
                }
                return <div>Invalid collection type.</div>;
            default: return <div>Invalid card type.</div>;
        }
    }
    
    const CurrentView = VIEW_COMPONENTS[activeView as keyof typeof VIEW_COMPONENTS] || PeopleList;
    return <CurrentView />;
  };

  return (
    <div className="h-full w-full relative">
      {renderContent()}
      <UnlockNotification />
    </div>
  );
};

export default GameScreen;