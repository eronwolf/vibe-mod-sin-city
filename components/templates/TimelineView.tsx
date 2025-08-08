/**
 * @file TimelineView.tsx
 * @description The main container component for the "Interactive Case File" feature.
 * It orchestrates the entire puzzle-solving experience, including switching between
 * the workspace and the full timeline view, managing state, and rendering all sub-components.
 */
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectAllCharacters, selectAllObjects, selectAllEvents, selectImageUrls, queueImageGeneration } from '../../store/storySlice';
import { defaultTimelineConfig, TimelineSlot, TimelineSymbolType } from '../../config/timelineConfig';
import { addToTimeline } from '../../store/storySlice';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Character, StoryObject, StoryEvent } from '../../types';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useUnlockSystem } from '../../hooks/useUnlockSystem';

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
      className={`relative w-20 h-20 flex items-center justify-center text-white cursor-grab flex-shrink-0
                  ${shapeClasses[type]} ${isDragging ? 'opacity-50' : 'opacity-100'}
                  bg-brand-surface-200 border-2 border-brand-primary-dark shadow-lg overflow-hidden`}
      style={type === 'item' ? { transform: 'rotate(45deg)' } : {}}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={label} className={type === 'item' ? 'w-full h-full object-cover rotate-[-45deg]' : 'w-full h-full object-cover'} />
      ) : (
        <div className={`flex items-center justify-center w-full h-full ${type === 'item' ? 'rotate-[-45deg]' : ''}`}>
          <span className="text-xs text-brand-text-muted text-center p-1">{label.substring(0, 6)}...</span>
        </div>
      )}
      <span className="absolute -bottom-6 text-xs text-brand-text-muted text-center w-full truncate">{label}</span>
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
      className={`relative w-20 h-20 flex items-center justify-center border-2 border-dashed flex-shrink-0
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
  const allEvents = useSelector(selectAllEvents);
  const imageUrls = useSelector(selectImageUrls);
  const { getVisibleTimelineSymbols } = useUnlockSystem();

  // Get visible symbols based on unlock status
  const { persons: visiblePersons, items: visibleItems, events: visibleEvents } = getVisibleTimelineSymbols();
  
  // Filter characters for persons (excluding victim, as per typical game logic)
  const persons = allCharacters.filter(c => c.role !== 'victim' && c.role !== 'client');
  // Filter objects for items and events based on category or tags
  const items = allObjects.filter(o => o.category === 'physical' || o.category === 'document');
  const events = allEvents; // Use the actual events from the store

  // Queue image generation for all draggable symbols
  React.useEffect(() => {
    [...visiblePersons, ...visibleItems, ...visibleEvents].forEach(symbol => {
      if (!imageUrls[symbol.id]) {
        dispatch(queueImageGeneration({
          cardId: symbol.id,
          prompt: symbol.imagePrompt,
          colorTreatment: 'monochrome', // Assuming monochrome for symbols
        }));
      }
    });
  }, [visiblePersons, visibleItems, visibleEvents, imageUrls, dispatch]);

  const handleDropSymbol = useCallback((slotId: string, symbolId: string) => {
    setTimelineSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId ? { ...slot, initialSymbolId: symbolId } : slot
      )
    );
    // Attempt to add the dropped symbol to the timeline as a new evidence item.
    // If the symbolId does not correspond to an object in the cartridge, the reducer
    // will safely no-op.
    // This ensures the timeline data stays in sync with the UI interactions.
    // We dispatch after state update to avoid any stale state usage.
    // Access dispatch from outer scope.
    dispatch(addToTimeline(symbolId));
  }, [dispatch]);

  const allSlotsFilled = timelineSlots.every(slot => slot.initialSymbolId !== undefined);

  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col h-full bg-black">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-brand-border">
          <h1 className="text-3xl font-oswald text-white uppercase tracking-wider">Timeline Puzzle</h1>
          <p className="text-brand-text-muted text-sm mt-1">Drag symbols to reconstruct the crime timeline</p>
        </div>

        {/* Main Timeline Area */}
        <div className="flex-1 p-4 overflow-x-auto">
          <div className="h-full bg-brand-surface/10 rounded-lg border border-brand-border p-6" style={{ minWidth: '1200px', width: '1200px' }}>
            {/* Time Labels - Dynamic width based on slots */}
            <div className="flex mb-8 relative">
              <div className="w-32 flex-shrink-0"></div> {/* Spacer for location labels */}
              <div className="flex px-4">
                {defaultTimelineConfig.times.map((time, index) => {
                  // Calculate how many slots exist at this time across all locations
                  const slotsAtThisTime = timelineSlots.filter(slot => slot.timeId === time.id);
                  const maxSlotsAtLocation = Math.max(
                    ...defaultTimelineConfig.locations.map(loc => 
                      timelineSlots.filter(slot => slot.timeId === time.id && slot.locationId === loc.id).length
                    )
                  );
                  
                  // Calculate minimum width needed for this time section
                  const baseWidth = 120; // Base width in pixels
                  const slotWidth = 80; // Width per slot
                  const minWidth = Math.max(baseWidth, maxSlotsAtLocation * slotWidth + 40); // 40px padding
                  
                  return (
                    <div key={time.id} className="text-center flex-shrink-0" style={{ minWidth: `${minWidth}px` }}>
                      <div className="text-brand-text-muted text-xs font-medium mb-2">{time.label}</div>
                      <div className="w-1 h-1 bg-brand-border rounded-full mx-auto"></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="space-y-8">
              {defaultTimelineConfig.locations.map((location) => (
                <div key={location.id} className="flex items-center">
                  {/* Location Label */}
                  <div className="w-32 flex-shrink-0 pr-4">
                    <div className="text-brand-text-muted text-sm font-medium text-right">
                      {location.label}
                    </div>
                  </div>
                  
                  {/* Timeline Line */}
                  <div className="flex-1 relative" style={{ minWidth: '800px' }}>
                    <div className="h-0.5 bg-brand-border relative">
                      {/* Timeline Slots */}
                      {timelineSlots
                        .filter(slot => slot.locationId === location.id)
                        .map((slot) => {
                          const timeIndex = defaultTimelineConfig.times.findIndex(t => t.id === slot.timeId);
                          
                          // Get all slots at this same time and location
                          const slotsAtSameTime = timelineSlots
                            .filter(s => s.locationId === location.id && s.timeId === slot.timeId);
                          
                          // Find this slot's position among slots at the same time
                          const slotIndexAtTime = slotsAtSameTime.findIndex(s => s.id === slot.id);
                          
                          // Calculate position based on time section width
                          let leftOffset = 128 + 16; // Spacer width + padding
                          
                          // Add width of all previous time sections
                          for (let i = 0; i < timeIndex; i++) {
                            const timeId = defaultTimelineConfig.times[i].id;
                            const maxSlotsAtThisTime = Math.max(
                              ...defaultTimelineConfig.locations.map(loc => 
                                timelineSlots.filter(slot => slot.timeId === timeId && slot.locationId === loc.id).length
                              )
                            );
                            const sectionWidth = Math.max(120, maxSlotsAtThisTime * 80 + 40);
                            leftOffset += sectionWidth;
                          }
                          
                          // Add position within current time section
                          const slotSpacing = 90; // spacing between slots
                          leftOffset += 20 + (slotIndexAtTime * slotSpacing); // 20px padding + slot position
                          
                          // Convert to percentage of total container width
                          const containerWidth = 1200;
                          const finalPosition = (leftOffset / containerWidth) * 100;
                          
                          return (
                            <div
                              key={slot.id}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                              style={{ left: `${finalPosition}%` }}
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Symbols Section */}
        <div className="flex-shrink-0 p-4 border-t border-brand-border">
          <div className="bg-brand-surface/10 rounded-lg p-4">
            <h2 className="text-xl font-oswald text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="w-3 h-3 rotate-45 bg-green-500"></span>
              <span className="w-3 h-3 bg-red-500"></span>
              <span className="ml-2">Available Symbols</span>
            </h2>
            
            <div className="flex flex-nowrap overflow-x-auto gap-6 pb-2">
              {visiblePersons.length > 0 && (
                <div className="flex-shrink-0">
                  <h3 className="text-brand-text-muted text-sm font-medium mb-3">People (Circles)</h3>
                  <div className="flex gap-4">
                    {visiblePersons.map((p) => (
                      <DraggableSymbol key={p.id} id={p.id} type="person" label={p.name} imageUrl={imageUrls[p.id]} />
                    ))}
                  </div>
                </div>
              )}
              
              {visibleItems.length > 0 && (
                <div className="flex-shrink-0">
                  <h3 className="text-brand-text-muted text-sm font-medium mb-3">Evidence (Diamonds)</h3>
                  <div className="flex gap-4">
                    {visibleItems.map((i) => (
                      <DraggableSymbol key={i.id} id={i.id} type="item" label={i.name} imageUrl={imageUrls[i.id]} />
                    ))}
                  </div>
                </div>
              )}
              
              {visibleEvents.length > 0 && (
                <div className="flex-shrink-0">
                  <h3 className="text-brand-text-muted text-sm font-medium mb-3">Events (Squares)</h3>
                  <div className="flex gap-4">
                    {visibleEvents.map((e) => (
                      <DraggableSymbol key={e.id} id={e.id} type="event" label={e.name} imageUrl={imageUrls[e.id]} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accuse Button */}
        <div className="flex-shrink-0 p-4">
          <button
            className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-colors
              ${allSlotsFilled ? 'bg-brand-primary hover:bg-brand-primary-dark' : 'bg-gray-600 cursor-not-allowed'}
              ${allSlotsFilled ? 'shadow-lg shadow-brand-primary/20' : ''}`}
            disabled={!allSlotsFilled}
            onClick={() => alert('Accuse button clicked!')} // Placeholder for now
          >
            {allSlotsFilled ? 'Submit Timeline' : 'Complete Timeline to Submit'}
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default TimelineView;