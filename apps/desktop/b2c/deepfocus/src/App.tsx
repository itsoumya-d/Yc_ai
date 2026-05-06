import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getStreak } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { HomeView } from '@/components/views/home-view';
import { SessionView } from '@/components/views/session-view';
import { AnalyticsView } from '@/components/views/analytics-view';
import { SoundscapesView } from '@/components/views/soundscapes-view';
import { HistoryView } from '@/components/views/history-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'home': return <HomeView />;
    case 'session': return <SessionView />;
    case 'analytics': return <AnalyticsView />;
    case 'soundscapes': return <SoundscapesView />;
    case 'history': return <HistoryView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView } = useAppStore();
  const showTitleBar = currentView !== 'welcome';

  // Load settings and apply theme on mount
  useEffect(() => {
    const settings = getSettings();
    const store = useAppStore.getState();

    // Apply persisted settings to store
    store.setFocusMinutes(settings.focusMinutes);
    store.setBreakMinutes(settings.breakMinutes);
    store.setLongBreakMinutes(settings.longBreakMinutes);
    store.setBlockingMode(settings.blockingMode);
    store.setStreak(getStreak());

    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      {showTitleBar && <TitleBar />}

      <div className="flex-1 overflow-hidden">
        {renderView(currentView)}
      </div>
    </div>
  );
}
