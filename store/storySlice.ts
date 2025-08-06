/**
 * @file store/storySlice.ts
 * @description This Redux slice manages the core data of the story.
 * It uses Redux Toolkit's `createEntityAdapter` to maintain a normalized state
 * for all primary data types (characters, objects, etc.), which is efficient for data lookups and updates.
 * It also includes a robust, high-performance, concurrent batching system for image generation
 * to prevent API rate limiting while maximizing speed.
 */

import { createSlice, PayloadAction, createSelector, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { storyData } from '../data/hayesValleyStory';
import { Character, StoryObject, StoryEvent, Sublocation, Evidence, CardType, Location, Testimony, StoryInfo, StoryData, EvidenceGroup, CanonicalTimeline, EvidenceStack, Bounty, DialogueChunkData } from '../types';
import { RootState, AppDispatch } from './index';
import { generateImage as generateImageAPI } from '../services/geminiService';
import { dbService, b64toBlob } from '../services/dbService';
import { GAME_MECHANICS, API_CONFIG } from '../config';
import { showModal, checkMilestoneProgress, addNewlyAddedEvidenceId } from './uiSlice';


// --- Image Generation Queue System ---

/** Interface for a single image generation request in the queue. */
interface ImageGenerationRequest {
  cardId: string;
  prompt: string;
  colorTreatment: 'monochrome' | 'selectiveColor' | 'map';
}

/**
 * An async thunk to hydrate the image URL cache from IndexedDB on app startup.
 * This loads previously generated images without needing to call the API again.
 */
export const hydrateImageCache = createAsyncThunk(
  'story/hydrateImageCache',
  async (_, { dispatch, getState }) => {
    try {
      const cachedImages = await dbService.getAllImages();
      const urls: { [id: string]: string } = {};
      const existingUrls = (getState() as RootState).story.imageUrls;

      for (const item of cachedImages) {
        // --- CRITICAL FIX: Idempotent Hydration ---
        // This check prevents a race condition where a pre-existing image URL
        // from the initial state could be overwritten by a new one from IndexedDB,
        // causing a visual "blink". If a URL for this ID already exists in the
        // state, we do not create a new Object URL for it.
        if (existingUrls[item.id]) {
          continue;
        }
        // Create a temporary, memory-efficient URL for the stored Blob.
        urls[item.id] = URL.createObjectURL(item.blob);
      }
      
      if (Object.keys(urls).length > 0) {
        dispatch(storySlice.actions.setImageUrls(urls));
      }
    } catch (error) {
      console.error("Failed to hydrate image cache from IndexedDB:", error);
    }
  }
);

/**
 * @architectural_note
 * This async thunk encapsulates the entire "create evidence from testimony" business logic.
 * By using a thunk, we create a single, dispatchable action that performs multiple state
 * updates (deducts tokens, adds the object, adds to timeline) in an atomic and reusable way.
 * This is a key pattern for keeping component logic simple and state management robust.
 */
export const createEvidenceFromTestimony = createAsyncThunk<
    StoryObject, // This is the type of the fulfilled action's payload
    { chunk: DialogueChunkData; character: Character }, // Arguments passed to the thunk
    { dispatch: AppDispatch, state: RootState } // ThunkAPI types
>(
    'story/createEvidenceFromTestimony',
    (args, { dispatch }) => {
        const { chunk, character } = args;

        // 1. Deduct the token cost for creating the evidence.
        dispatch(addTimeSpent(GAME_MECHANICS.CREATE_TESTIMONY_TIME_ADDITION));

        // 2. Create the new evidence object from the testimony chunk.
        const newEvidenceId = `obj-testimony-${chunk.id}`;
        const newEvidenceObject: StoryObject = {
            id: newEvidenceId,
            name: `Testimony: "${chunk.text.substring(0, 40)}..."`,
            imagePrompt: `A close-up on a police report document. The text "${chunk.text}" is highlighted in red. The style is high-contrast, gritty, Sin City noir.`,
            description: `A piece of testimony from ${character.name} during their interrogation. The statement recorded is: "${chunk.text}"`,
            timestamp: new Date().toISOString(),
            isEvidence: true,
            assignedToSuspectIds: [],
            locationFoundId: 'loc_interrogation_room', // A conceptual location
            rarity: chunk.isCriticalClue ? 'critical' : 'material',
            category: 'testimony_fragment',
            ownerCharacterId: character.id,
            hasBeenUnlocked: true,
            components: [],
        };

        // 3. Add the new object to the normalized `objects` state.
        dispatch(addDynamicObject(newEvidenceObject));
        
        // 4. Add the new object to the `evidence` timeline array.
        dispatch(addToTimeline(newEvidenceObject.id));
        
        // Return the created object so the calling component can react to it if needed.
        return newEvidenceObject;
    }
);


const charactersAdapter = createEntityAdapter<Character>();
const objectsAdapter = createEntityAdapter<StoryObject>();
const eventsAdapter = createEntityAdapter<StoryEvent>();
const locationsAdapter = createEntityAdapter<Location>();
const sublocationsAdapter = createEntityAdapter<Sublocation>();
const evidenceGroupsAdapter = createEntityAdapter<EvidenceGroup>();
const bountiesAdapter = createEntityAdapter<Bounty>();

interface StoryState {
  title: string;
  storyInfo: StoryInfo;
  characters: ReturnType<typeof charactersAdapter.getInitialState>;
  objects: ReturnType<typeof objectsAdapter.getInitialState>;
  events: ReturnType<typeof eventsAdapter.getInitialState>;
  locations: ReturnType<typeof locationsAdapter.getInitialState>;
  sublocations: ReturnType<typeof sublocationsAdapter.getInitialState>;
  evidenceGroups: ReturnType<typeof evidenceGroupsAdapter.getInitialState>;
  bounties: ReturnType<typeof bountiesAdapter.getInitialState>;
  evidence: Evidence[];
  testimonies: Testimony[];
  canonicalTimeline: CanonicalTimeline | null;
  evidenceStacks: EvidenceStack[] | null;
  imageUrls: { [id: string]: string };
  imageLoading: { [id: string]: boolean };
  imageErrors: { [id: string]: boolean };
  imageGenerationQueue: ImageGenerationRequest[];
  isProcessingQueue: boolean;
  hasDiscoveredPaint: boolean; // Tracks if the player has found the key evidence
  timeSpent: number; // The player's accumulated time spent.
  // Configuration for game mechanics. Centralized here for easy balancing.
  milestoneThreshold: number; 
  accusationThreshold: number;
  totalDiscoverableEvidence: number;
  /** A cache for AI-generated hotspot coordinates to prevent re-analysis. */
  dynamicHotspotCoords: { [locationId: string]: { [hotspotId: string]: { x: number; y: number } } };
}

/**
 * An async thunk that processes the image generation queue in concurrent batches.
 * This is a high-performance, balanced approach to image loading. It processes up to
 * a set limit of images in parallel, waits for the batch to complete, then moves to the next.
 * This is significantly faster than a one-by-one queue but still respectful of API rate limits.
 */
export const processImageGenerationQueue = createAsyncThunk(
  'story/processQueue',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;

    // Guard: if another orchestrator is already running, or the queue is empty, exit.
    if (state.story.isProcessingQueue || state.story.imageGenerationQueue.length === 0) {
      return;
    }

    dispatch(storySlice.actions.setIsProcessingQueue(true));

    // This determines how many images can be generated in parallel.
    // This value is now imported from the central config file for easier maintenance.
    const CONCURRENT_REQUEST_LIMIT = API_CONFIG.CONCURRENT_REQUEST_LIMIT; 
    
    // Process batches until the queue is empty.
    while ((getState() as RootState).story.imageGenerationQueue.length > 0) {
        const currentQueue = (getState() as RootState).story.imageGenerationQueue;
        const batch = currentQueue.slice(0, CONCURRENT_REQUEST_LIMIT);

        // Remove the batch from the main queue immediately to prevent reprocessing in case of re-entry.
        dispatch(storySlice.actions.dequeueImageRequests(batch.length));

        const promises = batch.map(async (request) => {
            dispatch(storySlice.actions.setImageLoading({ cardId: request.cardId, isLoading: true }));
            try {
                const imageResult = await generateImageAPI(request.prompt, request.colorTreatment);
                if (imageResult) {
                    const blob = b64toBlob(imageResult.bytes, imageResult.mimeType);
                    await dbService.saveImage(request.cardId, blob);
                    const objectURL = URL.createObjectURL(blob);
                    dispatch(storySlice.actions.setImageUrl({ cardId: request.cardId, imageUrl: objectURL }));
                } else {
                    // **Critical Robustness Improvement**
                    // If image generation fails after retries, we mark it as having an error.
                    // This is essential for preventing preloading screens (like the intro slideshow) from getting stuck indefinitely.
                    dispatch(storySlice.actions.setImageError({ cardId: request.cardId, hasError: true }));
                }
            } catch (error) {
                console.error(`Image generation for ${request.cardId} failed in queue:`, error);
                // On catastrophic error, also mark it as an error to ensure UI can proceed.
                dispatch(storySlice.actions.setImageError({ cardId: request.cardId, hasError: true }));
            } finally {
                dispatch(storySlice.actions.setImageLoading({ cardId: request.cardId, isLoading: false }));
            }
        });

        // Wait for the current batch of parallel requests to finish before starting the next one.
        await Promise.allSettled(promises);
        
        // A small delay between batches is a good practice to avoid overwhelming the API.
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.IMAGE_QUEUE_BATCH_DELAY)); 
    }

    dispatch(storySlice.actions.setIsProcessingQueue(false));
  }
);


