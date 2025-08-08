/**
 * @file types.ts
 * @description This file contains all the core type definitions and interfaces used throughout the application.
 * It serves as the single source of truth for the data structures that model the story, characters, objects, and UI state.
 *
 * @architectural_pattern
 * The data model is designed around a **Component-Based Architecture**. Instead of creating monolithic `Character` or
 * `StoryObject` interfaces with dozens of optional properties, we use a flexible `components` array. Each item in
 * this array is a `DataComponent`, which is a self-contained, typed piece of data (e.g., a character's social media feed,
 * an object's purchase history).
 *
 * @pattern_benefits
 * - **Scalability:** To add a new type of clue or interaction (e.g., "email records"), a developer only needs to define
 *   a new props interface (e.g., `EmailProps`) and a new data component type (`{ type: 'email', props: ... } `). No
 *   changes are needed to the core `Character` or `StoryObject` types.
 * - **Decoupling:** The UI can be built to dynamically render features based on the `components` a character has.
 *   This prevents a tight coupling between the data structure and the presentation layer.
 * - **Maintainability:** Data is organized logically. Instead of a flat, confusing object, data is grouped by its
 *   functional domain, making it easier to read, understand, and debug.
 */

/**
 * Defines the types of cards that can be displayed in detail.
 * 'evidenceGroup' is a special container for multiple objects found together.
 * 'collection' is a generic card type for displaying a collection of objects (e.g., phone logs).
 * 'dialogue' is the new unified card type for all interactive conversations (interviews and interrogations).
 */
export type CardType = 'character' | 'object' | 'location' | 'evidenceGroup' | 'socialMediaFeed' | 'mugshot' | 'collection' | 'dialogue';

/**
 * Defines the possible classifications for a piece of evidence.
 */
export type TimelineTag = 'motive' | 'means' | 'opportunity';

/**
 * Defines the rarity tiers for a piece of evidence, using legal terminology.
 * This is central to the new economy and discovery loop.
 */
export type EvidenceRarity = 'irrelevant' | 'circumstantial' | 'material' | 'critical';

/**
 * Represents a clickable area on a location's image that links to another card.
 * These can be defined with static coordinates or be dynamically placed by AI analysis.
 */
export interface Hotspot {
  id: string;
  type?: 'investigate' | 'move'; // The type of interaction, influences the icon. 'investigate' is default.
  coords?: { top: string; left: string; width: string; height: string }; // Optional static coords
  targetCardId: string; // The ID of the card to navigate to
  targetCardType: CardType | 'evidenceGroup'; // Can now point to an evidence group
  label: string; // The text displayed on the hotspot
  aiHint?: string; // An optional hint for the AI to locate the object
}

/**
 * Represents a piece of testimony or a formal statement from a character.
 */
export interface Testimony {
  id: string;
  title: string;
  content: string;
  sourceCharacterId: string;
}

// --- Component-Based Data Model ---
// This is the core of the scalable architecture. Instead of adding properties directly to
// Character or StoryObject, we add `DataComponent`s to their `components` array.

/**
 * A generic data component that can be attached to Characters or Objects.
 * This allows for easy extension without modifying the core types.
 * @template T - The type of the props for this component.
 */
export interface DataComponent<T = any> {
  type: string; // A unique key, e.g., 'socialMedia', 'phoneLog', 'policeFile'.
  props: T;     // The actual data payload for the component.
}

/** Represents a record of a phone call or voicemail. */
export interface PhoneRecord {
  id:string;
  type: 'call' | 'voicemail';
  contactName: string;
  timestamp: string;
  duration?: string;
  audioUrl?: string;
}

/** Represents a CCTV sighting. */
export interface Sighting {
  id: string;
  timestamp: string;
  locationName: string;
  videoUrl: string;
  description: string;
}

/** A single report within a police file. */
export interface PoliceReport {
  id: string;
  type: 'interview' | 'fingerprints' | 'polygraph' | 'mugshot';
  title: string;
  contentUrl: string;
}

