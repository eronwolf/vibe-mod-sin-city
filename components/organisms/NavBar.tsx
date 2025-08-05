/**
 * @file NavBar.tsx
 * @description Renders the main navigation bar at the bottom of the screen.
 * This file has been refactored for performance by extracting the `NavButton` sub-component
 * and updated to provide a clearer active state, notification counts, and integrate the player's token wallet.
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setActiveView } from '../../store/uiSlice';
import { ViewType, PlayerAction } from '../../types';
import { Users, Map, BookOpen, Coins } from 'lucide-react';
import { useADA } from '../../hooks/useADA';
import { selectTimeSpent } from '../../store/storySlice';

/**
 * --- Extracted Sub-Component: NavButton ---
 * A memoized, reusable button for the navigation bar, now with notification support.
 */
const NavButton: React.FC<{ 
  view: ViewType; 
  label: string; 
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (view: ViewType) => void;
  notificationCount?: number;
}> = React.memo(({ view, label, icon, isActive, onClick, notificationCount = 0 }) => {
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 h-full relative
      ${isActive ? 'bg-brand-primary text-brand-bg' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}
      aria-label={`Go to ${label}`}
    >
      <div className="relative">
        {icon}
        {notificationCount > 0 && (
          <div className="absolute -top-2 -right-4 bg-brand-primary text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center border-2 border-brand-bg">
            {notificationCount}
          </div>
        )}
      </div>
      <span className="text-xs font-oswald uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
});

/**
 * The main navigation bar component.
 */
const NavBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeView, timelineMessages } = useSelector((state: RootState) => state.ui);
  const timeSpent = useSelector(selectTimeSpent);
  const triggerADA = useADA();

  const handleNavClick = React.useCallback((view: ViewType) => {
    // Prevent re-triggering ADA if the view is already active
    if (activeView === view) return;
    dispatch(setActiveView(view));
    triggerADA(PlayerAction.VIEW_LIST, `Player is now viewing the list of ${view}.`);
  }, [dispatch, triggerADA, activeView]);

  return (
    <nav className="w-full bg-brand-surface h-16 flex items-center border-t-2 border-brand-border shadow-lg">
      <NavButton view="locations" label="Locations" icon={<Map size={24} />} isActive={activeView === 'locations'} onClick={handleNavClick} />
      <NavButton view="people" label="People" icon={<Users size={24} />} isActive={activeView === 'people'} onClick={handleNavClick} />
      <NavButton 
        view="blankTimeline"
        label="Timeline"
        icon={<BookOpen size={24} />}
        isActive={activeView === 'blankTimeline'}
        onClick={handleNavClick}
        notificationCount={timelineMessages.length}
      />
       <button
        onClick={() => handleNavClick('timeSpent')}
        className={`flex items-center justify-center w-full transition-colors duration-200 h-full relative px-2 gap-2 bg-brand-surface border-l-2 border-brand-border shadow-inner shadow-black/50
        ${activeView === 'timeSpent' ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:bg-white/10'}`}
        aria-label={`Go to Time Spent. Total time: ${timeSpent}`}
      >
        <Coins size={24} className={activeView === 'timeSpent' ? 'text-white' : 'text-yellow-400'} />
        <span className="font-mono text-lg font-bold">{timeSpent}</span>
      </button>
    </nav>
  );
};

export default NavBar;