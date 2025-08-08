/**
 * @file IntroSlideshowModal.tsx
 * @description A robust, cinematic slideshow to introduce the story. This component is architected
 * for stability and a smooth user experience by preloading all required images before the slideshow
 * begins. This is achieved by adding all image generation requests to a central, serial queue, which
 * prevents visual "hangs" from slow API responses and avoids API rate-limiting errors.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { hideModal, markIntroAsPlayed } from '../../../store/uiSlice';
import { queueImageGeneration, processImageGenerationQueue, selectImageUrls, selectImageErrors } from '../../../store/storySlice';
import { loadIntroSlideshowData } from '../../../services/cartridgeLoader';
import ImageWithLoader from '../../molecules/ImageWithLoader';
import { useCardImage } from '../../../hooks/useCardImage';
import Spinner from '../../atoms/Spinner';
import Button from '../../atoms/Button';
import { UI_CONFIG } from '../../../config';

const SLIDE_DURATION = UI_CONFIG.INTRO_SLIDESHOW_DURATION;

const IntroSlideshowModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isPreloading, setIsPreloading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [slideshowData, setSlideshowData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  const cachedImageUrls = useSelector(selectImageUrls);
  const imageErrors = useSelector(selectImageErrors);
  
  // Load slideshow data from cartridge
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadIntroSlideshowData('./data/cartridges/example-story.json');
        setSlideshowData(data);
        setIsLoadingData(false);
      } catch (error) {
        console.error('Failed to load slideshow data:', error);
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);
  
  const totalImages = slideshowData.length;
  // Memoized calculation to count how many images for this slideshow have been processed.
  const preloadedImageCount = useMemo(() => {
    return slideshowData.reduce((count, slide) => {
        // An image is considered "processed" and ready to be shown if we have either
        // a valid URL for it or a confirmed error state for it. This prevents the
        // preloader from getting stuck if an image fails to generate.
        return (cachedImageUrls[slide.id] || imageErrors[slide.id]) ? count + 1 : count;
    }, 0);
  }, [cachedImageUrls, imageErrors, slideshowData]);

  // --- Core Stability Feature: Add all images to a central queue on mount ---
  // On first mount, we dispatch requests for ALL images needed for the slideshow.
  // This adds them to the central, concurrent batch processing queue in storySlice.
  // This is a critical architectural decision for ensuring a smooth cinematic.
  useEffect(() => {
    if (isLoadingData || slideshowData.length === 0) return;
    
    const imagesToQueue = slideshowData.filter(slide => !cachedImageUrls[slide.id]);
    
    if (imagesToQueue.length > 0) {
      imagesToQueue.forEach(slide => {
        dispatch(queueImageGeneration({
          cardId: slide.id,
          prompt: slide.imagePrompt,
          colorTreatment: 'selectiveColor'
        }));
      });
      // This will start the queue processor, which will handle the requests.
      // The processor has an internal guard to prevent multiple concurrent runs.
      dispatch(processImageGenerationQueue());
    } else {
      // All images were already in the cache, no need to preload.
      setIsPreloading(false);
    }
  }, [dispatch, cachedImageUrls, slideshowData, isLoadingData]); // This effect runs only once on mount.

  // --- Core UX Feature: Wait for Preloading to Complete ---
  // This effect monitors the number of loaded images. Only when all images for the
  // slideshow are confirmed to be in the Redux cache (or have errored) do we end the preloading state.
  // This prevents the slideshow from starting and then "hanging" on a slow image generation.
  useEffect(() => {
    if (preloadedImageCount === totalImages) {
      setIsPreloading(false);
    }
  }, [preloadedImageCount, totalImages]);


  const handleClose = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dispatch(markIntroAsPlayed());
    dispatch(hideModal());
  }, [dispatch]);

  // Effect for advancing the slides automatically
  useEffect(() => {
    if (isPreloading || isFadingOut || slideshowData.length === 0) return; // Don't run timer until preloading/fading is done

    const isLastSlide = currentIndex === slideshowData.length - 1;
    // The final slide is held for twice as long for dramatic effect.
    const duration = isLastSlide ? SLIDE_DURATION * 2 : SLIDE_DURATION;

    timerRef.current = window.setTimeout(() => {
      if (!isLastSlide) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        // Start fading out on the last slide for a cinematic exit.
        setIsFadingOut(true);
        // Close the modal after the fade animation (1s) completes.
        setTimeout(handleClose, 1000);
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPreloading, isFadingOut, handleClose, slideshowData.length]);
  
  const currentSlide = slideshowData[currentIndex];
  // `useCardImage` will now instantly fetch from the Redux cache since we preloaded everything.
  const { imageUrl, isLoading: isImageLoading } = useCardImage(currentSlide, 'selectiveColor');

  const isLastSlide = currentIndex === slideshowData.length - 1;
  const slideDuration = isLastSlide ? SLIDE_DURATION * 2 : SLIDE_DURATION;
  const animationName = `progress-${currentIndex}`;
  const animationKeyframes = `@keyframes ${animationName} { from { width: 0% } to { width: 100% } }`;

  if (isLoadingData || isPreloading || !slideshowData.length) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <Spinner />
        <h2 className="text-2xl font-oswald text-brand-text mt-6">GENERATING CINEMATIC</h2>
        <p className="text-brand-text-muted">
            {`Loading scene ${preloadedImageCount} of ${totalImages}...`}
        </p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-center ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
       <style>{animationKeyframes}</style>
       {/* Header with progress bars and skip button */}
       <header className={`absolute top-0 left-0 right-0 p-4 z-30 flex items-center gap-4 transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex-1 flex gap-1">
                {slideshowData.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white"
                            style={{ width: index < currentIndex ? '100%' : '0%' }}
                        />
                        {index === currentIndex && (
                            <div
                                className="h-full bg-white"
                                style={{ animation: `${animationName} ${slideDuration}ms linear` }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <Button onClick={handleClose} variant="secondary" className="px-3 py-1 text-xs uppercase flex-shrink-0">Skip</Button>
       </header>

      {/* Slide Content */}
      <div className={`w-full h-full relative select-none transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Image fills the entire container */}
        <div className="w-full h-full bg-brand-surface">
            {currentSlide && <ImageWithLoader imageUrl={imageUrl} isLoading={isImageLoading} alt="Introductory slide" objectFit="cover" />}
        </div>

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10"></div>

        {/* Text container positioned at the bottom, over the image and gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 md:pb-24 text-center z-20">
            {/* Animate the text itself for a nicer transition */}
            {currentSlide && (
              <p className="text-white text-xl md:text-2xl leading-relaxed md:leading-loose drop-shadow-lg animate-fade-in">
                {currentSlide.narration}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default IntroSlideshowModal;