const createInitialState = (data: StoryData): StoryState => {
  const victim = data.characters.find(c => c.role === 'victim');
  const crimeScene = data.storyInfo.crimeSceneId ? data.locations.find(l => l.id === data.storyInfo.crimeSceneId) : undefined;
  const initialEvidence: Evidence[] = [];
  const evidenceLocation = crimeScene || (data.locations.length > 0 ? data.locations[0] : undefined);

  if (victim && evidenceLocation) {
    initialEvidence.push({
      id: 'ev-initial-crime',
      cardId: victim.id,
      cardType: 'character',
      name: `The Death of ${victim.name}`,
      imagePrompt: victim.imagePrompt,
      timestampCollected: evidenceLocation.lastEventTimestamp,
      locationId: evidenceLocation.id,
    });
  }

  const baseInitialState: StoryState = {
    title: data.title,
    storyInfo: data.storyInfo,
    characters: charactersAdapter.setAll(charactersAdapter.getInitialState(), data.characters),
    objects: objectsAdapter.setAll(objectsAdapter.getInitialState(), data.objects),
    events: eventsAdapter.setAll(eventsAdapter.getInitialState(), data.events || []),
    locations: locationsAdapter.setAll(locationsAdapter.getInitialState(), data.locations),
    sublocations: sublocationsAdapter.setAll(sublocationsAdapter.getInitialState(), data.sublocations || []),
    evidenceGroups: evidenceGroupsAdapter.setAll(evidenceGroupsAdapter.getInitialState(), data.evidenceGroups),
    bounties: bountiesAdapter.setAll(bountiesAdapter.getInitialState(), data.bounties),
    evidence: initialEvidence,
    testimonies: data.testimonies,
    canonicalTimeline: data.canonicalTimeline || null,
    evidenceStacks: data.evidenceStacks || null,
    imageUrls: {}, // Start with empty URLs, will be hydrated from IndexedDB by a thunk
    imageLoading: {},
    imageErrors: {},
    imageGenerationQueue: [],
    isProcessingQueue: false,
    hasDiscoveredPaint: false,
    timeSpent: GAME_MECHANICS.INITIAL_PLAYER_TIME_SPENT,
    // Centralized game configuration for easier balancing.
    milestoneThreshold: GAME_MECHANICS.MILESTONE_THRESHOLD, 
    accusationThreshold: GAME_MECHANICS.ACCUSATION_THRESHOLD,
    // --- Developer Note on `totalDiscoverableEvidence` ---
    // This calculates the "denominator" for the case progress bar. It's the total number of
    // objects that are considered discoverable evidence by the player.
    // The `!o.authorCharacterId` filter excludes objects that are social media posts, as these are
    // discovered via the character card, not as independent items.
    // The `+ 1` accounts for the initial crime event itself, which is also part of the evidence.
    totalDiscoverableEvidence: data.objects.filter(o => !o.authorCharacterId).length + 1,
    dynamicHotspotCoords: {},
  };

  return baseInitialState;
};