/** Purchase information for an object. */
export interface PurchaseInfo {
  brand?: string;
  model?: string;
  sku?: string;
  manufacturer?: string;
  receipts?: { vendor: string; date: string; price: number; imageUrl: string; }[];
}

/** An interactive mini-game for an object. */
export interface Interaction {
  type: 'phone_unlock' | 'safe_crack' | 'computer_login';
  prompt: string;
  solution: string;
}

/** The data revealed when a player finds a critical clue. */
export interface Insight {
    justification: string;
    newLead: string;
}

/** Represents a single line of inquiry for the new interrogation system. */
export interface LineOfInquiryData {
    id: string;
    label: string;
    initialQuestions: string[];
}

/** Represents the static data needed for a suspect interrogation. */
export interface InterrogationData {
    linesOfInquiry: LineOfInquiryData[];
}

/** Represents the data needed to power a unified dialogue module. */
export interface DialogueData {
  mode: 'interview' | 'interrogation';
  buttonText: string;
  persona: string;
  openingStatement?: string; // Optional for interrogations which now start at the select screen
  suggestedQuestions?: string[]; // Optional for interrogations
  slideshowPrompts: string[];
  interrogation?: InterrogationData;
}

/** Represents a single financial transaction. */
export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
}

/** Represents a single bank account. */
export interface BankAccount {
  bankName: string;
  accountType: string;
  accountNumber: string; // Storing last 4 digits
  balance: number;
  recentTransactions: Transaction[];
}

/**
 * Represents a character's official government and financial records.
 */
export interface OfficialRecords {
  driversLicense?: any;
  passport?: any;
  birthCertificate?: any;
  bankRecords?: {
    accounts: BankAccount[];
  };
}

/** Physical characteristics of a character. */
export interface PhysicalCharacteristics {
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  features?: string;
}

// --- Centralized Dialogue Types ---

/** A message sent by the player. */
export interface PlayerMessage {
  sender: 'player';
  text: string;
}

/** An actionable chunk of text from a witness/suspect. */
export interface DialogueChunkData {
  id: string;
  text: string;
  isCriticalClue?: boolean;
  insight?: Insight;
}

/** A full response from a witness/suspect, containing one or more chunks. */
export interface WitnessResponse {
  sender: 'witness';
  chunks: DialogueChunkData[];
}

/**
 * A feedback message from ADA during an interrogation, now integrated into the header.
 * @note This is a transient type for UI state, not part of the persistent ChatMessage log.
 */
export interface ActiveFeedback {
  text: string;
  progressChange: number;
  source: 'question' | 'evidence';
}


/** A union type for all possible message types in the chat log. */
export type ChatMessage = PlayerMessage | WitnessResponse;


// --- Core Data Interfaces ---

/**
 * Represents a character in the story.
 * Note the use of the `components` array for flexible, scalable data storage,
 * which is the cornerstone of the application's data architecture.
 */
export interface Character {
  id:string;
  name: string;
  age: string;
  occupation: string;
  imagePrompt: string;
  description: string;
  role: 'victim' | 'suspect' | 'witness' | 'client';
  isSuspect: boolean;
  connections: {
      relatedPeople: string[];
      knownLocations: string[];
      associatedObjects: string[];
  };
  testimonyIds: string[];
  components: DataComponent[]; // Holds all forensic/digital data components.
}

/**
 * Represents an object in the story.
 * Also uses the scalable `components` array.
 */
