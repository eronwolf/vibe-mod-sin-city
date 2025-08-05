/**
 * @file componentRegistry.ts
 * @description This file contains the central **Component Registry**, a cornerstone of the application's architecture.
 *
 * @architectural_pattern
 * The registry acts as a "Rosetta Stone" that maps the `type` string from a character or object's
 * `DataComponent` (defined in `types.ts`) to its corresponding UI metadata. This metadata includes the
 * icon to display, the text label for the button, and the specific modal window to open when the user interacts with it.
 *
 * @pattern_benefits
 * - **Data-Driven UI:** Components like `CharacterCard` and `ObjectCard` are not hardcoded with buttons. Instead, they
 *   read a character's `components` array and use this registry to dynamically build their UI.
 * - **Extreme Scalability:** To add a completely new feature (e.g., a "Financial Records" view), a developer only
 *   needs to:
 *   1. Define the data shape in `types.ts`.
 *   2. Add the data to `hayesValleyStory.ts`.
 *   3. Create a new modal component (e.g., `FinancialRecordsModal.tsx`).
 *   4. Add a single new entry to this registry file.
 *   The rest of the UI will adapt automatically without any changes to the card components themselves.
 * - **Decoupling:** This pattern completely decouples the story data from the UI that presents it, which is a hallmark
 *   of a clean, maintainable, and scalable architecture.
 */

import React from 'react';
import { ModalType } from '../../store/uiSlice';
import { AtSign, Phone, Video, Landmark, Shield, Receipt, KeyRound } from 'lucide-react';

/**
 * Defines the shape of an entry in the Component Registry.
 */
interface ComponentRegistryEntry {
  /** The Lucide icon component to render for the action button. */
  Icon: React.ElementType;
  /** The text label for the action button (visible on hover). */
  label: string;
  /** The `ModalType` that should be dispatched to the Redux store when the button is clicked. This is optional, as some actions may navigate to a card instead. */
  modal?: ModalType;
}

/**
 * The Component Registry object.
 * Maps a `DataComponent.type` string to its UI configuration.
 * The order of keys here will determine the order of buttons on the character card.
 */
export const COMPONENT_REGISTRY: { [key: string]: ComponentRegistryEntry } = {
  // --- Character Components ---
  socialMedia: { Icon: AtSign, label: 'Social' },
  phoneLog: { Icon: Phone, label: 'Phone Log' },
  cctv: { Icon: Video, label: 'CCTV' },
  records: { Icon: Landmark, label: 'Gov & Bank Records' },
  file: { Icon: Shield, label: 'Police File' },
 recordsOliver: { Icon: Landmark, label: 'Gov Records' },
 socialMediaOliver: { Icon: AtSign, label: 'Social' },
 policeFileOliver: { Icon: Shield, label: 'Police File' },
 // --- Object Components (still use modals) ---
 purchaseInfo: { Icon: Receipt, label: 'Purchase Info', modal: 'purchaseInfo' },
  interaction: { Icon: KeyRound, label: 'Interact', modal: 'interaction' },
};