import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getDesigns } from '@/lib/storage';
import { TitleBar } from '@/components/layout/title-bar';
import { StatusBar } from '@/components/layout/status-bar';
import { WelcomeView } from '@/components/views/welcome-view';
import { StudioView } from '@/components/views/studio-view';
import { GalleryView } from '@/components/views/gallery-view';
import { MarketplaceView } from '@/components/views/marketplace-view';
import { SettingsView } from '@/components/views/settings-view';

function renderView(view: string) {
  switch (view) {
    case 'welcome': return <WelcomeView />;
    case 'studio': return <StudioView />;
    case 'gallery': return <GalleryView />;
    case 'marketplace': return <MarketplaceView />;
    case 'print': return <StudioView />;
    case 'settings': return <SettingsView />;
    default: return <WelcomeView />;
  }
}

export function App() {
  const { currentView, setOpenaiApiKey, setTheme, setDesigns } = useAppStore();

  useEffect(() => {
    // Load settings from localStorage
    const s = getSettings();
    setOpenaiApiKey(s.openaiApiKey);
    setTheme(s.theme);

    // Apply theme to DOM
    if (s.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', s.theme);
    }

    // Load designs from localStorage
    const designs = getDesigns();
    if (designs.length > 0) {
      setDesigns(designs);
    }
  }, [setOpenaiApiKey, setTheme, setDesigns]);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      <TitleBar />

      <div className="flex-1 overflow-hidden">
        {renderView(currentView)}
      </div>

      <StatusBar />
    </div>
  );
}