const initialState: StoryState = createInitialState(storyData);

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    toggleSuspect(state, action: PayloadAction<{ id: string; isSuspect: boolean }>) {
      const { id, isSuspect } = action.payload;
      const character = state.characters.entities[id];
      if (character && character.role === 'suspect') {
          charactersAdapter.updateOne(state.characters, { id, changes: { isSuspect } });
      }
    },
    addToTimeline(state, action: PayloadAction<string>) {
      const id = action.payload;
      const item = state.objects.entities[id];
      if (!item || item.isEvidence) return; // Exit if no item or already evidence

      // --- ECONOMY LOGIC REFACTOR ---
      // This logic now correctly handles one-time costs for unlocking evidence.
      
      // Case 1: The item has NEVER been unlocked before. This is its first time on the timeline.
      if (!item.hasBeenUnlocked) {
        const cost = item.timeToAdd ?? 0;
        
        // Time is now added, not deducted, and there is no limit.
        state.timeSpent += cost;
        objectsAdapter.updateOne(state.objects, {
          id,
          changes: {
            isEvidence: true,
            hasBeenUnlocked: true // This is the key change to prevent repeat charges.
          }
        });

      // Case 2: The item HAS been unlocked before but was removed. Re-adding it is free.
      } else {
          objectsAdapter.updateOne(state.objects, { id, changes: { isEvidence: true } });
      }

      // Add to the evidence array (this runs for both new unlocks and re-adds).
      // It's safe because the initial guard checks `item.isEvidence`.
      if (!state.evidence.some(e => e.cardId === id)) {
          const location = state.locations.entities[item.locationFoundId] || Object.values(state.locations.entities)[0];
          if (location) {
              state.evidence.push({
                  id: `ev-${id}`,
                  cardId: item.id,
                  cardType: 'object',
                  name: item.name,
                  imagePrompt: item.imagePrompt,
                  timestampCollected: item.timestamp,
                  locationId: location.id,
              });
          }
      }
    },
    removeFromTimeline(state, action: PayloadAction<string>) {
      const id = action.payload;
      const item = state.objects.entities[id];
      if (item && item.isEvidence) {
        // Note: Tokens are NOT refunded upon removal. This is a design decision.
        objectsAdapter.updateOne(state.objects, { 
          id, 
          changes: { 
            isEvidence: false,
            assignedToSuspectIds: [] 
          } 
        });
        state.evidence = state.evidence.filter(e => e.cardId !== id);
      }
    },
    assignEvidenceToSuspect(state, action: PayloadAction<{ objectId: string; suspectId: string }>) {
      const { objectId, suspectId } = action.payload;
      const object = state.objects.entities[objectId];
      if (object) {
          const assignedIds = object.assignedToSuspectIds.includes(suspectId)
              ? object.assignedToSuspectIds.filter(id => id !== suspectId)
              : [...object.assignedToSuspectIds, suspectId];
          
          objectsAdapter.updateOne(state.objects, { id: objectId, changes: { assignedToSuspectIds: assignedIds } });
      }
    },
    queueImageGeneration(state, action: PayloadAction<ImageGenerationRequest>) {
        const { cardId } = action.payload;
        const isInQueue = state.imageGenerationQueue.some(req => req.cardId === cardId);
        const isAlreadyLoaded = !!state.imageUrls[cardId];
        const isLoading = !!state.imageLoading[cardId];

        // Add to queue only if it's not already loaded, loading, or in the queue.
        if (!isInQueue && !isAlreadyLoaded && !isLoading) {
            state.imageGenerationQueue.push(action.payload);
        }
    },
    dequeueImageRequests(state, action: PayloadAction<number>) {
        state.imageGenerationQueue.splice(0, action.payload);
    },
    setIsProcessingQueue(state, action: PayloadAction<boolean>) {
        state.isProcessingQueue = action.payload;
    },
    setImageLoading(state, action: PayloadAction<{ cardId: string; isLoading: boolean }>) {
        state.imageLoading[action.payload.cardId] = action.payload.isLoading;
    },
    setImageUrl(state, action: PayloadAction<{ cardId: string; imageUrl: string }>) {
        state.imageUrls[action.payload.cardId] = action.payload.imageUrl;
    },
    setImageUrls(state, action: PayloadAction<{ [id: string]: string }>) {
        state.imageUrls = { ...state.imageUrls, ...action.payload };
    },
    setImageError(state, action: PayloadAction<{ cardId: string; hasError: boolean }>) {
        state.imageErrors[action.payload.cardId] = action.payload.hasError;
    },
    setHasDiscoveredPaint(state, action: PayloadAction<boolean>) {
        state.hasDiscoveredPaint = action.payload;
    },
    addDynamicObject(state, action: PayloadAction<StoryObject>) {
        objectsAdapter.addOne(state.objects, action.payload);
    },
    /**
     * A reusable reducer to add time spent to the player's total.
     * @param {number} action.payload The amount of time to add.
     */
    addTimeSpent(state, action: PayloadAction<number>) {
        state.timeSpent += action.payload;
    },
    /**
     * A reusable reducer to subtract time spent from the player's total (e.g., for bounties).
     * @param {number} action.payload The amount of time to subtract.
     */
    subtractTimeSpent(state, action: PayloadAction<number>) {
        state.timeSpent = Math.max(0, state.timeSpent - action.payload);
    },
    /**
     * Caches the AI-generated coordinates for a location's hotspots.
     * @param payload The location ID and the map of hotspot coordinates.
     */
    setDynamicHotspotCoords(state, action: PayloadAction<{ locationId: string; coords: { [hotspotId: string]: { x: number; y: number } } }>) {
        const { locationId, coords } = action.payload;
        state.dynamicHotspotCoords[locationId] = coords;
    },
    unlockEntity(state, action: PayloadAction<{ type: 'location' | 'sublocation' | 'evidence' | 'character' | 'event'; ref: string; timeToAdd: number }>) {
      const { type, ref, timeToAdd } = action.payload;
      
      // Add time to player's total
      state.timeSpent += timeToAdd;
      
      // Handle different entity types
      switch (type) {
        case 'location':
          // Locations are always visible, just track the unlock
          break;
        case 'sublocation':
          const sublocation = state.sublocations.entities[ref];
          if (sublocation && !sublocation.hasBeenUnlocked) {
            sublocationsAdapter.updateOne(state.sublocations, {
              id: ref,
              changes: { isVisible: true, hasBeenUnlocked: true }
            });
          }
          break;
        case 'evidence':
          const object = state.objects.entities[ref];
          if (object && !object.hasBeenUnlocked) {
            objectsAdapter.updateOne(state.objects, {
              id: ref,
              changes: { hasBeenUnlocked: true }
            });
          }
          break;
        case 'character':
          // Characters are always visible, just track the unlock
          break;
        case 'event':
          const event = state.events.entities[ref];
          if (event && !event.hasBeenUnlocked) {
            eventsAdapter.updateOne(state.events, {
              id: ref,
              changes: { hasBeenUnlocked: true }
            });
          }
          break;
      }
    },
  },
});

