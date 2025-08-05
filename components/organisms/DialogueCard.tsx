/**
 * @file DialogueCard.tsx
 * @description The main container for the unified interactive dialogue system. This component is a cornerstone
 * of the new architecture, capable of functioning as either a witness interview or a suspect interrogation
 * based on the data it receives.
 *
 * @architectural_refactor
 * The component's UI has been significantly redesigned for clarity and immersion. It now uses a "transcript"
 * view with the current question pinned at the top, and a dedicated "actions" panel at the bottom,
 * removing the free-form text input for a more guided experience. The logic has been updated to drive
 * this new flow, cleanly separating the display of past conversation from the selection of future actions.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { goBack, showModal, hideModal } from '../../store/uiSlice';
import { Character, DialogueData, Insight, LineOfInquiryData, WitnessResponse, DialogueChunkData, ActiveFeedback } from '../../types';
import { createEvidenceFromTestimony, addTimeSpent } from '../../store/storySlice';
import { useInterrogationAI } from '../../hooks/useInterrogationAI';
import ChatLog from './ChatLog';
import InterrogationActions from '../molecules/InterrogationActions'; // New component
import QuestionSelectView from './QuestionSelectView';
import { GAME_MECHANICS } from '../../config';
import PhaseHeader from './PhaseHeader';

type InterrogationPhase = 'select' | 'active' | 'complete';

interface DialogueCardProps {
  character: Character;
}

const DialogueCard: React.FC<DialogueCardProps> = ({ character }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const dialogueData = useMemo(() => 
    character.components.find(c => c.type === 'dialogue')?.props as DialogueData | undefined,
    [character.components]
  );
  
  // State now only holds witness responses. Player questions are handled separately.
  const [messages, setMessages] = useState<WitnessResponse[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(dialogueData?.suggestedQuestions || []);
  
  const { sendMessage, isAiResponding } = useInterrogationAI(dialogueData?.persona || '');
  
  const [phase, setPhase] = useState<InterrogationPhase>('select');
  const [activeLoi, setActiveLoi] = useState<LineOfInquiryData | null>(null);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [loiStatus, setLoiStatus] = useState<Record<string, 'completed'>>({});
  const [initialQuestions, setInitialQuestions] = useState<string[] | null>(null);
  const [evidenceCreatedChunkIds, setEvidenceCreatedChunkIds] = useState<Set<string>>(new Set());
  const [completionData, setCompletionData] = useState<{ loi: LineOfInquiryData, insight?: Insight } | null>(null);
  const [revealedCriticalIds, setRevealedCriticalIds] = useState<Set<string>>(new Set());
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(null);
  
  // New state to manage the "pinned" question in the transcript view.
  const [lastQuestionAsked, setLastQuestionAsked] = useState<string | null>(null);

  useEffect(() => {
    if (!dialogueData) return;
    
    if (dialogueData.mode === 'interrogation') {
      setPhase('select');
    } else {
      if (dialogueData.openingStatement) {
        const openingChunk: DialogueChunkData = { id: `dialogue-chunk-${character.id}-opening`, text: dialogueData.openingStatement };
        setMessages([{ sender: 'witness', chunks: [openingChunk] }]);
      }
      setPhase('active');
    }
  }, [dialogueData, character.id]);

  const handleSelectLoi = useCallback((loi: LineOfInquiryData) => {
    dispatch(addTimeSpent(GAME_MECHANICS.QUESTION_TIME_ADDITION));
    setActiveLoi(loi);
    setPhaseProgress(0);
    setMessages([]);
    setLastQuestionAsked(null); // Clear the last question
    setEvidenceCreatedChunkIds(new Set());
    setRevealedCriticalIds(new Set());
    setInitialQuestions(loi.initialQuestions);
    setPhase('active');
  }, [dispatch]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isAiResponding || !dialogueData) return;
    
    if (dialogueData.mode === 'interrogation') {
        if (!activeLoi) return;
        if (!initialQuestions) {
            dispatch(addTimeSpent(GAME_MECHANICS.QUESTION_TIME_ADDITION));
        }
        if (initialQuestions) setInitialQuestions(null);
    }
    
    setLastQuestionAsked(text);
    
    const messageWithContext = dialogueData.mode === 'interrogation' && activeLoi 
      ? `(My current line of inquiry is: "${activeLoi.label}")\n\n${text}` 
      : text;
    
    const parsed = await sendMessage(messageWithContext);

    if (parsed) {
        if (dialogueData.mode === 'interrogation') {
            const progressValue = parsed.phaseUpdate.progressValue || 0;
            setActiveFeedback({ text: parsed.adaFeedback, progressChange: progressValue, source: 'question' });
            setPhaseProgress(prev => Math.min(GAME_MECHANICS.PHASE_COMPLETION_GOAL, prev + progressValue));
        }
        
        const chunksWithIds = parsed.chunks.map((chunk): DialogueChunkData => {
            let hash = 0;
            for (let i = 0; i < chunk.text.length; i++) hash = ((hash << 5) - hash + chunk.text.charCodeAt(i)) | 0;
            const id = `dialogue-chunk-${character.id}-${hash}`;
            return { ...chunk, id };
        });
        
        const witnessResponseMessage: WitnessResponse = { sender: 'witness', chunks: chunksWithIds };
        setMessages(prev => [...prev, witnessResponseMessage]);
        
        if (parsed.nextSuggestedQuestions) {
            setSuggestedQuestions(parsed.nextSuggestedQuestions);
        }
        
        if (dialogueData.mode === 'interrogation' && parsed.phaseCompleted && activeLoi) {
            const completedInsight = chunksWithIds.find(c => c.insight)?.insight;
            setCompletionData({ loi: activeLoi, insight: completedInsight });
        }
        
        setCurrentImageIndex(prev => (prev + 1) % dialogueData.slideshowPrompts.length);
    } else {
        const fallbackChunk: DialogueChunkData = { id: `fallback-${Date.now()}`, text: "(The response is unclear or there was a connection issue.)" };
        const fallbackResponse: WitnessResponse = { sender: 'witness', chunks: [fallbackChunk] };
        setMessages(prev => [...prev, fallbackResponse]);
    }
  }, [isAiResponding, dialogueData, sendMessage, activeLoi, initialQuestions, dispatch, character.id]);
  
  const handleCreateEvidence = useCallback((chunk: DialogueChunkData) => {
    if (evidenceCreatedChunkIds.has(chunk.id)) return;

    dispatch(createEvidenceFromTestimony({ chunk, character }));

    setEvidenceCreatedChunkIds(prev => new Set(prev).add(chunk.id));
    
    const evidenceProgress = GAME_MECHANICS.EVIDENCE_CREATION_PROGRESS;
    setPhaseProgress(prev => Math.min(GAME_MECHANICS.PHASE_COMPLETION_GOAL, prev + evidenceProgress));
    
    setActiveFeedback({ text: 'Evidence logged. This is a relevant statement.', progressChange: evidenceProgress, source: 'evidence' });

    if (chunk.isCriticalClue && chunk.insight) {
      dispatch(showModal({ type: 'insightUnlocked', props: { insight: chunk.insight, statement: chunk.text } }));
      setRevealedCriticalIds(prev => new Set(prev).add(chunk.id));
    }
  }, [evidenceCreatedChunkIds, dispatch, character]);

  const handleEndPhase = useCallback(() => {
    dispatch(hideModal());
    setPhase('select');
    setActiveLoi(null);
    setCompletionData(null);
  }, [dispatch]);

  useEffect(() => {
    if (!activeLoi || phase !== 'active' || dialogueData?.mode !== 'interrogation') return;

    if (completionData?.loi.id === activeLoi.id || phaseProgress >= GAME_MECHANICS.PHASE_COMPLETION_GOAL) {
        setLoiStatus(prev => ({ ...prev, [activeLoi.id]: 'completed' }));
        const foundInsight = completionData?.insight || messages.flatMap(m => m.chunks)
                                     .find(c => revealedCriticalIds.has(c.id))?.insight;
        dispatch(showModal({ type: 'phaseComplete', props: { 
            lineOfInquiryLabel: activeLoi.label, 
            insight: foundInsight,
            onConfirm: handleEndPhase
        }}));
        setPhase('complete');
    }

  }, [phaseProgress, activeLoi, dispatch, messages, completionData, phase, revealedCriticalIds, handleEndPhase, dialogueData?.mode]);

  if (!character || !dialogueData) return <div>Loading dialogue...</div>;

  const renderContent = () => {
    if (phase === 'select' && dialogueData.interrogation) {
      return (
        <QuestionSelectView
          character={character}
          status={loiStatus}
          onEndInterrogation={() => dispatch(goBack())}
        />
      );
    }
    
    // The new, unified layout for an active dialogue session.
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {dialogueData.mode === 'interrogation' && activeLoi && (
          <PhaseHeader 
            characterId={character.id}
            witnessName={character.name}
            slideshowPrompts={dialogueData.slideshowPrompts}
            currentImageIndex={currentImageIndex}
            lineOfInquiryLabel={activeLoi.label}
            phaseProgress={phaseProgress}
            activeFeedback={activeFeedback}
            onClearFeedback={() => setActiveFeedback(null)}
          />
        )}
        
        <ChatLog
          lastQuestionAsked={lastQuestionAsked}
          messages={messages}
          mode={dialogueData.mode}
          onCreateEvidence={handleCreateEvidence}
          evidenceCreatedChunkIds={evidenceCreatedChunkIds}
          revealedCriticalIds={revealedCriticalIds}
          isAiResponding={isAiResponding}
        />
        
        <div className="flex-shrink-0">
            <InterrogationActions
              suggestedQuestions={suggestedQuestions}
              initialQuestions={initialQuestions}
              isAiResponding={isAiResponding}
              onSendMessage={handleSendMessage}
            />
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full flex flex-col bg-brand-bg animate-slide-in-bottom relative">
      {renderContent()}
    </div>
  );
};

export default DialogueCard;