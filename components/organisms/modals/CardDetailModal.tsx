import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { CardType } from '../../../types';
import ModalWrapper from './ModalWrapper';
import CharacterCard from '../CharacterCard';
import ObjectCard from '../ObjectCard';
import LocationCard from '../LocationCard';
import EvidenceGroupCard from '../EvidenceGroupCard';
import SocialMediaFeedCard from '../SocialMediaFeedCard';
import MugshotCard from '../MugshotCard';
import CollectionCard from '../CollectionCard';
import DialogueCard from '../DialogueCard';
import { selectCharacterById, selectObjectById, selectLocationById, selectEvidenceGroupById } from '../../../store/storySlice';

interface CardDetailModalProps {
  cardType: CardType;
  cardId: string;
  activeCollectionType?: string | null;
  activeCollectionTitle?: string | null;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ cardType, cardId, activeCollectionType, activeCollectionTitle }) => {
  const activeCardData = useSelector((state: RootState) => {
    if (!cardId || !cardType) return null;
    switch(cardType) {
        case 'character': return selectCharacterById(state, cardId);
        case 'object': return selectObjectById(state, cardId);
        case 'location': return selectLocationById(state, cardId);
        case 'evidenceGroup': return selectEvidenceGroupById(state, cardId);
        case 'socialMediaFeed': return selectCharacterById(state, cardId);
        case 'mugshot': return selectCharacterById(state, cardId);
        case 'collection': return selectCharacterById(state, cardId);
        case 'dialogue': return selectCharacterById(state, cardId);
        default: return null;
    }
  });

  const renderCardContent = () => {
    if (!activeCardData) return <div>Loading...</div>;

    switch(cardType) {
      case 'character': return <CharacterCard character={activeCardData} />;
      case 'object': return <ObjectCard object={activeCardData} />;
      case 'location': return <LocationCard location={activeCardData} />;
      case 'evidenceGroup': return <EvidenceGroupCard evidenceGroup={activeCardData} />;
      case 'socialMediaFeed': return <SocialMediaFeedCard character={activeCardData} />;
      case 'mugshot': return <MugshotCard character={activeCardData} />;
      case 'dialogue': return <DialogueCard character={activeCardData} />;
      case 'collection': 
          if (activeCollectionType && activeCollectionTitle) {
              return <CollectionCard character={activeCardData} collectionType={activeCollectionType} title={activeCollectionTitle} />;
          }
          return <div>Invalid collection type.</div>;
      default: return <div>Invalid card type.</div>;
    }
  };

  return (
    <ModalWrapper>
      {renderCardContent()}
    </ModalWrapper>
  );
};

export default CardDetailModal;