export const { 
    toggleSuspect, 
    addToTimeline, 
    removeFromTimeline, 
    assignEvidenceToSuspect,
    queueImageGeneration,
    dequeueImageRequests,
    setIsProcessingQueue,
    setImageLoading,
    setImageUrl,
    setImageUrls,
    setImageError,
    setHasDiscoveredPaint,
    addDynamicObject,
    addTimeSpent,
    subtractTimeSpent,
    setDynamicHotspotCoords,
    unlockEntity,
} = storySlice.actions;

// --- Base Selectors ---
export const selectStoryTitle = (state: RootState) => state.story.title;
export const selectStoryInfo = (state: RootState) => state.story.storyInfo;
export const selectEvidence = (state: RootState) => state.story.evidence;
export const selectTestimonies = (state: RootState) => state.story.testimonies;
export const selectImageUrls = (state: RootState) => state.story.imageUrls;
export const selectImageLoading = (state: RootState) => state.story.imageLoading;
export const selectImageErrors = (state: RootState) => state.story.imageErrors;
export const selectImageGenerationQueue = (state: RootState) => state.story.imageGenerationQueue;
export const selectCanonicalTimeline = (state: RootState) => state.story.canonicalTimeline;
export const selectEvidenceStacks = (state: RootState) => state.story.evidenceStacks;
export const selectTimeSpent = (state: RootState) => state.story.timeSpent;
export const selectDynamicHotspotsForLocation = (state: RootState, locationId: string) => state.story.dynamicHotspotCoords[locationId];


