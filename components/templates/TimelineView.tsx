/**
 * @file TimelineView.tsx
 * @description The main container component for the "Interactive Case File" feature.
 * It orchestrates the entire puzzle-solving experience, including switching between
 * the workspace and the full timeline view, managing state, and rendering all sub-components.
 */
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectAllCharacters, selectAllObjects, selectImageUrls, queueImageGeneration } from '../../store/storySlice';
import { defaultTimelineConfig, TimelineSlot, TimelineSymbolType } from '../../config/timelineConfig';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Character, StoryObject } from '../../types';
import { useAppDispatch } from '@/hooks/useAppDispatch';

// Define ItemTypes for drag and drop
const ItemTypes = {
  SYMBOL: 'symbol',
};

// Draggable Symbol Component (Person, Item, Event)
interface DraggableSymbolProps {
  id: string;
  type: TimelineSymbolType;
  label: string;
  imageUrl?: string;
}

const DraggableSymbol: React.FC<DraggableSymbolProps> = ({ id, type, label, imageUrl }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SYMBOL,
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const shapeClasses = {
    person: 'rounded-full',
    item: 'rotate-45', // Diamond shape
    event: 'rounded-none', // Square shape
  };

  return (
    <div
      ref={drag}
      className={`relative w-16 h-16 flex items-center justify-center text-white cursor-grab flex-shrink-0
                  ${shapeClasses[type]} ${isDragging ? 'opacity-50' : 'opacity-100'}
                  bg-brand-surface-200 border-2 border-brand-primary-dark shadow-lg overflow-hidden`}
      style={type === 'item' ? { transform: 'rotate(45deg)' } : {}}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={label} className={type === 'item' ? 'w-full h-full object-cover rotate-[-45deg]' : 'w-full h-full object-cover'} />
      ) : (
        <div className={`flex items-center justify-center w-full h-full ${type === 'item' ? 'rotate-[-45deg]' : ''}`}>
          <span className="text-xs text-brand-text-muted text-center p-1">{label.substring(0, 5)}...</span>
        </div>
      )}
      <span className="absolute bottom-[-20px] text-xs text-brand-text-muted">{label}</span>
    </div>
  );
};

// Droppable Slot Component
interface DroppableSlotProps {
  slot: TimelineSlot;
  onDropSymbol: (slotId: string, symbolId: string) => void;
  placedSymbolId?: string;
  symbolImageUrls: { [id: string]: string };
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ slot, onDropSymbol, placedSymbolId, symbolImageUrls }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.SYMBOL,
    canDrop: (item) => item.type === slot.symbolType,
    drop: (item: { id: string; type: TimelineSymbolType }) => onDropSymbol(slot.id, item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;
  const shapeClasses = {
    person: 'rounded-full',
    item: 'rotate-45',
    event: 'rounded-none',
  };

  const placedSymbolImageUrl = placedSymbolId ? symbolImageUrls[placedSymbolId] : undefined;

  return (
    <div
      ref={drop}
      className={`relative w-16 h-16 flex items-center justify-center border-2 border-dashed flex-shrink-0
                  ${shapeClasses[slot.symbolType]}
                  ${isActive ? 'border-green-400 bg-green-400/20' : canDrop ? 'border-brand-border' : 'border-brand-border/50'}
                  ${placedSymbolId ? 'bg-brand-surface-200 border-brand-primary' : 'bg-black/30'} overflow-hidden`}
      style={slot.symbolType === 'item' ? { transform: 'rotate(45deg)' } : {}}
    >
      {placedSymbolImageUrl ? (
        <img src={placedSymbolImageUrl} alt="placed symbol" className={slot.symbolType === 'item' ? 'w-full h-full object-cover rotate-[-45deg]' : 'w-full h-full object-cover'} />
      ) : (
        <div className={`flex items-center justify-center w-full h-full ${slot.symbolType === 'item' ? 'rotate-[-45deg]' : ''}`}>
          <span className="text-brand-text-muted text-xs text-center p-1">Empty</span>
        </div>
      )}
    </div>
  );
};

