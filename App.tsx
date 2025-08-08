/**
 * @file App.tsx
 * @description This file serves as the root of the React application. It embodies several key architectural patterns
 * for a scalable and maintainable frontend.
 *
 * @architectural_overview
 * 1.  **Centralized Layout Composition:** `App.tsx` is responsible for composing the main visual structure of the app,
 *     including the primary content area (`GameScreen`), the navigation (`NavBar`). The global AI assistant button (`ADAFab`) has been removed
 *     to create a more focused experience for the current version.
 *
 * 2.  **State-Driven Modal System:** The component implements a powerful and flexible modal system. Instead of having
 *     components directly toggle modal visibility, they dispatch a `showModal` action to the Redux store with a `type`
 *     and `props`. This `App` component listens to the `activeModal` state and uses a `MODAL_COMPONENTS` registry
 *     (a simple object map) to render the correct modal component with the correct props.
 *
 * @pattern_benefits
 * -   **Decoupling:** Components that trigger modals (e.g., `CharacterCard`) don't need to know about the modal's
 *     implementation details. They only need to know the modal's `type` and what `props` it expects.
 * -   **Scalability:** Adding a new modal to the application is trivial. A developer simply creates the new modal
 *     component, imports it here, and adds a single line to the `MODAL_COMPONENTS` registry. No other part of the
 *     application needs to change.
 * -   **Centralized Control:** All modal presentations are handled in one place, making it easy to manage and debug
 *     modal behavior globally.
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState, AppDispatch } from './store';
import GameScreen from './components/templates/GameScreen';
import NavBar from './components/organisms/NavBar';
import CountdownTimer from './components/molecules/CountdownTimer';

// Import all modal components
import PurchaseInfoModal from './components/organisms/modals/PurchaseInfoModal';
import InteractionModal from './components/organisms/modals/InteractionModal';
import AssignSuspectModal from './components/organisms/AssignSuspectModal';
import ADAModal from './components/organisms/modals/ADAModal';
import AccusationModal from './components/organisms/modals/AccusationModal';
import IntroSlideshowModal from './components/organisms/modals/IntroSlideshowModal';
import RarityRevealModal from './components/organisms/modals/RarityRevealModal';
import PhaseCompleteModal from './components/organisms/modals/PhaseCompleteModal';
import InsightUnlockedModal from './components/organisms/modals/InsightUnlockedModal';
import CaseSolvedModal from './components/organisms/modals/CaseSolvedModal';
import { ModalType, showModal } from './store/uiSlice';
import CardDetailModal from './components/organisms/modals/CardDetailModal'; // Import CardDetailModal
import { 
  hydrateImageCache,
  loadStoryCartridge,
} from './store/storySlice';
import { loadCaseFileFromCartridge } from './store/caseFileSlice';

/**
 * --- Modal Registry Pattern ---
 * @description A mapping of modal types to their corresponding React components.
 * This pattern allows for easy addition of new modals without modifying the core
 * App component logic. To add a new modal, simply import it and add it to this object.
 */
const MODAL_COMPONENTS: { [key in ModalType]?: React.FC<any> } = {
  ada: ADAModal,
  assignSuspect: AssignSuspectModal,
  purchaseInfo: PurchaseInfoModal,
  interaction: InteractionModal,
  accusation: AccusationModal,
  introSlideshow: IntroSlideshowModal,
  rarityReveal: RarityRevealModal,
  phaseComplete: PhaseCompleteModal,
  insightUnlocked: InsightUnlockedModal,
  caseSolved: CaseSolvedModal,
  cardDetail: CardDetailModal, // Add CardDetailModal to the registry
};

/**
 * The main application component, acting as the central orchestrator for the UI.
 * @returns {React.FC} The rendered App component.
 */
const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Select necessary state from the Redux store
  const { activeModal, activeModalProps, introPlayed } = useSelector((state: RootState) => state.ui);
  
  // On initial app load, load the story cartridge, hydrate the image URL cache from IndexedDB and check if the intro should play.
  useEffect(() => {
    // Load the example story cartridge
    dispatch(loadStoryCartridge('./data/cartridges/example-story.json'));
    dispatch(loadCaseFileFromCartridge('./data/cartridges/example-story.json'));
    dispatch(hydrateImageCache());
    if (!introPlayed) {
      dispatch(showModal({ type: 'introSlideshow' }));
    }
  }, [introPlayed, dispatch]);

  /**
   * Renders the currently active modal based on the Redux state.
   * @returns {React.ReactNode | null} The modal component to render, or null if no modal is active.
   */
  const renderModal = () => {
    if (!activeModal) return null;
    
    const ModalComponent = MODAL_COMPONENTS[activeModal];
    if (!ModalComponent) {
      // If a modal is dispatched that isn't in the registry, we warn about it.
      console.warn(`No modal component registered for type: ${activeModal}`);
      return null;
    }

    // --- Data-Driven Props ---
    // The component directly passes the props object stored in the Redux state to the modal.
    // This is a clean, scalable approach that keeps the modal system robust and decoupled.
    return <ModalComponent {...(activeModalProps || {})} />;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative h-screen w-screen max-w-md mx-auto flex flex-col bg-brand-bg overflow-hidden font-mono shadow-2xl shadow-black">
        {/* <CountdownTimer /> */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <GameScreen />
        </main>
        <NavBar />
        
        {/* Render the active modal if there is one */}
        {renderModal()}
      </div>
    </DndProvider>
  );
};

export default App;