// --- Entity Selectors (powered by createEntityAdapter for O(1) lookups) ---
export const {
  selectAll: selectAllCharacters,
  selectById: selectCharacterById,
  selectEntities: selectCharacterEntities,
} = charactersAdapter.getSelectors((state: RootState) => state.story.characters);

export const {
  selectAll: selectAllObjects,
  selectById: selectObjectById,
  selectEntities: selectObjectEntities,
} = objectsAdapter.getSelectors((state: RootState) => state.story.objects);

export const {
  selectAll: selectAllLocations,
  selectById: selectLocationById,
} = locationsAdapter.getSelectors((state: RootState) => state.story.locations);

export const {
  selectAll: selectAllEvents,
  selectById: selectEventById,
} = eventsAdapter.getSelectors((state: RootState) => state.story.events);

export const {
  selectAll: selectAllSublocations,
  selectById: selectSublocationById,
} = sublocationsAdapter.getSelectors((state: RootState) => state.story.sublocations);

export const {
    selectById: selectEvidenceGroupById,
} = evidenceGroupsAdapter.getSelectors((state: RootState) => state.story.evidenceGroups);

export const {
  selectAll: selectBounties,
} = bountiesAdapter.getSelectors((state: RootState) => state.story.bounties);


// --- Memoized, Derived Selectors (for performance via reselect) ---
export const selectVictims = createSelector([selectAllCharacters], (characters) => characters.filter(c => c.role === 'victim'));
export const selectSuspects = createSelector([selectAllCharacters], (characters) => characters.filter(c => c.isSuspect));
export const selectWitnesses = createSelector([selectAllCharacters], (characters) => characters.filter(c => c.role === 'witness'));
export const selectPeople = createSelector([selectAllCharacters], (characters) => characters.filter(c => c.role !== 'victim' && c.role !== 'witness' && !c.isSuspect));

