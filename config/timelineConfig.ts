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
    { id: 't-3w', label: 'Inciting incident 1', offsetMinutes: -90 },
    { id: 't-2w', label: 'Inciting incident 2', offsetMinutes: -60 },
    { id: 't-1w', label: 'T minus 1 Week', offsetMinutes: -30 },
    { id: 't-1d', label: 'T minus 1 Day', offsetMinutes: 0 },
    { id: 't0', label: 'Time of murder', offsetMinutes: 30 },
    { id: 't+1', label: 'After gunshot', offsetMinutes: 60 },
    { id: 't+1d', label: 'After crime', offsetMinutes: 120}
  ],
  locations: [
    { id: 'loc-trail', label: 'Crime Scene: Trail' },
    { id: 'loc-cliff', label: 'Crime Scene: Cliff' },
    { id: 'loc-open', label: 'Crime Scene: Open Area' },
    { id: 'loc-blind', label: 'Crime Scene: Blind' },
    { id: 'loc-store', label: 'Wild Trail store'},
    { id: 'loc-fair', label: 'County Fair'},
  ],
  slots: [
    { id: 'slot-1', timeId: 't-3w', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-2', timeId: 't-3w', locationId: 'loc-store', symbolType: 'event' },
    { id: 'slot-3', timeId: 't-3w', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-4', timeId: 't-2w', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-5', timeId: 't-2w', locationId: 'loc-store', symbolType: 'event' },
    { id: 'slot-6', timeId: 't-2w', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-7', timeId: 't-2w', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-8', timeId: 't-1w', locationId: 'loc-fair', symbolType: 'person' },
    { id: 'slot-9', timeId: 't-1w', locationId: 'loc-fair', symbolType: 'event' },
    { id: 'slot-10', timeId: 't-1w', locationId: 'loc-fair', symbolType: 'person' },
    { id: 'slot-11', timeId: 't-1d', locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-12', timeId: 't-1d', locationId: 'loc-store', symbolType: 'item' },
    { id: 'slot-13', timeId: 't0',  locationId: 'loc-open', symbolType: 'person' },
    { id: 'slot-14', timeId: 't0',  locationId: 'loc-open', symbolType: 'person' },
    { id: 'slot-15', timeId: 't0',  locationId: 'loc-blind', symbolType: 'person' },
    { id: 'slot-16', timeId: 't0',  locationId: 'loc-blind', symbolType: 'item' },
    { id: 'slot-17', timeId: 't+1',  locationId: 'loc-cliff', symbolType: 'person' },
    { id: 'slot-18', timeId: 't+1',  locationId: 'loc-cliff', symbolType: 'person' },
    { id: 'slot-19', timeId: 't+1',  locationId: 'loc-cliff', symbolType: 'item' },
    { id: 'slot-20', timeId: 't+1',  locationId: 'loc-trail', symbolType: 'person' },
    { id: 'slot-21', timeId: 't+1d',  locationId: 'loc-store', symbolType: 'person' },
    { id: 'slot-22', timeId: 't+1d',  locationId: 'loc-store', symbolType: 'item' },
  ],
};