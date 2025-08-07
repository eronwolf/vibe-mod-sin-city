/**
 * @file services/cartridgeLoader.ts
 * @description Service for loading story cartridges from JSON files and transforming them
 * into the format expected by the Redux store. This replaces the hardcoded TypeScript
 * story data with a flexible JSON-based system.
 */

import { StoryData, Testimony, Hotspot, Character, Location, StoryObject, StoryEvent, Sublocation, EvidenceGroup, DataComponent, CanonicalTimeline, EvidenceStack, EvidenceRarity, Bounty, DialogueData, Insight } from '../types';

/**
 * Interface for the raw JSON cartridge structure
 */
export interface StoryCartridge {
  metadata: {
    storyId: string;
    title: string;
    version: string;
    author: string;
    description: string;
  };
  storyInfo: {
    premise: string;
    theme: string;
    mapTitle: string;
    mapImagePrompt: string;
    crimeSceneId: string;
  };
  introSlideshow: Array<{
    id: string;
    imagePrompt: string;
    narration: string;
  }>;
  characters: Array<{
    id: string;
    name: string;
    age: string;
    role: string;
    occupation: string;
    imagePrompt: string;
    bio: string;
    isSuspect: boolean;
    statement: string;
    components: DataComponent[];
    connections: {
      relatedPeople: string[];
      knownLocations: string[];
      associatedObjects: string[];
    };
  }>;
  locations: Array<{
    id: string;
    name: string;
    imagePrompt: string;
    description: string;
    sceneSummary: string;
    mapCoords: {
      top: string;
      left: string;
    };
    lastEventTimestamp: string;
    lastEventDescription: string;
    isInternal: boolean;
    hotspots: Array<{
      id: string;
      label: string;
      type: string;
      targetCardId: string;
      targetCardType: string;
      aiHint: string;
    }>;
  }>;
  objects: Array<{
    id: string;
    name: string;
    unidentifiedDescription: string;
    category: string;
    locationFoundId: string;
    timestamp: string;
    timeToAdd: number;
    rarity: string;
    imagePrompt: string;
    description: string;
    tags: string[];
    isEvidence: boolean;
    assignedToSuspectIds: string[];
    hasBeenUnlocked: boolean;
    components: DataComponent[];
    unlocks?: Array<{
      type: string;
      ref: string;
      time: number;
    }>;
  }>;
  events: Array<{
    id: string;
    name: string;
    imagePrompt: string;
    description: string;
    timestamp: string;
    locationId: string;
    timeToAdd: number;
    hasBeenUnlocked: boolean;
    rarity: string;
    tags: string[];
    components: DataComponent[];
  }>;
  sublocations: Array<{
    id: string;
    name: string;
    description: string;
    locationId: string;
    isVisible: boolean;
    timeToAdd: number;
    hasBeenUnlocked: boolean;
  }>;
  testimonies: Array<{
    id: string;
    title: string;
    content: string;
    sourceCharacterId: string;
  }>;
  evidenceGroups: EvidenceGroup[];
  bounties: Array<{
    id: string;
    title: string;
    description: string;
    reward: number;
  }>;
  canonicalTimeline: {
    culpritId: string;
    keyEvents: Array<{
      eventId: string;
      timestamp: string;
      description: string;
    }>;
  };
  evidenceStacks: EvidenceStack[];
  caseFile: {
    title: string;
    clues: Array<{
      id: string;
      eventKey: string;
      text: string;
      type: string;
      points: number;
      category: string;
    }>;
    anchors: Array<{
      id: string;
      title: string;
      timeLabel: string;
      primarySlot: {
        slotId: string;
        correctEventKey: string;
        placedClueId: string | null;
      };
      supportingSlots: Array<{
        slotId: string;
        placedClueId: string | null;
      }>;
    }>;
  };
  interviews: {
    [key: string]: {
      suspects?: Array<{
        question: string;
        answer: string;
      }>;
      events?: Array<{
        question: string;
        answer: string;
      }>;
      questions?: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
  characterProfiles: {
    [characterId: string]: {
      basicInfo: {
        name: string;
        age: number;
        role: string;
        ethnicity: string;
        status: string;
        occupation: string;
      };
      physicalProfile: {
        description: string;
        distinguishingFeatures: string;
        behavioralTells: string;
        mannerisms: string;
      };
      voiceTone: {
        style: string;
        notes: string;
      };
    };
  };
  evidenceDetails: {
    [locationId: string]: {
      [evidenceId: string]: {
        type: string;
        description: string;
      };
    };
  };
  gameMechanics: {
    initialPlayerTimeSpent: number;
    milestoneThreshold: number;
    accusationThreshold: number;
    questionTimeAddition: number;
    createTestimonyTimeAddition: number;
  };
}

/**
 * Transforms character data from the cartridge format to the application format
 */
const transformCharacterData = (rawCharacters: any[], allRawObjects: any[], testimonies: Testimony[]): Character[] => {
  return rawCharacters.map((c: any) => {
    const testimonyIds: string[] = [];
    if (c.statement) {
      const testimonyId = `testimony-${c.id}`;
      testimonies.push({
        id: testimonyId,
        title: `Statement from ${c.name}`,
        content: c.statement,
        sourceCharacterId: c.id,
      });
      testimonyIds.push(testimonyId);
    }

    const components: DataComponent[] = c.components || [];
    const physicalChars = components.find(comp => comp.type === 'physicalCharacteristics')?.props;

    // Auto-generate mugshot for suspects with physical characteristics
    if (physicalChars && c.role === 'suspect') {
      const mugshotPrompt = `Mugshot of ${c.name}. Front and side profile view against a height chart. A plaque in front displays their details: Height: ${physicalChars.height}, Weight: ${physicalChars.weight}, Eyes: ${physicalChars.eyes}, Hair: ${physicalChars.hair}. ${physicalChars.features || ''} The style is high-contrast, gritty, Sin City noir. Photorealistic, hyper-detailed, sharp focus.`;
      
      allRawObjects.push({
        id: `obj_mugshot_${c.id}`,
        name: `Booking Photo: ${c.name}`,
        unidentifiedDescription: "An official police booking photo.",
        ownerCharacterId: c.id,
        category: 'police_file',
        locationFoundId: 'loc_police_station',
        timestamp: new Date().toISOString(),
        imagePrompt: mugshotPrompt,
        description: `Official booking photo for ${c.name}.`,
        components: [],
        rarity: 'irrelevant',
        timeToAdd: 0,
      });
    }
    
    // Ensure consistent data components
    const standardComponentTypes = ['socialMedia', 'phoneLog', 'cctv', 'records', 'file', 'purchaseInfo', 'interaction', 'dialogue'];
    standardComponentTypes.forEach(type => {
      const hasComponentData = allRawObjects.some(obj => obj.ownerCharacterId === c.id && obj.category === type) ||
                               allRawObjects.some(obj => obj.authorCharacterId === c.id && type === 'socialMedia');
      
      const hasComponentOnCharacter = components.some(existing => existing.type === type);

      if (hasComponentData && !hasComponentOnCharacter) {
        components.push({ type, props: {} });
      }
    });

    return {
      id: c.id,
      name: c.name,
      age: c.age,
      occupation: c.occupation,
      imagePrompt: c.imagePrompt,
      description: c.bio,
      role: c.role.toLowerCase(),
      isSuspect: c.isSuspect,
      connections: c.connections || { relatedPeople: [], knownLocations: [], associatedObjects: [] },
      testimonyIds,
      components,
    };
  });
};

/**
 * Transforms object data from the cartridge format to the application format
 */
const transformObjectData = (rawObjects: any[]): StoryObject[] => {
  return rawObjects.map((o: any) => ({
    id: o.id,
    name: o.name,
    imagePrompt: o.imagePrompt,
    description: o.description,
    unidentifiedDescription: o.unidentifiedDescription,
    timestamp: o.timestamp,
    isEvidence: o.isEvidence || false,
    assignedToSuspectIds: o.assignedToSuspectIds || [],
    locationFoundId: o.locationFoundId,
    category: o.category || 'physical',
    tags: o.tags || [],
    authorCharacterId: o.authorCharacterId,
    ownerCharacterId: o.ownerCharacterId,
    timeToAdd: o.timeToAdd || 0,
    hasBeenUnlocked: o.hasBeenUnlocked || false,
    rarity: o.rarity as EvidenceRarity || 'irrelevant',
    components: o.components || [],
    unlocks: o.unlocks || [],
  }));
};

/**
 * Transforms location data from the cartridge format to the application format
 */
const transformLocationData = (rawData: any): Location[] => {
  return rawData.locations.map((l: any) => {
    const itemHotspots: Hotspot[] = (l.hotspots || []).map((h: any, index: number) => ({
      id: h.id || `hs-${l.id}-${index}`,
      label: h.label,
      type: h.type || 'investigate',
      targetCardId: h.targetCardId,
      targetCardType: h.targetCardType,
      coords: h.coords,
      aiHint: h.aiHint,
    }));
    
    return {
      id: l.id,
      name: l.name,
      imagePrompt: l.imagePrompt,
      description: l.description,
      hotspots: itemHotspots,
      mapCoords: l.mapCoords || { top: '50%', left: '50%' },
      lastEventTimestamp: l.lastEventTimestamp,
      lastEventDescription: l.lastEventDescription,
      sceneSummary: l.sceneSummary,
      isInternal: l.isInternal || false,
    };
  });
};

/**
 * Transforms event data from the cartridge format to the application format
 */
const transformEventData = (rawEvents: any[]): StoryEvent[] => {
  return rawEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    imagePrompt: e.imagePrompt,
    description: e.description,
    timestamp: e.timestamp,
    locationId: e.locationId,
    timeToAdd: e.timeToAdd || 0,
    hasBeenUnlocked: e.hasBeenUnlocked || false,
    rarity: e.rarity || 'irrelevant',
    tags: e.tags || [],
    components: e.components || [],
  }));
};

