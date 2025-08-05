export interface TimelineTime {
  id: string;
  label: string;
  offsetMinutes: number;
}

export interface TimelineLocation {
  id: string;
  label: string;
}

export type TimelineSymbolType = 'person' | 'item' | 'event';

export interface TimelineSlot {
  id: string;
  timeId: string;
  locationId: string;
  symbolType: TimelineSymbolType;
  initialSymbolId?: string; // Optional: for pre-filled slots
}

export interface TimelineConfig {
  times: TimelineTime[];
  locations: TimelineLocation[];
  slots: TimelineSlot[];
}

export const defaultTimelineConfig: TimelineConfig = {
  times: [
    { id: 't-60', label: '-60 min', offsetMinutes: -60 },
    { id: 't-30', label: '-30 min', offsetMinutes: -30 },
    { id: 't0', label: '0 min (Murder)', offsetMinutes: 0 },
    { id: 't30', label: '+30 min', offsetMinutes: 30 },
    { id: 't60', label: '+60 min', offsetMinutes: 60 },
  ],
  locations: [
    { id: 'loc-living-room', label: 'Living Room' },
    { id: 'loc-kitchen', label: 'Kitchen' },
    { id: 'loc-bedroom', label: 'Bedroom' },
    { id: 'loc-hallway', label: 'Hallway' },
  ],
  slots: [
    { id: 'slot-1', timeId: 't-60', locationId: 'loc-living-room', symbolType: 'person' },
    { id: 'slot-2', timeId: 't-30', locationId: 'loc-kitchen', symbolType: 'item' },
    { id: 'slot-3', timeId: 't0', locationId: 'loc-living-room', symbolType: 'event' },
    { id: 'slot-4', timeId: 't30', locationId: 'loc-bedroom', symbolType: 'person' },
    { id: 'slot-5', timeId: 't60', locationId: 'loc-hallway', symbolType: 'item' },
  ],
};