export interface StoryObject {
  id: string;
  name: string;
  imagePrompt: string;
  /** The detailed description revealed after the object is turned into evidence. */
  description: string;
  /** A brief, vague description shown before the object is turned into evidence. */
  unidentifiedDescription?: string;
  /** The narrative timestamp of the event this object represents, in ISO 8601 format. */
  timestamp: string;
  isEvidence: boolean;
  assignedToSuspectIds: string[];
  locationFoundId: string;
  /** The rarity classification of the evidence, revealed on unlock. */
  rarity: EvidenceRarity;
  /** New categories to classify objects derived from character components. */
  category?: 'physical' | 'digital' | 'document' | 'phone_log' | 'cctv_sighting' | 'police_file' | 'financial_record' | 'testimony_fragment';
  /** Optional tags to classify the evidence for timeline analysis. */
  tags?: TimelineTag[];
  /** The author, if this object is a post (e.g., social media). */
  authorCharacterId?: string;
  /** The owner, if this object is derived from a character's component (e.g., a phone record). */
  ownerCharacterId?: string;
  /** The amount of time to add to the player's total when this object is turned into evidence. */
  timeToAdd?: number;
  /** Tracks if the object has been unlocked at least once to prevent repeat charges. */
  hasBeenUnlocked?: boolean;
  /** Unlocks that are triggered when this object is interacted with. */
  unlocks?: Unlock[];
  components: DataComponent[]; // Holds all historical/forensic data components.
}

/**
 * Represents a location in the story.
 */
export interface Location {
  id: string;
  name: string;
  imagePrompt: string;
  description: string;
  hotspots: Hotspot[];
  mapCoords: { top: string; left: string; };
  lastEventTimestamp: string;
  lastEventDescription: string;
  sceneSummary?: string;
  isInternal?: boolean; // Flag to indicate if the location is an internal room and shouldn't appear on the main map.
}

/**
 * Represents a collection of evidence found together, like the contents of a desk.
 * This is a "container" card type that enhances discovery by grouping related objects.
 */
export interface EvidenceGroup {
  id: string;
  name: string;
  imagePrompt: string;
  description: string;
  objectIds: string[]; // IDs of the StoryObjects found in this group.
}

/**
 * Represents an item collected for the evidence timeline.
 */
export interface Evidence {
  id: string;
  cardId: string;
  cardType: CardType;
  name: string;
  imagePrompt: string;
  timestampCollected: string;
  locationId: string;
  x?: number; // Optional x-coordinate for positioning on the evidence board
  y?: number; // Optional y-coordinate for positioning on the evidence board
}

/**

 * Represents a grouping of related evidence for the timeline view.
 */
export interface EvidenceStack {
  anchorId: string; // The ID of the primary StoryObject in the stack.
  linkedIds: string[]; // The IDs of related StoryObjects.
  /** The total number of clues this stack can hold. Critical for the "empty slot" UI. */
  totalSlots: number; 
}

/**
 * Represents a single token-earning bounty/mini-game.
 */
export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
}

/**
 * General information about the story.
 */
export interface StoryInfo {
  mapImagePrompt: string;
  mapTitle: string;
  crimeSceneId?: string;
}

/**
 * Represents the ground truth of the crime for evaluation purposes.
 */
export interface CanonicalTimeline {
  culpritId: string;
  keyEvents: { 
    objectId: string; 
    description: string; // The reason this event is critical
  }[];
}

/**
 * Represents the structured result from the AI timeline evaluation.
 */