export const selectVisitedLocationIds = (state: RootState) => state.ui.visitedLocationIds;
export const selectVisitedLocations = createSelector(
  [selectAllLocations, selectVisitedLocationIds],
  (allLocations, visitedIds) => allLocations.filter(loc => visitedIds.includes(loc.id))
);

export const selectAllEvidenceWithDetails = createSelector(
  [selectEvidence, selectObjectEntities, selectCharacterEntities],
  (evidence, objectEntities, characterEntities) => {
    return evidence.map(ev => {
      const card = ev.cardType === 'object'
        ? objectEntities[ev.cardId]
        : characterEntities[ev.cardId];
      return { ...ev, details: card };
    }).sort((a, b) => new Date(a.timestampCollected).getTime() - new Date(b.timestampCollected).getTime());
  }
);

export const selectObjectsInGroup = createSelector(
    [selectObjectEntities, (state: RootState, groupId: string) => selectEvidenceGroupById(state, groupId)],
    (objects, group) => {
        if (!group) return [];
        return group.objectIds.map(id => objects[id]).filter(Boolean) as StoryObject[];
    }
);

/**
 * A new selector to get all social media posts (which are now `StoryObject`s) for a given character.
 */
export const selectSocialPostsForCharacter = createSelector(
    [selectAllObjects, (state: RootState, characterId: string) => characterId],
    (allObjects, characterId) => {
        return allObjects.filter(obj => obj.authorCharacterId === characterId)
                         .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
);

/**
 * A new selector to get all objects for a character's component collection view.
 */
export const selectObjectsForCharacterCollection = createSelector(
    [selectAllObjects, (state: RootState, characterId: string) => characterId, (state: RootState, characterId: string, collectionType: string | null) => collectionType],
    (allObjects, characterId, collectionType) => {
        if (!collectionType) return [];
        return allObjects.filter(obj => obj.ownerCharacterId === characterId && obj.category === collectionType)
                         .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
);


export default storySlice.reducer;