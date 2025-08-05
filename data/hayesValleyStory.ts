/**
 * @file data/hayesValleyStory.ts
 * @description This file contains the complete dataset for the story, "The Wild Trail Killing".
 * It is structured for easy authoring and then processed by a set of transformation functions
 * into the component-based data model required by the application. This separation forms the
 * "Data Transformation Layer", a key architectural pattern that keeps the raw story data simple
 * and decouples it from the application's final data structures.
 */

import { StoryData, Testimony, Hotspot, Character, Location, StoryObject, EvidenceGroup, DataComponent, CanonicalTimeline, EvidenceStack, EvidenceRarity, Bounty, DialogueData, Insight } from '../types';
import { hankBassettPoliceReports } from './HankBassett';

// The raw story data is defined as a large JSON-like object for easy authoring.
const rawStory = {
  "storyInfo": {
    "id": "story_wild_trail_01",
    "title": "The Wild Trail Killing",
    "premise": "Wednesday, August 13th, 2025: Tom and Carol Trembly were found dead during a midweek hike near Mount Tamalpais. Tom had been shot through the heart with a .243 Winchester; Carol’s body was discovered at the base of a nearby cliff.\nInitial investigation suggests Tom was shot using a high-powered hunting rifle, and Carol fell while fleeing the scene. The case reveals a complex web of resentments, betrayals, and financial disputes, all tied to the recent sale of the family’s outdoor shop, Wild Trail Supply Co.",
    "mapImagePrompt": "A high-contrast, black and white noir-style map of Marin County, California. The Mount Tamalpais area is highlighted in red. The trails are stark white on a black background. Minimalist and clean, like a detective's screen."
  },
  "theme": "A peaceful retirement turns tragic when a beloved local couple is killed during a hike, revealing deeper tensions involving family estrangement, legacy, and revenge.",
  "characters": [
    {
      "id": "char_tom_trembly",
      "name": "Tom Trembly",
      "age": "66",
      "role": "Victim",
      "occupation": "Retired owner of Wild Trail Supply Co.",
      "imagePrompt": "An elderly Caucasian man in his late 60s, with a kind face and a weathered look. He wears a flannel shirt and hiking boots. Photorealistic portrait set in a forest.",
      "bio": "Retired owner of Wild Trail Supply Co. and longtime Eagle Scout coach. Respected in his Marin County community for his kindness and quiet strength. Killed by a single gunshot wound from a .243 Winchester.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'10\"", "weight": "180 lbs", "eyes": "Blue", "hair": "Grey" } }
      ]
    },
    {
      "id": "char_carol_trembly",
      "name": "Carol Trembly",
      "age": "63",
      "role": "Victim",
      "occupation": "Retired baker and gardener",
      "imagePrompt": "An elderly Caucasian woman in her early 60s, with a warm smile and a gentle expression. She wears a floral dress and gardening gloves. Photorealistic portrait set in a garden.",
      "bio": "Spiritual, eccentric, and community-minded. Known for her baking, gardening, and presence at the local farmers market. Died after falling from a cliff while fleeing Tom’s murder.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'6\"", "weight": "140 lbs", "eyes": "Green", "hair": "White" } }
      ]
    },
    {
      "id": "char_hank_bassett",
      "name": "Hank Bassett",
      "age": "51",
      "role": "Culprit",
      "occupation": "Former employee of Wild Trail Supply Co.",
      "imagePrompt": "A middle-aged Caucasian man in his early 50s, with a resentful expression and a rugged appearance. He wears a worn work shirt and jeans. Photorealistic portrait set in a cluttered garage.",
      "bio": "Former employee of Wild Trail Supply Co. Fired after being blamed for a suspicious fire at the shop. Felt betrayed by Tom, whom he had worked for over twenty years. Motive: Revenge for being cast out of the community and losing the business he thought he’d inherit.",
      "statement": "I didn't do anything. I was home all day.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'8\"", "weight": "200 lbs", "eyes": "Brown", "hair": "Brown, balding" } },
        {
          "type": "dialogue",
          "props": {
            "mode": "interview",
            "buttonText": "Interview Hank",
            "persona": "You are Hank Bassett, former employee of Wild Trail Supply Co. You were fired after being blamed for a suspicious fire at the shop. You felt betrayed by Tom, whom you had worked for over twenty years.",
            "openingStatement": "I didn’t start it, if that’s what you’re asking.",
            "suggestedQuestions": [
              "Let’s talk about the fire at the shop. What do you know about it?",
              "How did you feel about being let go after the store was sold?",
              "When’s the last time you saw Tom and Carol?"
            ],
            "slideshowPrompts": [
              "Body cam footage of Hank Bassett being interviewed by a detective.",
              "Close-up of Hank Bassett's face as he answers questions.",
              "A detective taking notes during an interview with Hank Bassett."
            ],
            "dialogue": hankBassettPoliceReports.map(report => ({ question: `Report ${report.reportNumber}: ${report.summary}`, answer: `${report.date}: ${report.location}` }))
          }
        }
      ]
    },
    {
      "id": "char_peter_lewin",
      "name": "Peter Lewin",
      "age": "40",
      "role": "Suspect",
      "occupation": "Unemployed",
      "imagePrompt": "A middle-aged Caucasian man in his early 40s, with an intense gaze and a muscular build. He wears a military-style jacket and has a stern expression. Photorealistic portrait set in a dimly lit room.",
      "bio": "Carol’s son from a previous marriage. Army marksman, dishonorably discharged. Blames Tom and Carol for a fractured childhood. Has a history of violence and instability. Alibi: Claims he was fishing alone at the time of the murder. Motive: Deep emotional resentment and blame.",
      "statement": "I was fishing. Alone. Like always.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "6'0\"", "weight": "220 lbs", "eyes": "Hazel", "hair": "Black" } }
      ]
    },
    {
      "id": "char_peter_lewin",
      "name": "Peter Lewin",
      "age": "40",
      "role": "Suspect",
      "occupation": "Unemployed",
      "imagePrompt": "A middle-aged Caucasian man in his early 40s, with an intense gaze and a muscular build. He wears a military-style jacket and has a stern expression. Photorealistic portrait set in a dimly lit room.",
      "bio": "Carol’s son from a previous marriage. Army marksman, dishonorably discharged. Blames Tom and Carol for a fractured childhood. Has a history of violence and instability. Alibi: Claims he was fishing alone at the time of the murder. Motive: Deep emotional resentment and blame.",
      "statement": "I was fishing. Alone. Like always.",
      "components": [
        {
          "type": "dialogue",
          "props": {
            "mode": "interview",
            "buttonText": "Interview Peter",
            "persona": "You are Peter Lewin, son of Carol Trembly. You are an army marksman, dishonorably discharged. You blame Tom and Carol for a fractured childhood. You claim you were fishing alone at the time of the murder.",
            "openingStatement": "I was fishing. Alone. Like always.",
            "suggestedQuestions": [
              "Can you tell us where you were when your parents were killed?",
              "What are your thoughts on being excluded from the will?",
              "Do you have any idea who might’ve done this?"
            ],
            "slideshowPrompts": [
              "Body cam footage of Peter Lewin being interviewed by a detective.",
              "Close-up of Peter Lewin's face as he answers questions.",
              "A detective taking notes during an interview with Peter Lewin."
            ],
            "dialogue": [
              {
                "question": "Can you tell us where you were when your parents were killed?",
                "answer": "Out at the tower. Wednesday’s my solo watch."
              },
              {
                "question": "What are your thoughts on being excluded from the will?",
                "answer": "Doesn’t surprise me. Tom never saw me as worth much. Carol… she tried. But by then it was already set in stone."
              },
              {
                "question": "Do you have any idea who might’ve done this?",
                "answer": "No. And if I did, I’d say so. I’ve had enough of the guessing games."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "char_oliver_trembly",
      "name": "Oliver Trembly",
      "age": "34",
      "role": "Suspect",
      "occupation": "Hunting enthusiast",
      "imagePrompt": "A young Caucasian man in his early 30s, with a troubled look and a lean build. He wears hunting gear and has a nervous expression. Photorealistic portrait set in a forest clearing.",
      "bio": "Tom and Carol’s son. Former addict, now a hunting enthusiast. Expected to inherit the family business before it was sold. Publicly argued with his parents weeks before the murder. Tried to sabotage the sale by burning it down. Alibi: Claims he was on a solo hunting trip and unreachable. Motive: Financial gain; he inherited money after their deaths.",
      "statement": "I was out hunting. No cell service out there.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'11\"", "weight": "170 lbs", "eyes": "Green", "hair": "Brown" } }
      ]
    },
    {
      "id": "char_oliver_trembly",
      "name": "Oliver Trembly",
      "age": "34",
      "role": "Suspect",
      "occupation": "Hunting enthusiast",
      "imagePrompt": "A young Caucasian man in his early 30s, with a troubled look and a lean build. He wears hunting gear and has a nervous expression. Photorealistic portrait set in a forest clearing.",
      "bio": "Tom and Carol’s son. Former addict, now a hunting enthusiast. Expected to inherit the family business before it was sold. Publicly argued with his parents weeks before the murder. Tried to sabotage the sale by burning it down. Alibi: Claims he was on a solo hunting trip and unreachable. Motive: Financial gain; he inherited money after their deaths.",
      "statement": "I was out hunting. No cell service out there.",
      "components": [
        {
          "type": "dialogue",
          "props": {
            "mode": "interview",
            "buttonText": "Interview Oliver",
            "persona": "You are Oliver Trembly, son of Tom and Carol Trembly. You are a hunting enthusiast and former addict. You expected to inherit the family business before it was sold. You publicly argued with your parents weeks before the murder. You claim you were on a solo hunting trip and unreachable.",
            "openingStatement": "I was out hunting. No cell service out there.",
            "suggestedQuestions": [
              "Where were you on the day of your parents' deaths?",
              "Were you aware you were included in their will?",
              "Do you have any idea who might’ve done this?"
            ],
            "slideshowPrompts": [
              "Body cam footage of Oliver Trembly being interviewed by a detective.",
              "Close-up of Oliver Trembly's face as he answers questions.",
              "A detective taking notes during an interview with Oliver Trembly."
            ],
            "dialogue": [
              {
                "question": "Where were you on the day of your parents' deaths?",
                "answer": "Out in Del Norte, filming solo content. I told people I was off-grid for the weekend — it’s kind of the point. You don’t get the big bucks by livestreaming from your mom’s couch."
              },
              {
                "question": "Were you aware you were included in their will?",
                "answer": "Yeah, a couple hundred K split between me and Daisy. Not exactly a retirement fund, but hey — better than nothing, right? Look, I’m not crying over the payout if that’s what you’re fishing for."
              },
              {
                "question": "Do you have any idea who might’ve done this?",
                "answer": "Hank. No question. Guy snapped when Dad fired him. Probably still smells like pine needles and old gun oil. You think I’m the problem? I’m just the one still standing."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "char_kermit_the_hermit",
      "name": "Kermit the Hermit",
      "age": "50s",
      "role": "Witness",
      "occupation": "Hermit",
      "imagePrompt": "A disheveled Caucasian man in his 50s, with a wild beard and a rambling expression. He wears tattered clothing and has a knowing look. Photorealistic portrait set in a secluded forest clearing.",
      "bio": "Lives in the woods near the trail system. Known to local hikers and law enforcement. Claims to have heard shouting and a gunshot near the trail that afternoon. Offers unreliable but potentially useful insights.",
      "components": [
        {
          "type": "dialogue",
          "props": {
            "mode": "interview",
            "buttonText": "Interview Witness",
            "persona": "You are Kermit the Hermit, a reclusive and eccentric man who lives in the woods near Mount Tamalpais. You are known to local hikers and law enforcement. You claim to have heard shouting and a gunshot near the trail on the afternoon of August 13th, 2025. You are unreliable but potentially useful.",
            "openingStatement": "I heard things out there. Things people don't want you to know.",
            "suggestedQuestions": [
              "What did you hear?",
              "Did you see anyone?",
              "Can you describe the events of that day?"
            ],
            "slideshowPrompts": [
              "Body cam footage of a disheveled man with a wild beard being interviewed by a detective in a forest clearing.",
              "Close-up of a man's face, his eyes wide and his beard unkempt, as he speaks to a detective.",
              "A detective taking notes as a man gestures wildly in a forest clearing."
            ]
          }
        }
      ]
    }
  ],
  "locations": [
    {
      "id": "loc_mount_tamalpais",
      "name": "Mount Tamalpais Trail",
      "imagePrompt": "A scenic hiking trail winding through a redwood forest on Mount Tamalpais. Sunlight filters through the trees, casting dappled shadows on the path. A steep cliff drops off to one side of the trail.",
      "sceneSummary": "The location where Tom and Carol Trembly were found dead.",
      "hotspots": [
        { "label": "Examine Tom's Body", "targetCardId": "obj_tom_body", "targetCardType": "object", "aiHint": "the body lying on the trail" },
        { "label": "Investigate Cliff", "targetCardId": "obj_carol_body", "targetCardType": "object", "aiHint": "the cliff edge" }
      ]
    },
    {
      "id": "loc_wild_trail_supply_co",
      "name": "Wild Trail Supply Co.",
      "imagePrompt": "A quaint outdoor supply shop with a rustic facade. Hiking gear and camping equipment are displayed in the windows. A sign above the door reads 'Wild Trail Supply Co.'",
      "sceneSummary": "The Trembly family's outdoor supply shop, now recently sold.",
      "hotspots": [
        { "label": "Inspect Shop Records", "targetCardId": "obj_shop_records", "targetCardType": "object", "aiHint": "the cash register" },
        { "label": "Question Employees", "targetCardId": "char_hank_bassett", "targetCardType": "character", "aiHint": "the employees" }
      ]
    },
    {
      "id": "loc_hank_cabin",
      "name": "Hank's Cabin",
      "imagePrompt": "A secluded cabin nestled deep in the woods. Smoke rises from the chimney, and a woodpile is stacked neatly beside the door. The cabin appears rustic and well-maintained.",
      "sceneSummary": "Hank Bassett's secluded cabin in the woods.",
      "hotspots": [
        { "label": "Search Cabin", "targetCardId": "obj_cabin_contents", "targetCardType": "object", "aiHint": "the interior of the cabin" },
        { "label": "Inspect Woodpile", "targetCardId": "obj_woodpile", "targetCardType": "object", "aiHint": "the woodpile" }
      ]
    }
  ],
  "objects": [
    {
      "id": "obj_tom_body",
      "name": "Tom Trembly's Body",
      "unidentifiedDescription": "The body of an elderly man.",
      "category": "physical",
      "locationFoundId": "loc_mount_tamalpais",
      "timestamp": "2025-08-13T10:15:00Z",
      "costToUnlock": 10,
      "rarity": "critical",
      "imagePrompt": "The body of an elderly man lying on a hiking trail. A single gunshot wound is visible in his chest. Forensic markers surround the body.",
      "description": "Tom Trembly's body, found on the Mount Tamalpais trail. He was shot through the heart with a .243 Winchester.",
      "tags": ["victim", "body"]
    },
    {
      "id": "obj_carol_body",
      "name": "Carol Trembly's Body",
      "unidentifiedDescription": "The body of an elderly woman.",
      "category": "physical",
      "locationFoundId": "loc_mount_tamalpais",
      "timestamp": "2025-08-13T10:30:00Z",
      "costToUnlock": 10,
      "rarity": "critical",
      "imagePrompt": "The body of an elderly woman lying at the base of a steep cliff. She appears to have fallen from above.",
      "description": "Carol Trembly's body, found at the base of a cliff near the Mount Tamalpais trail. She appears to have fallen while fleeing Tom's murder.",
      "tags": ["victim", "body"]
    },
    {
      "id": "obj_shop_records",
      "name": "Shop Records",
      "unidentifiedDescription": "A collection of business documents.",
      "category": "document",
      "locationFoundId": "loc_wild_trail_supply_co",
      "timestamp": "2025-08-10T14:00:00Z",
      "costToUnlock": 10,
      "rarity": "circumstantial",
      "imagePrompt": "A stack of business documents and financial statements from Wild Trail Supply Co. The documents reveal declining profits and a recent sale agreement.",
      "description": "The shop records reveal that Wild Trail Supply Co. was struggling financially and was recently sold. This provides a motive for Oliver Trembly, who expected to inherit the business.",
      "tags": ["financial", "records"]
    },
    {
      "id": "obj_cabin_contents",
      "name": "Cabin Contents",
      "unidentifiedDescription": "The contents of a secluded cabin.",
      "category": "physical",
      "locationFoundId": "loc_hank_cabin",
      "timestamp": "2025-08-14T08:00:00Z",
      "costToUnlock": 10,
      "rarity": "circumstantial",
      "imagePrompt": "The interior of a secluded cabin. A .243 Winchester rifle is visible on a gun rack. Hunting gear and camping equipment are scattered throughout the cabin.",
      "description": "The cabin contains a .243 Winchester rifle, the same type of weapon used to kill Tom Trembly. This provides a link between Hank Bassett and the murder.",
      "tags": ["weapon", "cabin"]
    },
    {
      "id": "obj_woodpile",
      "name": "Woodpile",
      "unidentifiedDescription": "A neatly stacked woodpile.",
      "category": "physical",
      "locationFoundId": "loc_hank_cabin",
      "timestamp": "2025-08-14T08:15:00Z",
      "costToUnlock": 10,
      "rarity": "irrelevant",
      "imagePrompt": "A neatly stacked woodpile beside a secluded cabin. A faint trace of blood is visible on one of the logs.",
      "description": "A faint trace of blood is visible on one of the logs in the woodpile. Forensic analysis confirms the blood is Tom Trembly's.",
      "tags": ["blood", "woodpile"]
    }
  ],
  "evidenceGroups": [],
  "bounties": [],
  "evidenceStacks": [],
  "canonicalTimeline": {
    "culpritId": "char_hank_bassett",
    "keyEvents": []
  }
};

// --- Data Transformation Layer ---
// This is a critical architectural pattern. The functions below transform the "author-friendly"
// raw data above into the structured, normalized, and consistent format the application requires.
// This separation allows story writers to work with a simple structure without needing to know
// the final data model in detail, while the application benefits from a robust and predictable
// data contract.

/**
 * Transforms the raw character data into the structured `Character` format.
 * - Extracts statements into a separate `testimonies` collection for normalization.
 * - **Auto-generates** a `file` component containing a `mugshot` based on physical characteristics.
 * - **Standardizes** the data by ensuring every character has a consistent set of `DataComponent`s,
 *   even if they are empty. This prevents countless null checks in the UI components.
 * @param {any[]} rawCharacters - The array of raw character objects from the story.
 * @param {any[]} allRawObjects - A mutable reference to the full list of objects, allowing this function to add new ones (like mugshots).
 * @param {Testimony[]} testimonies - An accumulator array to which testimony data will be added.
 * @returns {Character[]} An array of processed `Character` objects ready for the Redux store.
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

    // --- Automatic Data Enrichment: Mugshot Generation ---
    // A mugshot is only generated if the character has physical data and is a suspect.
    if (physicalChars && c.role === 'Suspect') {
      const mugshotPrompt = `Mugshot of ${c.name}. Front and side profile view against a height chart. A plaque in front displays their details: Height: ${physicalChars.height}, Weight: ${physicalChars.weight}, Eyes: ${physicalChars.eyes}, Hair: ${physicalChars.hair}. ${physicalChars.features || ''} The style is high-contrast, gritty, Sin City noir. Photorealistic, hyper-detailed, sharp focus.`;
      
      // Since Police Files are now first-class objects, we create a new StoryObject for the mugshot.
      // This is a key part of the data-driven architecture.
      allRawObjects.push({
          id: `obj_mugshot_${c.id}`,
          name: `Booking Photo: ${c.name}`,
          unidentifiedDescription: "An official police booking photo.",
          ownerCharacterId: c.id,
          category: 'police_file',
          locationFoundId: 'loc_police_station', // A conceptual location
          timestamp: new Date().toISOString(),
          imagePrompt: mugshotPrompt,
          description: `Official booking photo for ${c.name}.`,
          components: [],
          rarity: 'irrelevant',
          timeToAdd: 0,
      });
    }
    
    // --- Architectural Improvement: Data Standardization ---
    // This loop ensures that a character has a `DataComponent` stub (e.g., `{ type: 'socialMedia', props: {} }`)
    // if *any* objects in the master list are owned by or authored by them. This is the magic
    // that makes the CharacterCard buttons appear automatically when data exists.
    const standardComponentTypes = ['socialMedia', 'phoneLog', 'cctv', 'records', 'file', 'purchaseInfo', 'interaction', 'dialogue'];
    standardComponentTypes.forEach(type => {
      // Check if there are any objects of this type owned by the character.
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
      isSuspect: c.role.toLowerCase() === 'suspect',
      connections: c.connections || { relatedPeople: [], knownLocations: [], associatedObjects: [] },
      testimonyIds,
      components,
    };
  });
};

/**
 * Transforms the raw object data into the structured `StoryObject` format.
 * This is a straightforward mapping that prepares the objects for the Redux store.
 * @param {any[]} rawObjects - The array of raw object items from the story.
 * @returns {StoryObject[]} An array of processed `StoryObject` objects.
 */
const transformObjectData = (rawObjects: any[]): StoryObject[] => {
  return rawObjects.map((o: any) => ({
    id: o.id,
    name: o.name,
    imagePrompt: o.imagePrompt,
    description: o.description,
    unidentifiedDescription: o.unidentifiedDescription,
    timestamp: o.timestamp,
    isEvidence: false,
    assignedToSuspectIds: [],
    locationFoundId: o.locationFoundId,
    category: o.category || 'physical',
    tags: o.tags,
    authorCharacterId: o.authorCharacterId,
    ownerCharacterId: o.ownerCharacterId,
    timeToAdd: o.costToUnlock, // Map old costToUnlock to new timeToAdd
    hasBeenUnlocked: false, // Initialize all objects as not yet unlocked.
    rarity: o.rarity as EvidenceRarity || 'irrelevant', // Ensure rarity is correctly typed and defaults to irrelevant
    components: o.components || [],
  }));
};

/**
 * Transforms the raw location data into the structured `Location` format.
 * It assigns map coordinates and structures the hotspot data.
 * @param {any} rawData - The complete raw story data object.
 * @returns {Location[]} An array of processed `Location` objects.
 */
const transformLocationData = (rawData: any): Location[] => {
  const locationCoords: {[key: string]: { top: string, left: string }} = {
    'loc_mount_tamalpais': { top: '50%', left: '50%' },
    'loc_wild_trail_supply_co': { top: '45%', left: '65%' },
    'loc_hank_cabin': { top: '60%', left: '35%' }
  };

  return rawData.locations.map((l: any) => {
    const itemHotspots: Hotspot[] = (l.hotspots || []).map((h: any, index: number) => ({
      id: `hs-${l.id}-${index}`,
      label: h.label,
      type: h.type || 'investigate',
      targetCardId: h.targetCardId,
      targetCardType: h.targetCardType,
      coords: h.coords,
      aiHint: h.aiHint, // Pass through the AI hint
    }));
    
    const victimName = rawData.characters.find((c:any) => c.role === 'Victim')?.name || 'Unknown';

    return {
      id: l.id,
      name: l.name,
      imagePrompt: l.imagePrompt,
      description: "A key location in the investigation.",
      hotspots: itemHotspots,
      mapCoords: locationCoords[l.id] || { top: '50%', left: '50%' },
      lastEventTimestamp: "2025-08-13T10:00:00Z",
      lastEventDescription: `Crime Scene Established. Victims: Tom and Carol Trembly.`,
      sceneSummary: l.sceneSummary,
      isInternal: l.isInternal || false,
    };
  });
};

/**
 * Transforms the raw bounty data into the structured `Bounty` format.
 * @param {any[]} rawBounties - The array of raw bounty objects from the story.
 * @returns {Bounty[]} An array of processed `Bounty` objects.
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
 * Orchestrates the transformation of all raw story data into the final, structured `StoryData` format.
 * This function is the entry point for the entire Data Transformation Layer.
 * @param {any} rawData - The raw, unstructured story data.
 * @returns {StoryData} The structured data ready to be loaded into the Redux store.
 */
const transformStoryData = (rawData: any): StoryData => {
    const testimonies: Testimony[] = [];
    
    // NOTE: The order of operations here is important. We pass the `objects` array
    // as a mutable reference to `transformCharacterData` so it can add new objects (like mugshots)
    // before we finalize the objects list.
    const objects = transformObjectData(rawData.objects);
    const characters = transformCharacterData(rawData.characters, rawData.objects, testimonies);
    const locations = transformLocationData(rawData);
    const evidenceGroups: EvidenceGroup[] = rawData.evidenceGroups || [];
    const bounties = transformBounties(rawData.bounties || []);
    const canonicalTimeline: CanonicalTimeline | undefined = rawData.canonicalTimeline;
    const evidenceStacks: EvidenceStack[] | undefined = rawData.evidenceStacks;

    // --- Robustness Fix: Find crime scene by ID instead of prompt text ---
    const crimeScene = rawData.locations.find((l:any) => l.id === 'loc_mount_tamalpais');

    return {
        title: rawData.storyInfo.title,
        storyInfo: {
            ...rawData.storyInfo,
            mapTitle: 'Marin County',
            crimeSceneId: crimeScene?.id,
        },
        characters,
        objects,
        locations,
        evidenceGroups,
        testimonies,
        bounties,
        canonicalTimeline,
        evidenceStacks,
    };
};

// Export the fully processed and structured story data.
export const storyData: StoryData = transformStoryData(rawStory);