/**
 * @file data/hayesValleyStory.ts
 * @description This file contains the complete dataset for the story, "The Hayes Valley Killing".
 * It is structured for easy authoring and then processed by a set of transformation functions
 * into the component-based data model required by the application. This separation forms the
 * "Data Transformation Layer", a key architectural pattern that keeps the raw story data simple
 * and decouples it from the application's final data structures.
 */

import { StoryData, Testimony, Hotspot, Character, Location, StoryObject, EvidenceGroup, DataComponent, CanonicalTimeline, EvidenceStack, EvidenceRarity, Bounty, DialogueData, Insight } from '../types';

// The raw story data is defined as a large JSON-like object for easy authoring.
const rawStory = {
  "storyInfo": {
    "id": "story_hayes_valley_02",
    "title": "The Fractured Legacy",
    "premise": "During Lunar New Year in a gentrifying San Francisco neighborhood, a respected herbalist is murdered. The case reveals deep-seated tensions of family, cultural heritage, and the desperate lengths people go to when faced with the loss of their legacy.",
    "mapImagePrompt": "A high-contrast, black and white noir-style map of San Francisco. The Hayes Valley district is highlighted in red. The streets are stark white on a black background. Minimalist and clean, like a detective's screen."
  },
  "characters": [
    {
      "id": "char_mei_ling_wong",
      "name": "Mei-Ling Wong",
      "age": "55",
      "role": "Victim",
      "occupation": "Herbalist & Apothecary Owner",
      "imagePrompt": "An elegant East Asian woman in her mid-50s, with sharp, intelligent eyes and traditional attire. She looks proud and resolute. Photorealistic portrait set in a modern apothecary.",
      "bio": "Owner of Wong's Traditional Apothecary. A pillar of the community, known for her deep knowledge of herbal medicine and for fighting an eviction notice threatening her family's legacy.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'4\"", "weight": "120 lbs", "eyes": "Brown", "hair": "Black" } }
      ]
    },
    {
      "id": "char_sophia_wong",
      "name": "Sophia Wong",
      "age": "28",
      "role": "Suspect",
      "occupation": "Struggling Artist",
      "imagePrompt": "A stylish East Asian woman in her late 20s, with an artistic and intense look. Her expression is a mix of grief and fierce determination. Photorealistic portrait.",
      "bio": "The victim's daughter, a struggling artist. Passionate about preserving her family's culture, she was recently told she was being kicked out of her home by her mother.",
      "statement": "Look, I was there, but I did not do anything wrong. It was just a normal family argument that got out of hand. I called the police as soon as I found her.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'6\"", "weight": "135 lbs", "eyes": "Brown", "hair": "Black with red streaks", "features": "Small tattoo of a lotus on her left wrist." } },
        { 
          "type": "dialogue", 
          "props": {
            "mode": "interrogation",
            "buttonText": "Interrogate Suspect",
            "persona": "You are Sophia Wong, a 28-year-old artist under interrogation for your mother's murder. You are the killer. Your goal is to deflect suspicion onto James Lee. You are intelligent, defiant, and fiercely protective of your family's legacy, which was your motive—you feared your mother would sell the apothecary and marry James, destroying everything you cared about. You will lie and contradict yourself when pressed.\n\nMANDATORY JSON STRUCTURE: Your response MUST be a valid JSON object. It must have 'chunks' (an array of objects, each with 'text' and 'isCriticalClue' boolean), 'phaseUpdate' (object with 'progressValue' number), 'nextSuggestedQuestions' (an array of exactly 3 contextually relevant strings), and 'adaFeedback' (a concise, 1-sentence analysis of the player's last question).\n\nCRITICAL DIRECTIVE: Your response text must be broken down into 2-3 distinct, meaningful chunks, each representing a separate thought or piece of information. Do not combine them into one large paragraph.\n\nPLAYER CONTEXT: The player's question may be prefaced with their current line of inquiry, like this: `(My current line of inquiry is: \"Expose the motive behind the argument\")`. You MUST use this context to inform your response and to generate the next suggested questions.\n\nCRITICAL QUESTION DIRECTIVE: Your 'nextSuggestedQuestions' MUST be directly related to the player's current line of inquiry. They should be logical follow-ups to help the player achieve this specific goal.\n\nGAMEPLAY MECHANICS:\n- If the player asks a relevant question, return a moderate `progressValue` (e.g., 5-15) and positive `adaFeedback` (e.g., 'An insightful question. This forces her to address the timeline directly.').\n- If the player asks an irrelevant or accusatory question, return a low `progressValue` (0-5) and negative `adaFeedback` (e.g., 'This accusation is premature and cost you valuable resources. It makes her more defensive.').\n- If your response contains a critical clue that resolves the current line of inquiry, include `phaseCompleted: true` in your response, and you MUST also include an `insight` object (with `justification` and `newLead`) within that specific chunk.\n\nCRITICAL CLUES & INSIGHTS:\n1.  Line of Inquiry: 'Expose the motive behind the argument.' When asked about the argument, reveal she planned to sell the shop. Make this chunk a critical clue (`isCriticalClue: true`) and complete the phase (`phaseCompleted: true`). The `insight` for this chunk MUST be: { \"justification\": \"This establishes a powerful motive—fear of losing her legacy.\", \"newLead\": \"This establishes a powerful financial motive. We need to investigate the apothecary's books.\" }\n2.  Line of Inquiry: 'Inquire about her relationship with James Lee.' When asked about James Lee, subtly reveal knowledge of the murder weapon (e.g., 'He's a contractor, isn't he? Always has tools like hammers in his car.'). Make this a critical clue and complete the phase. The `insight` MUST be: { \"justification\": \"She has knowledge only the killer would possess.\", \"newLead\": \"This is suspicious. How would she know what tools James keeps in his car? We need to press her on this.\" }",
            "slideshowPrompts": [
              "Body cam footage, medium close-up of a stylish East Asian woman in her late 20s, Sophia Wong, sitting at a metal table in a stark interrogation room. Her expression is defiant. A detective's hand is visible, holding a pencil over a notebook. The style is high-contrast, gritty, Sin City noir.",
              "Body cam view, bust shot of a suspect, Sophia Wong, glaring at the detective from across a table in an interrogation room. The lighting is harsh, casting deep shadows. The detective is writing in a notebook. Photorealistic, Sin City noir style.",
              "Body cam view of Sophia Wong in an interrogation room. She's leaning forward, speaking intensely. The detective's notebook is in the foreground. High-contrast, gritty, Sin City noir."
            ],
            "interrogation": {
              "linesOfInquiry": [
                { "id": "loi_sophia_argument", "label": "Expose the motive behind the argument", "initialQuestions": ["What were you and your mother fighting about?", "I heard the argument was about the business. Is that true?", "Why was the argument so intense?"] },
                { "id": "loi_sophia_alibi", "label": "Establish her whereabouts that night", "initialQuestions": ["Where exactly were you when your mother died?", "Can anyone confirm you were at your studio?", "What time did you leave the studio?"] },
                { "id": "loi_sophia_james", "label": "Inquire about her relationship with James Lee", "initialQuestions": ["What do you think of James Lee?", "Did you approve of his relationship with your mother?", "Why do you think the murder weapon was in his car?"] }
              ]
            }
          }
        }
      ]
    },
    {
      "id": "char_james_lee",
      "name": "James Lee",
      "age": "40",
      "role": "Suspect",
      "occupation": "Building Contractor",
      "imagePrompt": "A handsome, well-built man in his 40s, wearing a contractor's jacket. He has a confident but slightly arrogant demeanor, with a hint of a temper in his eyes. Photorealistic portrait.",
      "bio": "The victim's boyfriend and a local contractor. He had a recent, public dispute with Mei-Ling over a construction job. The murder weapon was found in his car.",
      "statement": "Well, I mean, I left before anything serious happened. Whatever occurred must have been after I was gone. I should have done something when she kicked me out, though.",
      "components": [
         { "type": "physicalCharacteristics", "props": { "height": "6'1\"", "weight": "195 lbs", "eyes": "Brown", "hair": "Black" } },
         { 
          "type": "dialogue", 
          "props": {
            "mode": "interrogation",
            "buttonText": "Interrogate Suspect",
            "persona": "You are James Lee, a 40-year-old contractor. You are innocent, but you know you've been framed, which makes you angry and defensive. You were secretly in a loving relationship with Mei-Ling and planned to retire with her. You are annoyed you're being questioned again.\n\nMANDATORY JSON STRUCTURE: Your response MUST be a valid JSON object. It must have 'chunks' (an array of objects, each with 'text' and 'isCriticalClue' boolean), 'phaseUpdate' (object with 'progressValue' number), 'nextSuggestedQuestions' (an array of exactly 3 contextually relevant strings), and 'adaFeedback' (a concise, 1-sentence analysis of the player's last question).\n\nCRITICAL DIRECTIVE: Your response text must be broken down into 2-3 distinct, meaningful chunks, each representing a separate thought or piece of information. Do not combine them into one large paragraph.\n\nPLAYER CONTEXT: The player's question may be prefaced with their current line of inquiry, like this: `(My current line of inquiry is: \"Clarify his relationship with Mei-Ling\")`. You MUST use this context to inform your response and to generate the next suggested questions.\n\nCRITICAL QUESTION DIRECTIVE: Your 'nextSuggestedQuestions' MUST be directly related to the player's current line of inquiry. They should be logical follow-ups to help the player achieve this specific goal.\n\nGAMEPLAY MECHANICS:\n- If the player asks a relevant question, return a moderate `progressValue` (e.g., 5-15) and positive `adaFeedback` (e.g., 'Good question. This gives him an opportunity to clear his name.').\n- If the player asks an irrelevant or accusatory question, return a low `progressValue` (0-5) and negative `adaFeedback` (e.g., 'He's heard this before. A direct accusation only hardens his stance and wastes resources.').\n- If your response contains a critical clue that resolves the current line of inquiry, include `phaseCompleted: true` in your response, and you MUST also include an `insight` object (with `justification` and `newLead`) within that specific chunk.\n\nCRITICAL CLUES & INSIGHTS:\n- Line of Inquiry: 'Clarify his relationship with Mei-Ling.' When asked about your relationship with Mei-Ling, reveal you were planning to retire together. Make this chunk a critical clue (`isCriticalClue: true`) and complete the phase (`phaseCompleted: true`). The `insight` for this chunk MUST be: { \"justification\": \"This counters any financial motive and suggests a loving relationship, making him an unlikely killer.\", \"newLead\": \"This contradicts the narrative of a relationship in turmoil. We need to find proof of their retirement plans.\" }",
            "slideshowPrompts": [
              "Body cam footage, medium close-up of a handsome man in his 40s, James Lee, sitting in an interrogation room. He looks confident but annoyed. A detective's hand is visible, holding a pencil over a notebook. The style is high-contrast, gritty, Sin City noir.",
              "Body cam view, bust shot of a suspect, James Lee, leaning back in his chair, looking dismissive. The lighting is harsh. The detective is writing in a notebook. Photorealistic, Sin City noir style.",
              "Body cam view of James Lee in an interrogation room. He's gesturing with his hand as if explaining something for the tenth time. The detective's notebook is in the foreground. High-contrast, gritty, Sin City noir."
            ],
            "interrogation": {
              "linesOfInquiry": [
                { "id": "loi_james_alibi", "label": "Confirm his alibi", "initialQuestions": ["Where were you on the night of the murder?", "Who can vouch for you?", "Did you go anywhere else that night?"] },
                { "id": "loi_james_relationship", "label": "Clarify his relationship with Mei-Ling", "initialQuestions": ["What was the nature of your relationship with Ms. Wong?", "Did you two ever argue?", "I understand you had plans for the future?"] },
                { "id": "loi_james_hammer", "label": "Challenge him on the hammer found in his car", "initialQuestions": ["We found the murder weapon in your car. Can you explain that?", "Do you always leave your car unlocked?", "Is that your hammer?"] }
              ]
            }
          }
        }
      ]
    },
    {
      "id": "char_emily_patel",
      "name": "Emily Patel",
      "age": "25",
      "role": "Suspect",
      "occupation": "Apothecary Employee",
      "imagePrompt": "A young South Asian woman in her mid-20s. She looks tired and anxious, with a withdrawn posture. Her eyes dart around nervously. Photorealistic portrait.",
      "bio": "An employee at the apothecary. Described as quiet and loyal, but was owed back pay, giving her a potential financial motive. She has a strong alibi.",
      "statement": "I don't understand why I am a suspect. Yes, I had a professional relationship, but for entirely innocent reasons. This is a waste of time.",
      "components": [
        { "type": "physicalCharacteristics", "props": { "height": "5'5\"", "weight": "125 lbs", "eyes": "Hazel", "hair": "Brown" } },
        { 
          "type": "dialogue", 
          "props": {
            "mode": "interrogation",
            "buttonText": "Interrogate Suspect",
            "persona": "You are Emily Patel, a 25-year-old apothecary employee. You are innocent. You are nervous, quiet, and easily intimidated. You respected your boss, Mei-Ling, who was mentoring you to one day take over the shop. You are worried about your future.\n\nMANDATORY JSON STRUCTURE: Your response MUST be a valid JSON object. It must have 'chunks' (an array of objects, each with 'text' and 'isCriticalClue' boolean), 'phaseUpdate' (object with 'progressValue' number), 'nextSuggestedQuestions' (an array of exactly 3 contextually relevant strings), and 'adaFeedback' (a concise, 1-sentence analysis of the player's last question).\n\nCRITICAL DIRECTIVE: Your response text must be broken down into 2-3 distinct, meaningful chunks, each representing a separate thought or piece of information. Do not combine them into one large paragraph.\n\nPLAYER CONTEXT: The player's question may be prefaced with their current line of inquiry, like this: `(My current line of inquiry is: \"Uncover her relationship with Mei-Ling\")`. You MUST use this context to inform your response and to generate the next suggested questions.\n\nCRITICAL QUESTION DIRECTIVE: Your 'nextSuggestedQuestions' MUST be directly related to the player's current line of inquiry. They should be logical follow-ups to help the player achieve this specific goal.\n\nGAMEPLAY MECHANICS:\n- If the player asks a relevant question, return a moderate `progressValue` (e.g., 5-15) and positive `adaFeedback` (e.g., 'A gentle approach. This helps build trust and makes her more willing to talk.').\n- If the player asks an irrelevant or accusatory question, return a low `progressValue` (0-5) and negative `adaFeedback` (e.g., 'Too direct. This question wastes tokens and makes her withdraw further.').\n- If your response contains a critical clue that resolves the current line of inquiry, include `phaseCompleted: true` in your response, and you MUST also include an `insight` object (with `justification` and `newLead`) within that specific chunk.\n\nCRITICAL CLUES & INSIGHTS:\n- Line of Inquiry: 'Uncover her relationship with Mei-Ling.' When asked about your relationship with Mei-Ling, reveal that she was mentoring you to take over the shop. Make this chunk a critical clue (`isCriticalClue: true`) and complete the phase (`phaseCompleted: true`). The `insight` for this chunk MUST be: { \"justification\": \"This reveals a positive relationship and counters a potential financial motive.\", \"newLead\": \"If Mei-Ling was training her successor, it weakens Emily's financial motive. We should search for proof of this mentorship.\" }",
            "slideshowPrompts": [
              "Body cam footage, medium close-up of a nervous young South Asian woman, Emily Patel, in an interrogation room. She's wringing her hands. A detective's hand is visible, holding a pencil over a notebook. The style is high-contrast, gritty, Sin City noir.",
              "Body cam view, bust shot of a suspect, Emily Patel, looking down at the table, avoiding eye contact. The lighting is harsh, highlighting her anxious expression. The detective is writing in a notebook. Photorealistic, Sin City noir style.",
              "Body cam view of Emily Patel. She looks up, startled, as if asked a difficult question. The detective's notebook is in the foreground. High-contrast, gritty, Sin City noir."
            ],
            "interrogation": {
              "linesOfInquiry": [
                { "id": "loi_emily_relationship", "label": "Uncover her relationship with Mei-Ling", "initialQuestions": ["How would you describe your relationship with your boss?", "Did you see her as a mentor?", "What were your future plans at the shop?"] },
                { "id": "loi_emily_wages", "label": "Question her about the unpaid wages", "initialQuestions": ["We know you were owed back pay. Were you upset about that?", "Did you ever argue with Mei-Ling about money?", "Did you feel taken advantage of?"] },
                { "id": "loi_emily_tension", "label": "Ask about tension between Sophia and her mother", "initialQuestions": ["Did you ever witness arguments between Sophia and her mother?", "What was the mood like in the shop recently?", "How did Sophia feel about James Lee?"] }
              ]
            }
          }
        }
      ],
      "connections": {
        "knownLocations": ["loc_emily_apartment"],
        "associatedObjects": []
      }
    },
    {
      "id": "char_ling_chen",
      "name": "Ling Chen",
      "age": "60s",
      "role": "Witness",
      "occupation": "Neighbor",
      "imagePrompt": "A friendly-faced elderly East Asian woman, looking out her window. She wears simple, comfortable clothes and has a curious, observant expression. Photorealistic.",
      "bio": "Mei-Ling's next-door neighbor. She is the source of key testimony regarding arguments on the night of the murder.",
      "components": [
        {
          "type": "dialogue",
          "props": {
            "mode": "interview",
            "buttonText": "Interview Witness",
            "persona": "You are Ling Chen, an elderly, observant, and slightly gossipy but well-meaning neighbor. You've lived in the neighborhood for 40 years. You are worried but eager to help the detective. You saw James Lee leave the apothecary looking angry on the night of the murder. Refer to the victim as 'poor Mei-Ling'. CRITICAL INSTRUCTION: Your response MUST be a valid JSON object. It must have a single key, 'chunks', which is an array of objects. Each object must have a 'text' property (a string). Each string in the array should be a single, concise sentence. Break your response into 3-4 very short, bite-sized chunks.",
            "openingStatement": "Oh, hello, Detective. It's just terrible what happened to poor Mei-Ling. Such a nice woman, always so proud. I heard... well, I heard some things that night. Ask me anything, I'll do my best to help.",
            "suggestedQuestions": [
              "What did you hear that night?",
              "Did you see anyone leave?",
              "Describe Mei-Ling's relationship with her daughter."
            ],
            "slideshowPrompts": [
              "Body cam footage of an elderly Chinese woman, Ling Chen, being interviewed by a detective holding a notebook and pencil. They are on a rainy San Francisco street at night. The background shows the entrance to a traditional Chinese apothecary with neon signs reflecting on the wet pavement. The style is high-contrast, gritty, Sin City noir.",
              "Body cam footage view. A medium close-up of an elderly Chinese woman, Ling Chen, speaking with concern. In the corner of the frame, a detective's hand is visible, writing with a pencil in a small notebook. She is standing on a rainy San Francisco street at night, near an old apothecary. Photorealistic, shallow depth of field, Sin City noir style.",
              "Body cam footage view. An elderly Chinese woman, Ling Chen, gestures with her hand as she speaks to a police detective who is taking notes with a pencil in a notebook. They are on a rainy street corner at night. The blurred background shows a traditional San Francisco neighborhood with architecture suitable for an old apothecary. High-contrast, gritty, Sin City noir."
            ]
          }
        }
      ]
    }
  ],
  "locations": [
    {
      "id": "loc_apothecary",
      "name": "Wong's Traditional Apothecary",
      "imagePrompt": "The interior of a traditional Chinese apothecary. Walls are lined with wooden drawers of herbs. There is a prominent wooden desk in the scene. A beaded curtain hangs in a doorway leading to a back room. The scene is marked with stylized forensic markers on the floor highlighted in searing red, indicating a key area of investigation. The style is high-contrast, gritty, Sin City noir.",
      "sceneSummary": "The apothecary where Mei-Ling Wong was discovered by her daughter, Sophia. The scene is still under analysis.",
      "hotspots": [
        { "label": "Examine Crime Scene", "targetCardId": "obj_blood_spatter_report", "targetCardType": "object", "aiHint": "the red forensic markers on the floor" },
        { "label": "Inspect Desk", "targetCardId": "group_desk_contents", "targetCardType": "evidenceGroup", "aiHint": "the prominent wooden desk in the room" },
        { "label": "Go to Backroom", "type": "move", "targetCardId": "loc_apothecary_backroom", "targetCardType": "location", "aiHint": "the beaded curtain in the doorway" }
      ]
    },
    {
      "id": "loc_apothecary_backroom",
      "name": "Apothecary Backroom",
      "isInternal": true,
      "imagePrompt": "A very modest backroom office in a family-owned shop. There is a cheap desk with an old desktop computer on top, and another desk in the corner with a backup CCTV recorder. A doorway with a beaded curtain leads back out to the main shop floor. A small trash can next to the desk has some items in it. The room is dimly lit and feels cramped. The style is high-contrast, gritty, Sin City noir.",
      "sceneSummary": "The small, private office behind the main shop floor. It contains business equipment.",
      "hotspots": [
        { "label": "Examine Computer", "targetCardId": "obj_backroom_computer", "targetCardType": "object", "aiHint": "the old desktop computer on the desk" },
        { "label": "Check Backup Recorder", "targetCardId": "obj_backup_footage", "targetCardType": "object", "aiHint": "the backup CCTV recorder in the corner" },
        { "label": "Check Trash Can", "targetCardId": "obj_rubber_gloves", "targetCardType": "object", "aiHint": "the small trash can next to the desk" },
        { "label": "Return to Main Shop", "type": "move", "targetCardId": "loc_apothecary", "targetCardType": "location", "aiHint": "the doorway with the beaded curtain" }
      ]
    },
    {
      "id": "loc_alley",
      "name": "Alley Behind Apothecary",
      "imagePrompt": "A gritty, rain-slicked service alley at night in San Francisco, 2023. Neon signs from the main street cast long shadows. A late-model car is parked near a dumpster. A security camera is mounted high on a wall.",
      "sceneSummary": "The service alley behind the apothecary. A potential route for entry or escape, and a place to discard evidence.",
      "hotspots": [
        { "label": "Check Security System", "targetCardId": "obj_security_footage_glitch", "targetCardType": "object", "aiHint": "the security camera mounted high on the wall" },
        { "label": "Inspect Car Trunk", "targetCardId": "group_trunk_contents", "targetCardType": "evidenceGroup", "aiHint": "the open trunk of the late-model car" }
      ]
    },
    {
      "id": "loc_studio",
      "name": "Sophia's Art Studio",
      "imagePrompt": "A small, cluttered live-work art studio in 2023. Canvases lean against the walls, one prominent canvas shows a motif of a mother and daughter. A laptop is open on a messy desk next to a pile of bills. On a workbench, there are several cans and tubes of brightly colored fluorescent paint. A small trash bin is next to the workbench.",
      "sceneSummary": "Sophia Wong's live-work art studio, where she spends most of her time. It may contain personal items relevant to the case.",
      "hotspots": [
        { "label": "Check Laptop", "targetCardId": "obj_search_history", "targetCardType": "object", "aiHint": "the open laptop computer on the desk" },
        { "label": "Examine Painting", "targetCardId": "obj_mother_daughter_art", "targetCardType": "object", "aiHint": "the prominent canvas showing a mother and daughter" },
        { "label": "Examine Paints", "targetCardId": "obj_fluorescent_paint", "targetCardType": "object", "aiHint": "the collection of fluorescent paints on the workbench" },
        { "label": "Check Trash Bin", "targetCardId": "obj_used_gloves_studio", "targetCardType": "object", "aiHint": "the small trash bin next to the workbench" }
      ]
    },
    {
      "id": "loc_emily_apartment",
      "name": "Emily's Apartment",
      "imagePrompt": "The interior of a modest but impeccably clean studio apartment. Furnishings are sparse. A worn couch has a single red pillow. A sleek computer tablet is on the couch. A framed photo of Emily and Mei-Ling is on a wall shelf. A pill bottle with distinctive handwriting is on a small table. The style is high-contrast, gritty, Sin City noir, with only the red pillow providing color.",
      "sceneSummary": "Emily Patel's small but impeccably clean apartment. It suggests a person of modest means but great personal pride.",
      "hotspots": [
          { "label": "Examine Tablet", "targetCardId": "obj_emily_tablet_messages", "targetCardType": "object", "aiHint": "the sleek computer tablet on the couch" },
          { "label": "View Photo", "targetCardId": "obj_emily_meiling_photo", "targetCardType": "object", "aiHint": "the framed photograph on the shelf" },
          { "label": "Inspect Pill Bottle", "targetCardId": "obj_pill_bottle_meiling", "targetCardType": "object", "aiHint": "the pill bottle on the small table" }
      ]
    },
    {
        "id": "loc_james_workshop",
        "name": "James Lee's Workshop",
        "imagePrompt": "A contractor's workshop. Tools line the walls on pegboards. A large, open tool case is prominent on a workbench, with one empty slot clearly visible. An old photograph of a couple is tacked to a corkboard. A stack of letters is on the workbench. A computer is on a small desk. A closed door is visible leading to another room. The style is high-contrast, gritty, Sin City noir.",
        "sceneSummary": "James Lee's personal workshop. A place filled with tools of his trade and personal mementos.",
        "hotspots": [
            { "label": "Examine Tool Case", "targetCardId": "obj_empty_tool_case", "targetCardType": "object", "aiHint": "the large, open tool case with an empty slot" },
            { "label": "Read Letters", "targetCardId": "obj_love_letters", "targetCardType": "object", "aiHint": "the stack of letters on the workbench" },
            { "label": "Check Computer", "targetCardId": "obj_retirement_emails", "targetCardType": "object", "aiHint": "the computer on the small desk" },
            { "label": "View Photograph", "targetCardId": "obj_old_photo_couple", "targetCardType": "object", "aiHint": "the old photograph tacked to a corkboard" },
            { "label": "Go to Lounge", "type": "move", "targetCardId": "loc_workshop_lounge", "targetCardType": "location", "aiHint": "the closed door leading to another room" }
        ]
    },
     {
        "id": "loc_workshop_lounge",
        "name": "Workshop Lounge",
        "isInternal": true,
        "imagePrompt": "A surprisingly well-kept lounge area connected to a workshop. The room has ornate, hand-made wood carvings on the walls. There's a comfortable sitting area and a daybed for naps. A beautiful bouquet of flowers sits on a small table with a note attached. The style is high-contrast, gritty, Sin City noir.",
        "sceneSummary": "A private, comfortable lounge hidden away in James Lee's workshop.",
        "hotspots": [
            { "label": "Examine Flowers", "targetCardId": "obj_anniversary_flowers", "targetCardType": "object", "aiHint": "the beautiful bouquet of flowers on the table" },
            { "label": "Return to Workshop", "type": "move", "targetCardId": "loc_james_workshop", "targetCardType": "location", "aiHint": "the doorway leading back to the workshop" }
        ]
    }
  ],
  "objects": [
    // --- EXISTING OBJECTS (DO NOT REMOVE) ---
    {
      "id": "obj_hammer",
      "name": "Hammer with Fingerprints",
      "unidentifiedDescription": "A common claw hammer, possibly stained.",
      "category": "physical",
      "locationFoundId": "loc_alley",
      "timestamp": "2025-07-07T22:00:00Z",
      "timeToAdd": 10,
      "rarity": "material",
      "imagePrompt": "A standard claw hammer, with visible dark red stains and an impact pattern. A forensic technician is dusting the handle for fingerprints, which are highlighted in white powder. A faint smudge of light fluorescent paint is barely visible near the head of the hammer. Photorealistic, forensic focus.",
      "description": "The weapon used in the incident, found in James Lee's car. Forensic analysis confirms James's fingerprints are on the handle and Mei-Ling's blood is present. There are also faint traces of a light fluorescent paint that forensic tools cannot yet identify.",
      "tags": ["means"],
      "components": []
    },
    { "id": "obj_blood_spatter_report", "name": "Impact Pattern Analysis", "unidentifiedDescription": "A forensic analysis report.", "category": "document", "locationFoundId": "loc_apothecary", "timestamp": "2025-07-07T22:00:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A forensic report on a tablet, titled 'Impact Pattern Analysis'. It shows diagrams of a room with trajectory lines and calculated angles.", "description": "This precise forensic report on impact spatter patterns indicates the perpetrator stood at an approximate height of 5'5\" during the incident.", "tags": ["opportunity"], "components": [] },
    { "id": "obj_search_history", "name": "Browser Search History", "unidentifiedDescription": "A laptop's web browser history.", "category": "digital", "locationFoundId": "loc_studio", "timestamp": "2025-07-07T22:15:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "A close-up of a laptop screen showing a web browser's history. The top entry is a search for 'how to remove blood stains from wood floors', timestamped the night of the incident.", "description": "Sophia's search history shows a search for cleaning blood stains from wood, made on the night of the incident, potentially before the body was officially discovered.", "tags": ["motive", "opportunity"], "components": [] },
    { "id": "obj_ling_chen_statement", "name": "Witness Statement: Ling Chen", "unidentifiedDescription": "A signed witness statement.", "category": "document", "locationFoundId": "loc_apothecary", "timestamp": "2025-07-07T21:45:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A signed, official police statement document. A key sentence is highlighted: 'I heard them arguing, it was loud. Sophia was yelling about being thrown out.'", "description": "Neighbor Ling Chen's testimony describes a loud argument between Sophia and her mother, which could place Sophia at the scene at a critical time.", "tags": ["opportunity"], "components": [] },
    { "id": "obj_security_footage_glitch", "name": "Glitched Security Footage", "unidentifiedDescription": "A security camera feed.", "category": "digital", "locationFoundId": "loc_alley", "timestamp": "2025-07-07T22:45:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A security monitor displaying four camera feeds. One of the feeds is frozen, with a 'SIGNAL LOST' error message and a timestamp, indicating a 15-minute gap. The error seems unnatural, more like a digital erasure than a hardware failure.", "description": "Security footage from the alley is missing a crucial 15-minute segment around the time of the incident. System logs show continuous recording, suggesting the data was deliberately erased rather than lost to a simple glitch.", "tags": ["opportunity"], "components": [] },
    { "id": "obj_backup_footage", "name": "Uncorrupted Backup Footage", "unidentifiedDescription": "A backup CCTV storage device.", "category": "digital", "locationFoundId": "loc_apothecary_backroom", "timestamp": "2025-07-07T22:30:00Z", "timeToAdd": 10, "rarity": "critical", "imagePrompt": "A security monitor displaying a clear video feed. The footage shows a woman, identifiable as Sophia Wong, wearing gloves and placing an object into the trunk of a car parked in the alley. The timestamp matches the time of the missing footage from the main system. Sin City style, high-contrast.", "description": "The uncorrupted backup footage. It clearly shows Sophia Wong, wearing gloves, placing the hammer into the trunk of James Lee's car. This is direct evidence of her attempt to frame him.", "tags": ["opportunity"], "components": [] },
    { "id": "obj_payroll_receipt", "name": "Unpaid Payroll for Emily Patel", "unidentifiedDescription": "A business payroll document.", "category": "document", "locationFoundId": "loc_apothecary", "timestamp": "2025-07-01T17:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A payroll summary sheet for Emily Patel. It shows two months of 'Payment Due' with no corresponding 'Payment Made' entries.", "description": "Evidence that Emily Patel had not been paid for over two months, suggesting a potential source of resentment or conflict with her employer.", "tags": ["motive"], "components": [] },
    { "id": "obj_backroom_computer", "name": "Old Desktop Computer", "unidentifiedDescription": "An old office computer.", "category": "digital", "locationFoundId": "loc_apothecary_backroom", "timestamp": "2025-07-07T20:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A close-up of an old, beige tower PC from the early 2000s, covered in a thin layer of dust. The monitor is a bulky CRT type, displaying a simple login screen for an inventory system. Sin City style, high-contrast, photorealistic.", "description": "An old computer, likely used for inventory and accounting for the apothecary. It seems to have been in use for many years.", "components": [] },
    { "id": "obj_wrench", "name": "Adjustable Wrench", "unidentifiedDescription": "A contractor's wrench.", "category": "physical", "locationFoundId": "loc_alley", "timestamp": "2025-07-07T22:30:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A large, greasy adjustable wrench lying in a car trunk. The metal is worn and has some rust spots. Forensic focus, high-contrast, Sin City noir style.", "description": "A standard adjustable wrench, covered in grease. Forensic analysis confirms James Lee's fingerprints are present, consistent with his ownership of the car and tools.", "components": [] },
    { "id": "obj_screwdriver_set", "name": "Screwdriver Set", "unidentifiedDescription": "A set of screwdrivers.", "category": "physical", "locationFoundId": "loc_alley", "timestamp": "2025-07-07T22:30:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A set of screwdrivers in a worn plastic case, sitting in the trunk of a car. One screwdriver is slightly out of its holder. Forensic focus, high-contrast, Sin City noir style.", "description": "A well-used set of screwdrivers. Forensic analysis confirms James Lee's fingerprints are present on the case and several handles.", "components": [] },
    { "id": "obj_hacksaw", "name": "Hacksaw", "unidentifiedDescription": "A contractor's hacksaw.", "category": "physical", "locationFoundId": "loc_alley", "timestamp": "2025-07-07T22:30:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A small hacksaw with a black handle, lying in the trunk of a car among other tools. The blade shows signs of use. Forensic focus, high-contrast, Sin City noir style.", "description": "A small hacksaw, suitable for cutting metal or plastic pipes. A common tool for a contractor. Forensic analysis confirms James Lee's fingerprints are on the handle.", "components": [] },
    
    // --- NEW OBJECTS TO BE ADDED ---
    { "id": "obj_personal_mail", "name": "Personal Mail", "unidentifiedDescription": "A stack of personal mail.", "category": "document", "locationFoundId": "loc_apothecary", "timestamp": "2025-07-06T11:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A stack of personal letters and bills on a desk. One letter is from a bank regarding a loan application, and looks slightly concerning. High-contrast, gritty, Sin City noir.", "description": "A stack of personal mail addressed to Mei-Ling Wong. It contains a mix of personal correspondence and bills.", "components": [] },
    // Emily's Apartment
    { "id": "obj_emily_meiling_photo", "name": "Framed Photo", "unidentifiedDescription": "A framed photograph on a shelf.", "category": "physical", "locationFoundId": "loc_emily_apartment", "timestamp": "2024-01-01T12:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A framed photograph on a shelf showing two smiling women: a younger Emily Patel and an older Mei-Ling Wong, arm-in-arm. The photo is warm and suggests a close, mother-daughter-like bond. Sin City style, high-contrast black and white, but a single detail like Emily's red scarf is in color.", "description": "A cherished photo of Emily and Mei-Ling, suggesting a deep, affectionate relationship between the employee and her boss, more like family than colleagues." },
    { "id": "obj_emily_journal", "name": "Emily's Journal", "unidentifiedDescription": "A personal journal.", "category": "document", "locationFoundId": "loc_emily_apartment", "timestamp": "2025-07-01T20:00:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "An open personal journal. A recent entry reads: 'Mei-Ling says I have a gift. She wants me to take over the apothecary when she retires. She believes in me more than anyone.' The handwriting is neat and hopeful.", "description": "Emily's journal reveals Mei-Ling was mentoring her to eventually take over the business, refuting the idea of a financial motive for Emily." },
    { "id": "obj_emily_tablet_messages", "name": "Tablet with Messages", "unidentifiedDescription": "A tablet computer.", "category": "digital", "locationFoundId": "loc_emily_apartment", "timestamp": "2025-07-05T18:00:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A tablet screen displaying a text message conversation. One message from 'Mei-Ling' reads: 'Don't worry about the rent, Emily. My brother will help. Focus on your studies. You will be a great doctor one day.'", "description": "Messages between Emily and Mei-Ling show a supportive relationship. Mei-Ling was not only mentoring Emily but also providing her with financial support, making a motive based on unpaid wages less likely." },
    { "id": "obj_pill_bottle_meiling", "name": "Pill Bottle", "unidentifiedDescription": "A prescription pill bottle.", "category": "physical", "locationFoundId": "loc_emily_apartment", "timestamp": "2025-07-06T10:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A close-up of a prescription pill bottle. The label is for a common pain reliever, but a handwritten note is taped to it: 'For your headaches. Rest well. - M.W.' The handwriting is elegant.", "description": "A pill bottle with a caring, handwritten note from Mei-Ling Wong, further demonstrating their close, motherly bond." },

    // James Lee's Workshop
    { "id": "obj_empty_tool_case", "name": "Empty Tool Case", "unidentifiedDescription": "An empty slot in a tool case.", "category": "physical", "locationFoundId": "loc_james_workshop", "timestamp": "2025-07-07T08:00:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A large, professional contractor's tool case is open on a workbench. It's filled with various tools, but there is one perfectly shaped empty slot for a claw hammer.", "description": "James Lee's primary tool case. It's full of tools, making it believable he wouldn't notice a single hammer was missing, supporting the theory it could have been taken without his knowledge." },
    { "id": "obj_love_letters", "name": "Love Letters", "unidentifiedDescription": "A bundle of personal letters.", "category": "document", "locationFoundId": "loc_james_workshop", "timestamp": "2025-06-15T21:00:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "A bundle of handwritten letters tied with a red ribbon. One is open, and the text is legible: 'My dearest James, selling the shop is the right decision. Our future together is all that matters. Yours, Mei-Ling.'", "description": "A collection of love letters from Mei-Ling to James, revealing the true nature of their relationship. They were deeply in love and planning a future together, which strongly refutes any motive for James." },
    { "id": "obj_retirement_emails", "name": "Computer with Emails", "unidentifiedDescription": "An email client on a computer screen.", "category": "digital", "locationFoundId": "loc_james_workshop", "timestamp": "2025-07-02T14:00:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "A computer monitor displaying an email chain. The subject is 'Retirement Plans'. An email from Mei-Ling Wong discusses real estate listings in a quiet coastal town.", "description": "Emails between James and Mei-Ling confirm they were actively planning to sell their respective businesses and retire together, completely undermining the idea that James would harm her for financial gain." },
    { "id": "obj_old_photo_couple", "name": "Old Photograph", "unidentifiedDescription": "An old photograph on a corkboard.", "category": "physical", "locationFoundId": "loc_james_workshop", "timestamp": "2023-05-20T15:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A slightly faded color photograph tacked to a corkboard. It shows James Lee and Mei-Ling Wong laughing together in front of the apothecary, looking happy and relaxed.", "description": "An old photo that establishes the deep and long-standing connection between James and Mei-Ling, showing their relationship was not a recent or troubled one." },
    { "id": "obj_anniversary_flowers", "name": "Anniversary Flowers", "unidentifiedDescription": "A bouquet of anniversary flowers.", "category": "physical", "locationFoundId": "loc_workshop_lounge", "timestamp": "2025-07-07T18:00:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "A beautiful, fresh bouquet of flowers on a table. A small card is tucked into the bouquet. The card is open and readable: 'Happy Anniversary, my love. I can't wait to start our new life together. All my love, Mei-Ling.' The style is high-contrast, noir, but the flowers are in a vibrant, romantic red.", "description": "A bouquet of flowers with a heartfelt anniversary note from Mei-Ling to James, sent on the day of her death. This is powerful evidence of their loving relationship and shared future plans." },

    // Apothecary – Office & Back Rooms
    { "id": "obj_financial_records_desk", "name": "Financial Records (Desk)", "unidentifiedDescription": "A business ledger book.", "category": "document", "locationFoundId": "loc_apothecary", "timestamp": "2025-07-01T09:00:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A ledger book open on a desk. The entries show declining profits and a large, circled debt figure. A note in the margin reads: 'Must consider developer's offer.'", "description": "The apothecary's financial records confirm the business was struggling, which provides context for Mei-Ling considering the sale and establishes Sophia's motive to prevent it. It also confirms the late payroll for Emily." },
    { "id": "obj_rubber_gloves", "name": "Rubber Gloves with Paint Traces", "unidentifiedDescription": "A pair of discarded rubber gloves.", "category": "physical", "locationFoundId": "loc_apothecary_backroom", "timestamp": "2025-07-07T22:10:00Z", "timeToAdd": 10, "rarity": "material", "imagePrompt": "A pair of black rubber gloves discarded in a trash can. A forensic light reveals faint traces of a light fluorescent paint on the fingertips. High-contrast, forensic focus.", "description": "A pair of rubber gloves found in the backroom trash. Crucially, they have traces of the same fluorescent paint found on the murder weapon and in Sophia's studio, linking her to the crime scene cleanup." },
    
    // Sophia’s Art Studio
    { "id": "obj_fluorescent_paint", "name": "Fluorescent Paint", "unidentifiedDescription": "A collection of artist's paints.", "category": "physical", "locationFoundId": "loc_studio", "timestamp": "2025-07-07T22:00:00Z", "timeToAdd": 10, "rarity": "critical", "imagePrompt": "A close-up of several cans and tubes of fluorescent, glowing paint on a messy workbench in an art studio. One tube of light green paint is open and has a smudge next to it. Sin City noir style, high contrast, with the glowing paint in searing color.", "description": "A collection of vibrant, fluorescent paints used by Sophia for her artwork. The light green paint seems to have been used recently. ADA has noted its unique chemical signature matches the trace on the hammer.", "tags": ["means"] },
    { "id": "obj_mother_daughter_art", "name": "Art Piece", "unidentifiedDescription": "An abstract painting.", "category": "physical", "locationFoundId": "loc_studio", "timestamp": "2025-06-01T16:00:00Z", "timeToAdd": 10, "rarity": "irrelevant", "imagePrompt": "A large, abstract painting on an easel. The painting features two stylized figures, one larger and protective, the other smaller and struggling. The colors are dark and conflicted. High-contrast, noir style.", "description": "A recent art piece by Sophia with a recurring motif of a mother and daughter, providing subtextual insight into her complex emotional state regarding her mother." },
    { "id": "obj_used_gloves_studio", "name": "Trash Bin with Used Gloves", "unidentifiedDescription": "A trash bin with discarded items.", "category": "physical", "locationFoundId": "loc_studio", "timestamp": "2025-07-07T22:20:00Z", "timeToAdd": 10, "rarity": "circumstantial", "imagePrompt": "A small trash bin in an art studio. Inside are several pairs of paint-stained rubber gloves, similar to the ones found at the crime scene.", "description": "The trash bin contains multiple pairs of used gloves, reinforcing the narrative that Sophia was meticulous about cleaning up and not leaving fingerprints." }
  ],
  "evidenceGroups": [
    {
      "id": "group_desk_contents",
      "name": "Desk Contents",
      "imagePrompt": "A cluttered desk in a back office. Financial records, personal mail, and a stack of payroll documents are spread across the surface.",
      "description": "The contents of Mei-Ling Wong's desk reveal a business and a family under immense pressure from all sides.",
      "objectIds": [
        "obj_financial_records_desk",
        "obj_payroll_receipt",
        "obj_personal_mail"
      ]
    },
    {
      "id": "group_trunk_contents",
      "name": "Trunk Contents",
      "imagePrompt": "The open trunk of a car at night. A claw hammer with dark stains is visible, alongside an adjustable wrench, a set of screwdrivers, and a small hacksaw. The scene is illuminated by a single forensic flashlight beam, creating deep shadows. High-contrast, gritty, Sin City noir.",
      "description": "The contents of the trunk of James Lee's car, found parked in the alley behind the crime scene.",
      "objectIds": [
        "obj_hammer",
        "obj_wrench",
        "obj_screwdriver_set",
        "obj_hacksaw"
      ]
    }
  ],
  "bounties": [
    {
      "id": "bounty_1",
      "title": "Decipher Encrypted Message",
      "description": "A scrambled message was intercepted from a burner phone. Use your wits to decode it.",
      "reward": 25
    },
    {
      "id": "bounty_2",
      "title": "Forensic Cross-Reference",
      "description": "Find the link between two seemingly unrelated pieces of evidence from an old case file.",
      "reward": 50
    },
    {
      "id": "bounty_3",
      "title": "Safe Crack Simulation",
      "description": "ADA needs help with a cold case file. Crack this digital safe to access the records.",
      "reward": 75
    }
  ],
  "evidenceStacks": [
    {
      "anchorId": "obj_hammer",
      "linkedIds": ["obj_fluorescent_paint", "obj_rubber_gloves"],
      "totalSlots": 3
    }
  ],
  "canonicalTimeline": {
    "culpritId": "char_sophia_wong",
    "keyEvents": [
        { "objectId": "obj_journal_entry", "description": "Reveals Sophia's strong emotional motive regarding her family's legacy." },
        { "objectId": "obj_ling_chen_statement", "description": "Places Sophia at the scene of the crime during the time of the murder, establishing opportunity." },
        { "objectId": "obj_hammer", "description": "The murder weapon, which is central to the crime." },
        { "objectId": "obj_fluorescent_paint", "description": "The critical link between Sophia (from her studio) and the murder weapon." },
        { "objectId": "obj_search_history", "description": "Shows Sophia's attempt to cover her tracks by researching how to clean bloodstains." },
        { "objectId": "obj_backup_footage", "description": "Provides direct visual evidence of Sophia planting the hammer in James's car." },
        { "objectId": "obj_security_footage_glitch", "description": "Demonstrates a deliberate attempt to erase evidence, showing consciousness of guilt." }
    ]
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
    'loc_apothecary': { top: '50%', left: '50%' },
    'loc_alley': { top: '45%', left: '65%' },
    'loc_studio': { top: '60%', left: '35%' },
    'loc_emily_apartment': { top: '30%', left: '40%' },
    'loc_james_workshop': { top: '75%', left: '60%' },
    'loc_workshop_lounge': { top: '0%', left: '0%' }, // Coords don't matter, won't be shown on map
    'loc_apothecary_backroom': { top: '0%', left: '0%' } // Coords don't matter, won't be shown on map
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
      lastEventTimestamp: "2025-07-07T22:00:00Z",
      lastEventDescription: `Crime Scene Established. Victim: ${victimName}.`,
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
    const crimeScene = rawData.locations.find((l:any) => l.id === 'loc_apothecary');

    return {
        title: rawData.storyInfo.title,
        storyInfo: {
            ...rawData.storyInfo,
            mapTitle: 'San Francisco',
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