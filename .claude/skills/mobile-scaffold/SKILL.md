---
name: mobile-scaffold
description: Bootstrap a new React Native/Expo project from the saas-ideas/ specification documents. Reads tech-stack.md, features.md, screens.md, and database-schema.md to generate a complete project structure including navigation, screens, Supabase setup, component library, and state management. Arguments: "folder-path" relative to saas-ideas/ (e.g., "mobile-first/b2c/05-govpass" or "mobile-first/b2b/09-stockpulse")
---

Bootstrap a React Native/Expo mobile project from the specification documents in `saas-ideas/`.

## Step 1: Read All Specification Files

From `saas-ideas/[folder-path]/`:
1. `README.md` — project overview, core value proposition
2. `tech-stack.md` — required dependencies, architecture decisions
3. `features.md` — full feature list with priorities
4. `screens.md` — screen list with navigation structure and UI descriptions
5. `database-schema.md` — database tables and relationships
6. `theme.md` — color scheme, typography, design direction (if exists)
7. `api-guide.md` — external API integrations required

## Step 2: Determine Target Directory

The project directory name should be the project slug (e.g., `govpass/`, `stockpulse/`).
Check if a directory already exists — if yes, report what's there before proceeding.

## Step 3: Generate `package.json`

Based on tech-stack.md dependencies:

```json
{
  "name": "[project-slug]",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.2",
    "react-native": "0.76.x",
    "@supabase/supabase-js": "^2.45.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "zustand": "^5.0.0",
    "react-native-safe-area-context": "^4.11.0",
    "react-native-screens": "^4.0.0",
    "@expo/vector-icons": "^14.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0"
    // [Add project-specific deps from tech-stack.md:
    //  Camera: expo-camera, expo-barcode-scanner
    //  Location: expo-location
    //  HealthKit: react-native-health (iOS only)
    //  Notifications: expo-notifications
    //  File system: expo-file-system, expo-document-picker
    //  Image: expo-image-picker, expo-image-manipulator
    //  Maps: react-native-maps
    //  Offline: @tanstack/react-query + react-native-mmkv
    // ]
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "typescript": "^5.3.0",
    "@types/react": "~18.3.0",
    "@types/react-native": "^0.73.0",
    "expo-lint": "^0.1.0"
  }
}
```

## Step 4: Generate `app.json`

```json
{
  "expo": {
    "name": "[Project Name from README]",
    "slug": "[project-slug]",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "[primary color from theme.md]"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ycsaas.[projectslug]",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "[primary color]"
      },
      "package": "com.ycsaas.[projectslug]",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "single"
    },
    "plugins": [
      "expo-router"
      // [Add feature-specific plugins from tech-stack.md]
    ],
    "scheme": "[project-slug]"
  }
}
```

## Step 5: Generate `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

## Step 6: Generate Navigation Structure

Based on `screens.md`, create:

**`app/_layout.tsx`** (root layout with auth check):
```typescript
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return null; // Splash screen handles this

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

**`app/(auth)/_layout.tsx`** and auth screens:
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`

**`app/(tabs)/_layout.tsx`** with tab structure from screens.md:
```typescript
import { Tabs } from 'expo-router';
import { [IconName] } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ ... }}>
      {/* Tab for each main screen from screens.md */}
    </Tabs>
  );
}
```

**Screen stubs** for each screen in screens.md — one file per screen with:
- Component name matching the screen
- Basic layout matching the screen description
- TODO comments for the specific features

## Step 7: Generate `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Note: Mobile apps use `EXPO_PUBLIC_` prefix (not `NEXT_PUBLIC_`)

## Step 8: Generate Initial Supabase Migrations

From `database-schema.md`, generate SQL migration files following the same RLS pattern as web projects:
- `supabase/migrations/001_init.sql` — extensions, set_updated_at function
- `supabase/migrations/002_[primary-entity].sql` — main entity table with RLS

## Step 9: Generate Base UI Components

Create `src/components/ui/`:

**`Button.tsx`** — uses TouchableOpacity or Pressable with variants
**`Card.tsx`** — View with shadow and border radius
**`Input.tsx`** — TextInput with label and error state
**`Text.tsx`** — Text with typography variants matching theme.md
**`LoadingSpinner.tsx`** — ActivityIndicator wrapper

All components use the color palette from `theme.md`.

## Step 10: Generate Zustand Stores

For each entity in `database-schema.md`, create `src/store/[entity]Store.ts`:

```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { [Entity] } from '@/types/database';

interface [Entity]State {
  [entities]: [Entity][];
  loading: boolean;
  error: string | null;
  fetch[Entities]: () => Promise<void>;
  create[Entity]: (data: [Entity]Input) => Promise<void>;
  update[Entity]: (id: string, data: Partial<[Entity]Input>) => Promise<void>;
  delete[Entity]: (id: string) => Promise<void>;
}

export const use[Entity]Store = create<[Entity]State>((set, get) => ({
  [entities]: [],
  loading: false,
  error: null,
  fetch[Entities]: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .order('created_at', { ascending: false });
    set({ [entities]: data ?? [], loading: false, error: error?.message ?? null });
  },
  // [create, update, delete implementations]
}));
```

## Step 11: Generate `hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

## Step 12: Generate `.env.example`

```bash
# Supabase (note: EXPO_PUBLIC_ prefix for React Native, not NEXT_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# [Project-specific env vars from api-guide.md]
# e.g., EXPO_PUBLIC_GOOGLE_MAPS_KEY= (for RouteAI, SiteSync)
# e.g., OPENAI_API_KEY= (server-side only — use Supabase Edge Functions)
```

## Step 13: Output Summary

List:
1. All files created with their paths
2. Screens from screens.md that still need implementation (with the description)
3. Features from features.md that need API routes (suggest Supabase Edge Functions)
4. Any platform-specific requirements (iOS only features like HealthKit)
5. Next steps: run `npm install`, set up `.env`, `npx expo start`
