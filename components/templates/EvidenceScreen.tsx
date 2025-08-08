import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { selectAllEvidenceWithDetails, selectImageUrls, setEvidencePosition } from '../../store/storySlice';
import { showModal } from '../../store/uiSlice';
import EvidenceSquare from '../atoms/EvidenceSquare';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../../dndTypes';

const EvidenceScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allEvidence = useSelector(selectAllEvidenceWithDetails);
  const imageUrls = useSelector(selectImageUrls);
  const dropRef = React.useRef<HTMLDivElement>(null); // Ref for the drop target

  const handleEvidenceClick = (evidenceId: string) => {
    console.log(`Attempting to show details for evidence: ${evidenceId}`); // Debug log
    const clickedEvidence = allEvidence.find(ev => ev.id === evidenceId);
    if (clickedEvidence && clickedEvidence.details) {
      dispatch(showModal({
        type: 'cardDetail', // Change type to 'cardDetail'
        props: {
          cardType: clickedEvidence.cardType,
          cardId: clickedEvidence.cardId
        }
      }));
    } else {
      console.log(`Could not find details for evidence: ${evidenceId}`); // Debug log
    }
  };

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.EVIDENCE,
    drop: (item: { id: string; x: number; y: number }, monitor) => {
      const clientOffset = monitor.getClientOffset(); // Current mouse position relative to viewport
      const initialClientOffset = monitor.getInitialClientOffset(); // Initial mouse position relative to viewport
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset(); // Initial top-left of the dragged item relative to viewport

      if (!dropRef.current || !clientOffset || !initialClientOffset || !initialSourceClientOffset) return;

      const dropTargetRect = dropRef.current.getBoundingClientRect();

      // Calculate the offset of the mouse pointer within the dragged item
      const offsetX = clientOffset.x - initialClientOffset.x;
      const offsetY = clientOffset.y - initialClientOffset.y;

      // Calculate the new top-left position of the item relative to the drop target
      const newX = (initialSourceClientOffset.x + offsetX) - dropTargetRect.left;
      const newY = (initialSourceClientOffset.y + offsetY) - dropTargetRect.top;

      dispatch(setEvidencePosition({ id: item.id, x: newX, y: newY }));
    },
  }));

  // Connect the drop target ref to the DND system
  drop(dropRef);

  return (
    <div className="p-4 pb-40 h-full overflow-y-auto">
      <h1 className="text-4xl font-oswald text-brand-accent mb-2 uppercase">Evidence</h1>
      <div ref={dropRef} className="relative w-full h-full min-h-[500px] border-2 border-dashed border-brand-border mt-4">
        {allEvidence.map((evidenceItem) => (
          <EvidenceSquare
            key={evidenceItem.id}
            evidenceId={evidenceItem.id}
            title={evidenceItem.name}
            imageUrl={imageUrls[evidenceItem.cardId] || ''}
            onClick={handleEvidenceClick}
            x={evidenceItem.x || 0} // Pass initial x position
            y={evidenceItem.y || 0} // Pass initial y position
          />
        ))}
      </div>
    </div>
  );
};

export default EvidenceScreen;