/**
 * Transforms sublocation data from the cartridge format to the application format
 */
const transformSublocationData = (rawSublocations: any[]): Sublocation[] => {
  return rawSublocations.map((s: any) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    locationId: s.locationId,
    isVisible: s.isVisible || false,
    timeToAdd: s.timeToAdd || 0,
    hasBeenUnlocked: s.hasBeenUnlocked || false,
  }));
};

/**
 * Transforms bounty data from the cartridge format to the application format
 */
const transformBounties = (rawBounties: any[]): Bounty[] => {
  return rawBounties.map(b => ({
    id: b.id,
    title: b.title,
    description: b.description,
    reward: b.reward,
  }));
};

/**
 * Main function to transform a story cartridge into the application's StoryData format
 */
export const loadStoryCartridge = async (cartridgePath: string): Promise<StoryData> => {
  try {
    // Load the JSON cartridge file
    const response = await fetch(cartridgePath);
    if (!response.ok) {
      throw new Error(`Failed to load cartridge: ${response.statusText}`);
    }
    
    const cartridge: StoryCartridge = await response.json();
    
    const testimonies: Testimony[] = [];
    
    // Transform the data in the correct order
    const objects = transformObjectData(cartridge.objects);
    const characters = transformCharacterData(cartridge.characters, cartridge.objects, testimonies);
    const locations = transformLocationData(cartridge);
    const events = transformEventData(cartridge.events || []);
    const sublocations = transformSublocationData(cartridge.sublocations || []);
    const evidenceGroups: EvidenceGroup[] = cartridge.evidenceGroups || [];
    const bounties = transformBounties(cartridge.bounties || []);
    const canonicalTimeline: CanonicalTimeline | undefined = cartridge.canonicalTimeline;
    const evidenceStacks: EvidenceStack[] | undefined = cartridge.evidenceStacks;

    return {
      title: cartridge.storyInfo.title,
      storyInfo: {
        ...cartridge.storyInfo,
        crimeSceneId: cartridge.storyInfo.crimeSceneId,
      },
      characters,
      objects,
      events,
      locations,
      sublocations,
      evidenceGroups,
      testimonies,
      bounties,
      canonicalTimeline,
      evidenceStacks,
    };
  } catch (error) {
    console.error('Error loading story cartridge:', error);
    throw error;
  }
};

