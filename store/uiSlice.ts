/**
 * @file store/uiSlice.ts
 * @description This Redux slice manages the state of the user interface.
 * It handles tracking the active view, the currently selected card, navigation history, active modals,
 * and complex UI flows like the timeline slideshow.
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ViewType, CardType } from '../types';
import { AppDispatch, RootState } from './index';

/**
 * Defines the possible types of modals that can be displayed.
 * This union type is used to control which modal is currently active.
 */
export type ModalType =
  | 'purchaseInfo'
  | 'card'
  | 'cardDetail' // Add 'cardDetail' to ModalType and remove 'detail'
  | 'interaction'
  | 'assignSuspect'
  | 'introSlideshow'
  | 'ada'
  | 'accusation'
  | 'rarityReveal'
  | 'phaseComplete'
  | 'insightUnlocked'
  | 'caseSolved';

interface HistoryEntry {
  view: ViewType;
  cardId: string | null;
  cardType: CardType | 'evidenceGroup' | 'socialMediaFeed' | 'mugshot' | 'collection' | null;
  collectionType?: string;
  collectionTitle?: string;
}

interface UiState {
  activeView: ViewType;
  activeCardId: string | null;
  activeCardType: CardType | 'evidenceGroup' | 'socialMediaFeed' | 'mugshot' | 'collection' | null;
  activeCollectionType: string | null;
  activeCollectionTitle: string | null;
  history: HistoryEntry[];
  activeModal: ModalType | null;
  // --- Developer Note on `activeModalProps: any` ---
  // The `any` type is used here deliberately to create a flexible modal system.
  // Each modal can have its own unique set of props. While this sacrifices some
  // compile-time type safety, it provides significant architectural flexibility,
  // allowing new modals with different props to be added without changing this
  // core state definition. This is a common and accepted trade-off for this pattern.
  activeModalProps: any | null;
  locationsView: 'map' | 'list';
  visitedLocationIds: string[];
  introPlayed: boolean; // Flag to track if the intro has been played
  timelineMessages: string[]; // Holds messages for the timeline notification system
  newlyAddedEvidenceIds: string[]; // Holds IDs of new evidence for the "arrival" animation
}

const initialState: UiState = {
  activeView: 'locations',
  activeCardId: null,
  activeCardType: null,
  activeCollectionType: null,
  activeCollectionTitle: null,
  history: [],
  activeModal: null,
  activeModalProps: null,
  locationsView: 'map',
  visitedLocationIds: [],
  // Initialize 'introPlayed' from localStorage to ensure it persists across sessions.
  introPlayed: typeof window !== 'undefined' ? localStorage.getItem('introPlayed') === 'true' : false,
  timelineMessages: [],
  newlyAddedEvidenceIds: [],
};

/**
 * A list of varied, insightful messages for when the player reaches an evidence milestone.
 * The tone has been updated to better match ADA's analytical personality.
 */
const MILESTONE_MESSAGES = [
  "The evidentiary chain is strengthening. A new pattern is emerging.",
  "Cross-referencing this new data point. The probability matrix is shifting.",
  "A new connection is forming. The picture becomes clearer.",
  "Interesting. This adds a new layer to the sequence of events.",
  "Another piece falls into place. The narrative is sharpening.",
  "This is a significant development. I am recalibrating my analysis."
];

/**
 * An async thunk that checks if a timeline progress milestone has been met.
 * If so, it adds a new insight message to the timeline's notification queue.
 */
export const checkMilestoneProgress = createAsyncThunk<void, void, { dispatch: AppDispatch, state: RootState }>(
  'ui/checkMilestoneProgress',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { evidence, milestoneThreshold } = state.story;
    
    // The count of actual evidence items added by the player (excluding the initial crime).
    const playerEvidenceCount = evidence.filter(e => e.id !== 'ev-initial-crime').length;
    
    // A milestone is crossed on the Nth item (e.g., 3rd, 6th, etc.)
    const justCrossedMilestone = playerEvidenceCount > 0 && playerEvidenceCount % milestoneThreshold === 0;

    if (justCrossedMilestone) {
      const randomMessage = MILESTONE_MESSAGES[Math.floor(Math.random() * MILESTONE_MESSAGES.length)];
      // Dispatch the action to add the message.
      dispatch(uiSlice.actions.addTimelineMessage(randomMessage));
    }
  }
);