export interface TimelineEvaluation {
  verdict: 'Case Accepted' | 'Case Weak' | 'Case Rejected';
  score: number; // e.g., 85
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

// --- Interactive Case File Types ---

/** Represents a single piece of evidence for the interactive case file. */
export interface Clue {
  id: string;
  /** The unique key of the event this clue represents. Used for matching with primary slots. */
  eventKey: string;
  /** The text description of the clue. */
  text: string;
  /** The type of clue, which determines where it can be placed. */
  type: 'PRIMARY' | 'SUPPORTING';
  /** The score awarded for correctly placing this clue. */
  points: number;
  /** The category of the clue, used for matching with supporting slots. */
  category: 'motive' | 'opportunity' | 'means';
  /** Optional bonus points awarded, typically for supporting clues. */
  bonusPoints?: number;
}

/** Represents a location on the timeline where a clue can be placed. */
export interface EvidenceSlot {
  /** A unique identifier for the slot. */
  slotId: string;
  /** For primary slots, this is the key of the only clue that can be placed here. */
  correctEventKey?: string;
  /** The ID of the clue that has been placed in this slot, or null if empty. */
  placedClueId: string | null;
}

/** Defines the main sections of the interactive timeline. */
export type TimelineAnchorCategory = 'motive' | 'opportunity' | 'means';

/** Represents a major section of the investigation timeline. */
export interface TimelineAnchor {
  id: TimelineAnchorCategory;
  title: string;
  timeLabel: string;
  /** The main, required slot for this anchor. */
  primarySlot: EvidenceSlot;
  /** Additional slots for supporting evidence, revealed after the primary is filled. */
  supportingSlots: EvidenceSlot[];
}

/** Defines the two main views for the interactive case file. */
export type CaseFileViewMode = 'workspace' | 'fullTimeline';

/** The root data structure for the entire interactive case file puzzle. */
export interface CaseFileData {
  title: string;
  clues: Clue[];
  anchors: TimelineAnchor[];
}

/**
 * Represents an event in the story timeline.
 * Events are separate entities that can be unlocked and placed on the timeline.
 */
export interface StoryEvent {
  id: string;
  name: string;
  imagePrompt: string;
  description: string;
  timestamp: string;
  locationId: string;
  /** The amount of time to add to the player's total when this event is unlocked. */
  timeToAdd?: number;
  /** Tracks if the event has been unlocked at least once to prevent repeat charges. */
  hasBeenUnlocked?: boolean;
  /** The rarity classification of the event. */
  rarity: EvidenceRarity;
  /** Optional tags to classify the event for timeline analysis. */
  tags?: TimelineTag[];
  components: DataComponent[];
}

/**
 * Represents a reference to an entity that can be unlocked.
 */
export interface UnlockReference {
  /** The type of entity being referenced. */
  type: 'location' | 'sublocation' | 'evidence' | 'character' | 'event';
  /** The ID of the referenced entity. */
  ref: string;
}

/**
 * Represents an unlock that can be triggered by interacting with evidence.
 */
export interface Unlock {
  /** The type of unlock (what gets revealed). */
  type: 'location' | 'sublocation' | 'evidence' | 'character' | 'event';
  /** The ID of the entity being unlocked. */
  ref: string;
  /** The amount of time to add when this unlock is triggered. */
  time: number;
}

/**
 * Represents a sublocation within a location.
 */
export interface Sublocation {
  id: string;
  name: string;
  description: string;
  /** The location this sublocation belongs to. */
  locationId: string;
  /** Whether this sublocation is initially visible. */
  isVisible: boolean;
  /** The amount of time to add when this sublocation is unlocked. */
  timeToAdd?: number;
  /** Tracks if the sublocation has been unlocked at least once. */
  hasBeenUnlocked?: boolean;
}

/**
 * The root data structure for an entire story, containing all normalized entities.
 */
export interface StoryData {
  title: string;
  storyInfo: StoryInfo;
  characters: Character[];
  objects: StoryObject[];
  events: StoryEvent[];
  locations: Location[];
  sublocations: Sublocation[];
  evidenceGroups: EvidenceGroup[];
  testimonies: Testimony[];
  canonicalTimeline?: CanonicalTimeline;
  evidenceStacks?: EvidenceStack[];
  bounties: Bounty[];
}

/**
 * Defines the main views the player can navigate between.
 */
export type ViewType = 'people' | 'locations' | 'timeline' | 'card' | 'evidence' | 'tokens';

/**
 * Enumerates player actions for context-aware AI analysis.
 * This provides structured input to the AI assistant.
 */
export enum PlayerAction {
    VIEW_CARD = "is viewing a card",
    VIEW_LIST = "is viewing a list",
    VIEW_SOCIAL_MEDIA_FEED = "is viewing a social media feed",
    TOGGLE_SUSPECT = "has toggled a suspect status",
    ADD_TO_TIMELINE = "has added an item to the evidence timeline",
    ASSIGN_EVIDENCE = "has assigned evidence to a suspect",
    TAP_HOTSPOT = "has tapped a hotspot",
    FILTER_TIMELINE = "is filtering the evidence timeline",
    CREATE_EVIDENCE_FROM_TESTIMONY = "has created a new piece of evidence from a suspect's testimony",
}