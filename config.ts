/**
 * @file config.ts
 * @description Centralized configuration file for the application.
 *
 * @architectural_decision
 * This file serves as a single source of truth for various constants used throughout the application.
 * Centralizing configuration offers several key benefits:
 * 1.  **Maintainability:** Game balancing variables (like thresholds), API settings, and UI constants
 *     are easy for developers to find and modify without hunting through multiple files.
 * 2.  **Scalability:** As the application grows, new configuration values can be added here, keeping
 *     the codebase organized.
 * 3.  **Clarity:** It provides a clear overview of the application's tunable parameters.
 */

import { EvidenceRarity } from './types';

/**
 * Configuration for game mechanics and balancing.
 */
export const GAME_MECHANICS = {
  /** The number of evidence milestones needed to trigger a "New Insight" notification. */
  MILESTONE_THRESHOLD: 3,
  /** The minimum number of evidence items a player must have to make an accusation against a suspect. */
  ACCUSATION_THRESHOLD: 5,
  /** The initial time spent by the player at the start of the game. */
  INITIAL_PLAYER_TIME_SPENT: 0,
  /** The amount of time added for asking a single question (initial or follow-up) during an interrogation. */
  QUESTION_TIME_ADDITION: 2,
  /** The value required to fill the progress meter and complete an interrogation phase. */
  PHASE_COMPLETION_GOAL: 100,
  /** The progress awarded for turning a piece of testimony into evidence. */
  EVIDENCE_CREATION_PROGRESS: 25,
  /** The amount of time added to turn a piece of testimony into formal evidence. */
  CREATE_TESTIMONY_TIME_ADDITION: 15,
};

/**
 * Configuration for external API interactions, specifically the Gemini API.
 */
export const API_CONFIG = {
  /** The number of concurrent image generation requests to process in a single batch.
   *  A higher number is faster but increases the risk of hitting API rate limits. */
  CONCURRENT_REQUEST_LIMIT: 4,
  /** A small delay in milliseconds between processing batches of image generation requests.
   * This is a good practice to avoid overwhelming the API. */
  IMAGE_QUEUE_BATCH_DELAY: 1000,
};

/**
 * Configuration for UI animations and timings.
 */
export const UI_CONFIG = {
  /** The duration in milliseconds for each slide in the introductory cinematic. */
  INTRO_SLIDESHOW_DURATION: 7000,
  /** The debounce delay in milliseconds for triggering the ADA AI assistant.
   * This prevents spamming the API with rapid, successive user actions. */
  ADA_DEBOUNCE_DELAY: 500,
  /** The duration in milliseconds that a "New Insight" toast notification is visible. */
  TOAST_DURATION: 4000,
  /** The delay in milliseconds after the timeline scrolls to a new item before the 'new' status is cleared.
   * This ensures the arrival animation has time to play. */
  ARRIVAL_ANIMATION_DURATION: 1500,
};

/**
 * Configuration for the ADA (AI Assistant) message log.
 */
export const ADA_CONFIG = {
    /** The maximum number of messages to keep in ADA's log. This is a performance
     * and memory optimization to prevent the array from growing indefinitely. */
    MAX_MESSAGES: 20,
};

/**
 * Player-facing copy for the Token Ledger view. Centralizing this here allows
 * for easy editing by writers or designers without needing to change React components.
 */
export const TOKENS_VIEW_COPY = {
  ABOUT_TITLE: "About Time Spent",
  ABOUT_BODY: "Turning objects into evidence and asking questions adds to your total time spent on the case. There is no limit to how much time can be spent.",
  BOUNTY_TITLE: "Available Bounties",
  BOUNTY_BODY: "ADA is working to solve cases across the city. By helping her crack these codes and solve these puzzles, you're assisting with active forensic work—and she'll help you reduce the time spent on your own investigation."
};


/**
 * --- Data-Driven Rarity System ---
 * A centralized registry for all rarity-related UI and text. This is a highly scalable
 * pattern that allows designers to easily tune the look, feel, and narrative impact of
 * the evidence discovery system without touching any component code.
 */
export const RARITY_CONFIG: {
  [key in EvidenceRarity]: {
    label: string;
    color: string;
    glowClass: string;
    flavorText: string;
  }
} = {
    irrelevant: {
        label: "Irrelevant",
        color: "#D1D5DB", // A clean, readable "Bone White" color for high contrast.
        glowClass: "shadow-gray-400",
        flavorText: "A detail, nothing more. Unlikely to influence the case.",
    },
    circumstantial: {
        label: "Circumstantial",
        color: "#D72638",
        glowClass: "shadow-red-500",
        flavorText: "This doesn't prove anything directly, but it starts to paint a picture.",
    },
    material: {
        label: "Material",
        color: "#F6E05E",
        glowClass: "shadow-yellow-400",
        flavorText: "A key piece of evidence. This has a direct bearing on the case.",
    },
    critical: {
        label: "Critical",
        color: "#00F0FF",
        glowClass: "shadow-cyan-400 animate-legendary-pulse",
        flavorText: "This is a critical piece of evidence. This changes everything.",
    },
};