const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<ViewType>) {
      if (state.activeView !== action.payload || state.activeCardId !== null) {
        state.history.push({ 
            view: state.activeView, 
            cardId: state.activeCardId, 
            cardType: state.activeCardType,
            collectionType: state.activeCollectionType,
            collectionTitle: state.activeCollectionTitle,
        });
      }
      state.activeView = action.payload;
      state.activeCardId = null;
      state.activeCardType = null;
      state.activeCollectionType = null;
      state.activeCollectionTitle = null;
    },
    setActiveCard(state, action: PayloadAction<{ id: string; type: CardType | 'evidenceGroup' | 'socialMediaFeed' | 'mugshot' | 'collection' | 'dialogue', collectionType?: string; title?: string }>) {
      state.history.push({ 
          view: state.activeView, 
          cardId: state.activeCardId, 
          cardType: state.activeCardType,
          collectionType: state.activeCollectionType,
          collectionTitle: state.activeCollectionTitle,
      });
      state.activeView = 'card';
      state.activeCardId = action.payload.id;
      state.activeCardType = action.payload.type;
      state.activeCollectionType = action.payload.collectionType || null;
      state.activeCollectionTitle = action.payload.title || null;
      
      if (action.payload.type === 'location' && !state.visitedLocationIds.includes(action.payload.id)) {
        state.visitedLocationIds.push(action.payload.id);
      }
    },
    goBack(state) {
      const lastState = state.history.pop();
      if (lastState) {
        state.activeView = lastState.view;
        state.activeCardId = lastState.cardId;
        state.activeCardType = lastState.cardType;
        state.activeCollectionType = lastState.collectionType || null;
        state.activeCollectionTitle = lastState.collectionTitle || null;
      } else {
        // Default fallback if history is empty
        state.activeView = 'locations';
        state.activeCardId = null;
        state.activeCardType = null;
        state.activeCollectionType = null;
        state.activeCollectionTitle = null;
      }
      // Do not close the modal on goBack, allow modals to control their own lifecycle.
    },
    setLocationsView(state, action: PayloadAction<'map' | 'list'>) {
      state.locationsView = action.payload;
    },
    /**
     * Opens a modal and robustly passes its props to the state.
     * This decouples the modal from the component that triggers it.
     */
    showModal(state, action: PayloadAction<{ type: ModalType; props?: any }>) {
      state.activeModal = action.payload.type;
      state.activeModalProps = action.payload.props || null;
    },
    hideModal(state) {
      state.activeModal = null;
      state.activeModalProps = null;
    },
    /**
     * Marks the introductory slideshow as played and saves this preference to localStorage.
     */
    markIntroAsPlayed(state) {
      state.introPlayed = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('introPlayed', 'true');
      }
    },
    addTimelineMessage(state, action: PayloadAction<string>) {
      // Replace existing messages with the new one for a single, dismissible toast.
      state.timelineMessages = [action.payload];
    },
    clearTimelineMessages(state) {
        state.timelineMessages = [];
    },
    /**
     * Adds a newly collected evidence ID to a temporary list.
     * This is used by the timeline to trigger a special "arrival" animation.
     * @param {string} action.payload The ID of the evidence (`ev-someId`).
     */
    addNewlyAddedEvidenceId(state, action: PayloadAction<string>) {
        if (!state.newlyAddedEvidenceIds.includes(action.payload)) {
            state.newlyAddedEvidenceIds.push(action.payload);
        }
    },
    /**
     * Clears the list of newly added evidence IDs.
     * This is called by the timeline after the arrival animation has been shown.
     */
    clearNewlyAddedEvidenceIds(state) {
        state.newlyAddedEvidenceIds = [];
    },
  },
});

export const {
  setActiveView,
  setActiveCard,
  goBack,
  setLocationsView,
  showModal,
  hideModal,
  markIntroAsPlayed,
  addTimelineMessage,
  clearTimelineMessages,
  addNewlyAddedEvidenceId,
  clearNewlyAddedEvidenceIds,
} = uiSlice.actions;

export default uiSlice.reducer;