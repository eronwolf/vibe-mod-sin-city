# Timeline Enhancement System

## Overview

The timeline enhancement system adds a sophisticated unlock mechanism to the game's timeline feature. Timeline symbols (squares for events, diamonds for objects, circles for people) are initially hidden and become visible when evidence is tapped with unlock data.

## Key Features

### 1. **Unlock System**
- Timeline symbols are initially not shown
- Symbols become visible when evidence is tapped with unlock data
- Time is added to player's cumulative time units on first unlock only
- Supports multiple entity types: locations, sublocations, evidence, characters, and events

### 2. **Symbol Types**
- **Squares**: Represent events (new `StoryEvent` entities)
- **Diamonds**: Represent objects/evidence (existing `StoryObject` entities)
- **Circles**: Represent people/characters (existing `Character` entities)

### 3. **Entity Types**

#### StoryEvent
```typescript
interface StoryEvent {
  id: string;
  name: string;
  imagePrompt: string;
  description: string;
  timestamp: string;
  locationId: string;
  timeToAdd?: number;
  hasBeenUnlocked?: boolean;
  rarity: EvidenceRarity;
  tags?: TimelineTag[];
  components: DataComponent[];
}
```

#### Sublocation
```typescript
interface Sublocation {
  id: string;
  name: string;
  description: string;
  locationId: string;
  isVisible: boolean;
  timeToAdd?: number;
  hasBeenUnlocked?: boolean;
}
```

#### Unlock System
```typescript
interface Unlock {
  type: 'location' | 'sublocation' | 'evidence' | 'character' | 'event';
  ref: string;
  time: number;
}
```

## Implementation Details

### 1. **Data Structure**
The unlock system is integrated into the existing `StoryObject` interface:

```typescript
interface StoryObject {
  // ... existing properties
  unlocks?: Unlock[];
}
```

### 2. **Store Integration**
- Added `events` and `sublocations` to Redux store
- Created `unlockEntity` action for handling unlocks
- Added selectors for new entities

### 3. **Hook System**
Created `useUnlockSystem` hook with functions:
- `handleEvidenceTap(objectId)` - Triggers unlocks when evidence is tapped
- `isSymbolVisible(entityId, entityType)` - Checks if symbol should be visible
- `getVisibleTimelineSymbols()` - Returns filtered arrays of visible entities

### 4. **Component Updates**

#### TimelineView
- Filters symbols based on unlock status
- Only shows unlocked symbols in drag-and-drop interface
- Uses `getVisibleTimelineSymbols()` for filtering

#### ObjectCard
- Triggers unlocks when evidence is first tapped
- Calls `handleEvidenceTap()` on first unlock
- Maintains existing rarity reveal functionality

#### TimelineEventCard
- Also triggers unlocks when timeline evidence is tapped
- Ensures unlocks work from both evidence cards and timeline

### 5. **Notification System**
- `UnlockNotification` component shows when new symbols are unlocked
- Auto-hides after 5 seconds
- Shows list of newly unlocked items

## Usage Examples

### Adding Unlock Data to Evidence
```typescript
{
  "id": "obj_tom_body",
  "name": "Tom Trembly's Body",
  "unlocks": [
    {
      "type": "event",
      "ref": "event_tom_murder",
      "time": 20
    },
    {
      "type": "sublocation", 
      "ref": "subloc_tom_body_location",
      "time": 5
    }
  ]
}
```

### Creating Events
```typescript
{
  "id": "event_tom_murder",
  "name": "Tom Trembly Murder",
  "imagePrompt": "A crime scene photo...",
  "description": "Tom Trembly was shot through the heart...",
  "timestamp": "2025-08-13T10:15:00Z",
  "locationId": "loc_mount_tamalpais",
  "timeToAdd": 20,
  "hasBeenUnlocked": false,
  "rarity": "critical",
  "tags": ["means", "opportunity"],
  "components": []
}
```

### Creating Sublocations
```typescript
{
  "id": "subloc_tom_body_location",
  "name": "Tom's Body Location",
  "description": "The exact spot where Tom Trembly's body was found.",
  "locationId": "loc_mount_tamalpais",
  "isVisible": false,
  "timeToAdd": 5,
  "hasBeenUnlocked": false
}
```

## Game Flow

1. **Initial State**: Timeline symbols are hidden
2. **Evidence Discovery**: Player finds and taps evidence
3. **Unlock Trigger**: Evidence unlocks related entities (events, sublocations, etc.)
4. **Symbol Visibility**: Unlocked entities become visible as timeline symbols
5. **Time Addition**: Player's time total increases by unlock amounts
6. **Notification**: Player sees notification of newly unlocked symbols

## Benefits

1. **Progressive Discovery**: Players gradually unlock timeline elements
2. **Strategic Gameplay**: Encourages thorough evidence examination
3. **Visual Feedback**: Clear indication of progress through symbol visibility
4. **Time Economy**: Rewards players with time for discoveries
5. **Scalable**: Easy to add new unlock chains and entities

## Future Enhancements

1. **Unlock Chains**: Complex unlock sequences
2. **Conditional Unlocks**: Unlocks based on multiple evidence pieces
3. **Temporary Unlocks**: Time-limited symbol visibility
4. **Unlock Categories**: Different types of unlock rewards
5. **Achievement System**: Track unlock milestones 