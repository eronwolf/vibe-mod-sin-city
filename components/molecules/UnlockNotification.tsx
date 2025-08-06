/**
 * @file UnlockNotification.tsx
 * @description A notification component that shows when new timeline symbols have been unlocked.
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectAllObjects, selectAllEvents } from '../../store/storySlice';
import { CheckCircle, X } from 'lucide-react';

interface UnlockNotificationProps {
  onClose?: () => void;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  
  const allObjects = useSelector(selectAllObjects);
  const allEvents = useSelector(selectAllEvents);

  useEffect(() => {
    // Check for newly unlocked items
    const newlyUnlocked: string[] = [];
    
    // Check objects
    allObjects.forEach(obj => {
      if (obj.hasBeenUnlocked && obj.unlocks) {
        obj.unlocks.forEach(unlock => {
          newlyUnlocked.push(`${unlock.type}: ${unlock.ref}`);
        });
      }
    });
    
    // Check events
    allEvents.forEach(event => {
      if (event.hasBeenUnlocked) {
        newlyUnlocked.push(`event: ${event.name}`);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedItems(newlyUnlocked);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  }, [allObjects, allEvents]);

  if (!isVisible || unlockedItems.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-brand-surface border border-brand-primary rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-oswald text-white text-sm uppercase tracking-wider mb-2">
              New Timeline Symbols Unlocked!
            </h3>
            <div className="space-y-1">
              {unlockedItems.slice(0, 3).map((item, index) => (
                <p key={index} className="text-brand-text-muted text-xs">
                  • {item}
                </p>
              ))}
              {unlockedItems.length > 3 && (
                <p className="text-brand-text-muted text-xs">
                  ...and {unlockedItems.length - 3} more
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-brand-text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockNotification; 