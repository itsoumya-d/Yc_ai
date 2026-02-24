import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouteStore } from '@/stores/route';
import { useAuthStore } from '@/stores/auth';
import { updateDriverLocation } from '@/services/supabase';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  JOB_STATUS_COLORS,
} from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatLng {
  latitude: number;
  longitude: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.atan2(
      Math.sqrt(sinLat * sinLat + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * sinLon * sinLon),
      Math.sqrt(1 - sinLat * sinLat - Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * sinLon * sinLon)
    );
  return R * c;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color ?? COLORS.primary} />
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Stop Marker ─────────────────────────────────────────────────────────────

function StopMarker({
  stop,
  index,
}: {
  stop: { latitude: number; longitude: number; customerName: string; status: string; orderIndex: number };
  index: number;
}) {
  const color = JOB_STATUS_COLORS[stop.status] ?? COLORS.primary;
  return (
    <Marker
      coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
      title={stop.customerName}
      description={`Stop ${index + 1} · ${stop.status.replace('_', ' ')}`}
    >
      <View style={[styles.markerPin, { backgroundColor: color }]}>
        <Text style={styles.markerText}>{index + 1}</Text>
      </View>
    </Marker>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TrackScreen() {
  const { driverProfile } = useAuthStore();
  const { todayStops } = useRouteStore();

  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [speed, setSpeed] = useState(0); // km/h
  const [distanceKm, setDistanceKm] = useState(0);
  const [lastPosition, setLastPosition] = useState<LatLng | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  const stopsWithCoords = todayStops.filter((s) => s.latitude != null && s.longitude != null) as Array<{
    id: string;
    latitude: number;
    longitude: number;
    customerName: string;
    status: string;
    orderIndex: number;
  }>;

  const routePolyline: LatLng[] = [
    ...(currentLocation ? [currentLocation] : []),
    ...stopsWithCoords
      .filter((s) => s.status !== 'completed')
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
  ];

  const remainingCount = todayStops.filter(
    (s) => s.status !== 'completed' && s.status !== 'cancelled'
  ).length;

  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationPermission('denied');
      Alert.alert(
        'Location Permission Required',
        'RouteAI needs location access to track your route. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    setLocationPermission('granted');
    return true;
  }, []);

  const startTracking = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    // Get initial position
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const pos: LatLng = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
    setCurrentLocation(pos);
    setLastPosition(pos);

    // Center map
    const region: Region = {
      latitude: pos.latitude,
      longitude: pos.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    mapRef.current?.animateToRegion(region, 800);

    // Watch position
    watchSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => {
        const newPos: LatLng = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(newPos);
        setSpeed((loc.coords.speed ?? 0) * 3.6); // m/s to km/h

        setLastPosition((prev) => {
          if (prev) {
            const delta = haversineDistanceKm(prev, newPos);
            setDistanceKm((d) => d + delta);
          }
          return newPos;
        });
      }
    );
  }, [requestLocationPermission]);

  useEffect(() => {
    startTracking();
    return () => {
      watchSubscription.current?.remove();
    };
  }, [startTracking]);

  async function handleUpdateLocation() {
    if (!currentLocation || !driverProfile?.id) return;
    setUpdatingLocation(true);
    try {
      await updateDriverLocation(driverProfile.id, currentLocation.latitude, currentLocation.longitude);
      Alert.alert('Location Updated', 'Your location has been sent to the dispatcher.');
    } catch {
      Alert.alert('Error', 'Could not update location. Please try again.');
    } finally {
      setUpdatingLocation(false);
    }
  }

  function centerOnCurrentLocation() {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      500
    );
  }

  const defaultRegion: Region = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {locationPermission === 'denied' ? (
          <View style={styles.permissionDenied}>
            <Ionicons name="location-off-outline" size={48} color={COLORS.border} />
            <Text style={styles.permissionTitle}>Location Access Denied</Text>
            <Text style={styles.permissionSub}>Enable location in Settings to use tracking.</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={currentLocation ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : defaultRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass
            showsScale
          >
            {/* Current location marker */}
            {currentLocation && (
              <Marker coordinate={currentLocation} title="You are here" anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.currentLocationPin}>
                  <View style={styles.currentLocationDot} />
                </View>
              </Marker>
            )}

            {/* Job stop markers */}
            {stopsWithCoords
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((stop, i) => (
                <StopMarker key={stop.id} stop={stop} index={i} />
              ))}

            {/* Route polyline */}
            {routePolyline.length > 1 && (
              <Polyline
                coordinates={routePolyline}
                strokeColor={COLORS.primary}
                strokeWidth={3}
                lineDashPattern={[8, 4]}
              />
            )}
          </MapView>
        )}

        {/* Center button */}
        {currentLocation && (
          <TouchableOpacity style={styles.centerBtn} onPress={centerOnCurrentLocation}>
            <Ionicons name="locate" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Loading overlay */}
        {!currentLocation && locationPermission !== 'denied' && (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.mapLoaderText}>Acquiring GPS signal…</Text>
          </View>
        )}
      </View>

      {/* Stats overlay */}
      <View style={styles.statsRow}>
        <StatCard
          icon="speedometer-outline"
          label="Speed"
          value={`${speed.toFixed(0)} km/h`}
          color={speed > 80 ? COLORS.warning : COLORS.primary}
        />
        <View style={styles.statDivider} />
        <StatCard
          icon="navigate-outline"
          label="Distance"
          value={`${distanceKm.toFixed(1)} km`}
        />
        <View style={styles.statDivider} />
        <StatCard
          icon="briefcase-outline"
          label="Remaining"
          value={String(remainingCount)}
          color={remainingCount === 0 ? COLORS.success : COLORS.primary}
        />
      </View>

      {/* Update Location Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.updateBtn, (!currentLocation || updatingLocation) && styles.btnDisabled]}
          onPress={handleUpdateLocation}
          disabled={!currentLocation || updatingLocation}
        >
          {updatingLocation ? (
            <ActivityIndicator color={COLORS.surface} size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.surface} />
              <Text style={styles.updateBtnText}>Update Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: COLORS.surface, fontSize: FONT_SIZE.xl, fontWeight: '700' },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  liveText: { color: COLORS.surface, fontSize: FONT_SIZE.xs, fontWeight: '800' },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: { flex: 1 },
  permissionDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  permissionSub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  centerBtn: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  mapLoader: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,249,255,0.9)',
    gap: SPACING.md,
  },
  mapLoaderText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },

  currentLocationPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(3,105,161,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  markerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  markerText: { color: COLORS.surface, fontSize: 11, fontWeight: '800' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  updateBtnText: { color: COLORS.surface, fontSize: FONT_SIZE.md, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
});