/**
 * Loads the intro slideshow data from a cartridge
 */
export const loadIntroSlideshowData = async (cartridgePath: string) => {
  try {
    const response = await fetch(cartridgePath);
    if (!response.ok) {
      throw new Error(`Failed to load cartridge: ${response.statusText}`);
    }
    
    const cartridge: StoryCartridge = await response.json();
    return cartridge.introSlideshow;
  } catch (error) {
    console.error('Error loading intro slideshow data:', error);
    throw error;
  }
};

/**
 * Loads the case file data from a cartridge
 */
export const loadCaseFileData = async (cartridgePath: string) => {
  try {
    const response = await fetch(cartridgePath);
    if (!response.ok) {
      throw new Error(`Failed to load cartridge: ${response.statusText}`);
    }
    
    const cartridge: StoryCartridge = await response.json();
    return cartridge.caseFile;
  } catch (error) {
    console.error('Error loading case file data:', error);
    throw error;
  }
};

/**
 * Loads interview data from a cartridge
 */
export const loadInterviewData = async (cartridgePath: string) => {
  try {
    const response = await fetch(cartridgePath);
    if (!response.ok) {
      throw new Error(`Failed to load cartridge: ${response.statusText}`);
    }
    
    const cartridge: StoryCartridge = await response.json();
    return cartridge.interviews;
  } catch (error) {
    console.error('Error loading interview data:', error);
    throw error;
  }
}; 