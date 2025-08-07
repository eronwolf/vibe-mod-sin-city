/**
 * @file store/caseFileSlice.ts
 * @description This Redux slice manages all state for the new "Interactive Case File" feature.
 * It's designed to be a self-contained module for the core puzzle gameplay loop.
 */

import { createSlice, PayloadAction, createEntityAdapter, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { loadCaseFileData } from '../services/cartridgeLoader';
import { Clue, EvidenceSlot, CaseFileViewMode, TimelineAnchorCategory, TimelineAnchor } from '../types';
import { RootState } from './index';
import { showModal } from './uiSlice';

// Use entity adapters for efficient, normalized state management of clues and slots.
const cluesAdapter = createEntityAdapter<Clue>();
const slotsAdapter = createEntityAdapter<EvidenceSlot, string>({
  selectId: (slot) => slot.slotId,
});

// Define the shape of the state for this slice.
interface CaseFileState {
  viewMode: CaseFileViewMode;
  activeTab: TimelineAnchorCategory;
  selectedClueId: string | null;
  clues: ReturnType<typeof cluesAdapter.getInitialState>;
  slots: ReturnType<typeof slotsAdapter.getInitialState>;
  anchors: TimelineAnchor[];
  score: number;
  lastIncorrectSlotId: string | null;
}

// Create an empty initial state that will be populated when the cartridge loads
const createEmptyInitialState = (): CaseFileState => {
  return {
    viewMode: 'workspace',
    activeTab: 'motive',
    selectedClueId: null,
    clues: cluesAdapter.getInitialState(),
    slots: slotsAdapter.getInitialState(),
    anchors: [],
    score: 0,
    lastIncorrectSlotId: null,
  };
};

/**
 * Async thunk to load case file data from cartridge
 */
export const loadCaseFileFromCartridge = createAsyncThunk(
  'caseFile/loadCartridge',
  async (cartridgePath: string) => {
    try {
      const caseFileData = await loadCaseFileData(cartridgePath);
      return caseFileData;
    } catch (error) {
      console.error('Failed to load case file data:', error);
      throw error;
    }
  }
);

const initialState: CaseFileState = createEmptyInitialState();

const caseFileSlice = createSlice({
  name: 'caseFile',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<CaseFileViewMode>) {
      state.viewMode = action.payload;
    },
    setActiveTab(state, action: PayloadAction<TimelineAnchorCategory>) {
      state.activeTab = action.payload;
    },
    setSelectedClueId(state, action: PayloadAction<string | null>) {
      state.selectedClueId = action.payload;
    },
    placeClueInSlot(state, action: PayloadAction<{ slotId: string }>) {
      const { slotId } = action.payload;
      const clueId = state.selectedClueId;
      if (!clueId) return;

      const clue = state.clues.entities[clueId];
      const slot = state.slots.entities[slotId];
      const anchor = state.anchors.find(a => a.id === state.activeTab);

      if (!clue || !slot || !anchor) return;

      let isCorrect = false;
      // Placement logic for a PRIMARY clue
      if (clue.type === 'PRIMARY') {
        if (slot.correctEventKey === clue.eventKey) {
          isCorrect = true;
        }
      // Placement logic for a SUPPORTING clue
      } else if (clue.type === 'SUPPORTING') {
        // Must be a supporting slot and the primary must be filled
        const primarySlotFilled = !!state.slots.entities[anchor.primarySlot.slotId]?.placedClueId;
        const isSupportingSlot = anchor.supportingSlots.some(s => s.slotId === slotId);

        if (primarySlotFilled && isSupportingSlot && clue.category === anchor.id) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        slotsAdapter.updateOne(state.slots, { id: slotId, changes: { placedClueId: clueId } });
        // --- BUG FIX ---
        // Do NOT remove the clue from the master list. The evidence pool selector
        // will now filter out placed clues, allowing selectors for slots to still find the clue data.
        // cluesAdapter.removeOne(state.clues, clueId);
        state.score += clue.points + (clue.bonusPoints || 0);
        state.selectedClueId = null;
        state.lastIncorrectSlotId = null;
      } else {
        // Incorrect placement, set the slot ID to trigger shake animation
        state.lastIncorrectSlotId = slotId;
      }
    },
    clearLastIncorrectSlot(state) {
      state.lastIncorrectSlotId = null;
    },
    resetInvestigation(state) {
      // Return to the initial state
      return createInitialState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCaseFileFromCartridge.fulfilled, (state, action) => {
        const caseFileData = action.payload;
        const allSlots = caseFileData.anchors.flatMap(anchor => [anchor.primarySlot, ...anchor.supportingSlots]);
        
        state.clues = cluesAdapter.setAll(cluesAdapter.getInitialState(), caseFileData.clues);
        state.slots = slotsAdapter.setAll(slotsAdapter.getInitialState(), allSlots);
        state.anchors = caseFileData.anchors;
      })
      .addCase(showModal, (state, action) => {
        if (action.payload.type === 'caseSolved') {
          // This is where you could pass final score to the modal if needed
          action.payload.props = { score: state.score };
        }
      });
  }
});

export const {
  setViewMode,
  setActiveTab,
  setSelectedClueId,
  placeClueInSlot,
  clearLastIncorrectSlot,
  resetInvestigation,
} = caseFileSlice.actions;

// --- Base Selectors ---
export const selectCaseFileState = (state: RootState) => state.caseFile;

// --- Entity Selectors ---
export const {
  selectAll: selectAllClues,
  selectById: selectClueById,
  selectEntities: selectClueEntities,
} = cluesAdapter.getSelectors((state: RootState) => state.caseFile.clues);

export const {
  selectAll: selectAllSlots,
  selectById: selectSlotById,
  selectEntities: selectSlotEntities,
} = slotsAdapter.getSelectors((state: RootState) => state.caseFile.slots);

// --- Memoized, Derived Selectors ---
export const selectActiveAnchor = createSelector(
  [(state: RootState) => state.caseFile.anchors, (state: RootState) => state.caseFile.activeTab],
  (anchors, activeTab) => anchors.find(a => a.id === activeTab)
);

export const selectIsPrimarySlotFilledForActiveAnchor = createSelector(
  [selectActiveAnchor, selectSlotEntities],
  (anchor, slots) => {
    if (!anchor) return false;
    return !!slots[anchor.primarySlot.slotId]?.placedClueId;
  }
);

export const selectIsInvestigationComplete = createSelector(
    [selectAllSlots],
    (allSlots) => allSlots.every(slot => !!slot.placedClueId)
);

/**
 * --- NEW SELECTOR FOR BUG FIX ---
 * Selects only the clues that have not yet been placed in any slot.
 * This is used to correctly populate the Evidence Pool.
 */
export const selectUnplacedClues = createSelector(
  [selectAllClues, selectAllSlots],
  (allClues, allSlots) => {
    const placedClueIds = new Set(allSlots.map(slot => slot.placedClueId).filter(Boolean));
    return allClues.filter(clue => !placedClueIds.has(clue.id));
  }
);


export default caseFileSlice.reducer;