// Main TimelineView Component
const TimelineView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [timelineSlots, setTimelineSlots] = useState<TimelineSlot[]>(defaultTimelineConfig.slots);

  const allCharacters = useSelector(selectAllCharacters);
  const allObjects = useSelector(selectAllObjects);
  const imageUrls = useSelector(selectImageUrls);

  // Filter characters for persons (excluding victim, as per typical game logic)
  const persons = allCharacters.filter(c => c.role !== 'victim' && c.role !== 'client');
  // Filter objects for items and events based on category or tags
  const items = allObjects.filter(o => o.category === 'physical' || o.category === 'document');
  const events = allObjects.filter(o => o.category === 'cctv_sighting' || o.category === 'testimony_fragment');

  // Queue image generation for all draggable symbols
  React.useEffect(() => {
    [...persons, ...items, ...events].forEach(symbol => {
      if (!imageUrls[symbol.id]) {
        dispatch(queueImageGeneration({
          cardId: symbol.id,
          prompt: symbol.imagePrompt,
          colorTreatment: 'monochrome', // Assuming monochrome for symbols
        }));
      }
    });
  }, [persons, items, events, imageUrls, dispatch]);


  const handleDropSymbol = useCallback((slotId: string, symbolId: string) => {
    setTimelineSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId ? { ...slot, initialSymbolId: symbolId } : slot
      )
    );
  }, []);

  const allSlotsFilled = timelineSlots.every(slot => slot.initialSymbolId !== undefined);

  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col h-full p-4 overflow-y-hidden">
        {/* Top Part: Timeline */}
        <div className="flex-grow bg-brand-surface/20 rounded-lg p-4 mb-4 overflow-x-auto h-0 min-h-0">
          <h2 className="text-2xl font-oswald text-white mb-4">Timeline</h2>
          <div className="relative">
            {/* Time Tick Marks */}
            <div className="flex justify-around mb-4">
              {defaultTimelineConfig.times.map((time) => (
                <div key={time.id} className="text-brand-text-muted text-xs text-center">
                  {time.label}
                </div>
              ))}
            </div>

            {/* Location Lines and Slots */}
            <div className="space-y-6">
              {defaultTimelineConfig.locations.map((location) => (
                <div key={location.id} className="relative flex items-center">
                  <span className="absolute left-0 w-24 text-right pr-4 text-brand-text-muted text-sm">
                    {location.label}
                  </span>
                  <div className="flex-grow border-t border-brand-border ml-28 relative">
                    {timelineSlots
                      .filter(slot => slot.locationId === location.id)
                      .map(slot => {
                        const timeIndex = defaultTimelineConfig.times.findIndex(t => t.id === slot.timeId);
                        const totalTimes = defaultTimelineConfig.times.length;
                        const leftPosition = (timeIndex / (totalTimes - 1)) * 100;
                        return (
                          <div
                            key={slot.id}
                            className="absolute top-1/2 -translate-y-1/2"
                            style={{ left: `${leftPosition}%` }}
                          >
                            <DroppableSlot
                              slot={slot}
                              onDropSymbol={handleDropSymbol}
                              placedSymbolId={slot.initialSymbolId}
                              symbolImageUrls={imageUrls}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Part: Draggable Symbols */}
        <div className="flex-shrink-0 bg-brand-surface/20 rounded-lg p-4">
          <h2 className="text-2xl font-oswald text-white mb-4">Symbols</h2>
          <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden gap-4 p-2">
            {persons.map((p) => (
              <DraggableSymbol key={p.id} id={p.id} type="person" label={p.name} imageUrl={imageUrls[p.id]} />
            ))}
            {items.map((i) => (
              <DraggableSymbol key={i.id} id={i.id} type="item" label={i.name} imageUrl={imageUrls[i.id]} />
            ))}
            {events.map((e) => (
              <DraggableSymbol key={e.id} id={e.id} type="event" label={e.name} imageUrl={imageUrls[e.id]} />
            ))}
          </div>
        </div>

        {/* Accuse Button */}
        <div className="flex-shrink-0 mt-4">
          <button
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-colors
              ${allSlotsFilled ? 'bg-brand-primary hover:bg-brand-primary-dark' : 'bg-gray-600 cursor-not-allowed'}`}
            disabled={!allSlotsFilled}
            onClick={() => alert('Accuse button clicked!')} // Placeholder for now
          >
            Accuse
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default TimelineView;