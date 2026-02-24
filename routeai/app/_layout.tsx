import 'react-native-url-polyfill/auto';
import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import type { RouteNotification } from '@/stores/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 2,
    },
  },
});

function AuthListener() {
  const { setUser, setDriverProfile } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Restore session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch driver profile
        const { data: profile } = await supabase
          .from('drivers')
          .select('*, organizations(id, name, industry, timezone)')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setDriverProfile({
            id: profile.id,
            userId: profile.user_id,
            orgId: profile.org_id,
            name: profile.name,
            phone: profile.phone,
            status: profile.status,
            currentLat: profile.current_lat,
            currentLng: profile.current_lng,
            organization: profile.organizations,
          });

          // Fetch initial notifications
          const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('driver_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (notifs) {
            const mapped: RouteNotification[] = notifs.map((n) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              body: n.body,
              data: n.data,
              read: n.read,
              createdAt: n.created_at,
            }));
            setNotifications(mapped);
          }

          // Subscribe to real-time notifications for this driver
          if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
          }

          const channel = supabase
            .channel(`notifications:${profile.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `driver_id=eq.${profile.id}`,
              },
              (payload) => {
                const n = payload.new as {
                  id: string;
                  type: RouteNotification['type'];
                  title: string;
                  body: string;
                  data?: Record<string, unknown>;
                  read: boolean;
                  created_at: string;
                };
                addNotification({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  body: n.body,
                  data: n.data,
                  read: n.read,
                  createdAt: n.created_at,
                });
              }
            )
            .subscribe();

          realtimeChannelRef.current = channel;
        }
      } else {
        setDriverProfile(null);
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [setUser, setDriverProfile, setNotifications, addNotification]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthListener />
        <StatusBar style="light" backgroundColor="#0369A1" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
