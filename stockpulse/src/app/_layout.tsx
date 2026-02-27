import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/services/supabase';

// Mock seed data for development / demo purposes
import { useInventoryStore } from '@/stores/inventory';
import type { Product, StockAlert } from '@/stores/inventory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 2,
    },
  },
});

// ─── Seed demo data ──────────────────────────────────────────────────────────

const DEMO_LOCATION_ID = 'loc-001';
const DEMO_ORG_ID = 'org-001';

const demoProducts: Product[] = [
  {
    id: 'p1', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Organic Whole Milk', sku: 'DAI001', category: 'Dairy',
    brand: 'Green Valley', unit: 'gallon', currentStock: 8, reorderPoint: 12,
    maxStock: 48, costPerUnit: 4.99, barcode: '012345678901',
    lastScanned: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'p2', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Roma Tomatoes', sku: 'PRO001', category: 'Produce',
    brand: undefined, unit: 'lbs', currentStock: 3, reorderPoint: 10,
    maxStock: 40, costPerUnit: 1.49, barcode: '023456789012',
    lastScanned: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'p3', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'All-Purpose Flour', sku: 'DRY001', category: 'Dry Goods',
    brand: 'King Arthur', unit: 'lbs', currentStock: 25, reorderPoint: 20,
    maxStock: 80, costPerUnit: 3.29, barcode: '034567890123',
    lastScanned: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'p4', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Sparkling Water 12-Pack', sku: 'BEV001', category: 'Beverages',
    brand: 'LaCroix', unit: 'case', currentStock: 0, reorderPoint: 5,
    maxStock: 20, costPerUnit: 8.99, barcode: '045678901234',
    lastScanned: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'p5', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Dish Soap', sku: 'CLN001', category: 'Cleaning',
    brand: 'Dawn', unit: 'bottle', currentStock: 6, reorderPoint: 4,
    maxStock: 24, costPerUnit: 2.79, barcode: '056789012345',
    lastScanned: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'p6', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Chicken Breast', sku: 'MEA001', category: 'Meat',
    brand: undefined, unit: 'lbs', currentStock: 15, reorderPoint: 20,
    maxStock: 60, costPerUnit: 5.99, barcode: '067890123456',
    lastScanned: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'p7', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Extra Virgin Olive Oil', sku: 'DRY002', category: 'Dry Goods',
    brand: 'California Olive Ranch', unit: 'bottle', currentStock: 4,
    reorderPoint: 6, maxStock: 24, costPerUnit: 9.99,
    lastScanned: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'p8', locationId: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID,
    name: 'Cheddar Cheese Block', sku: 'DAI002', category: 'Dairy',
    brand: 'Tillamook', unit: 'lbs', currentStock: 12, reorderPoint: 8,
    maxStock: 32, costPerUnit: 6.49,
    lastScanned: new Date(Date.now() - 518400000).toISOString(),
  },
];

const demoAlerts: StockAlert[] = [
  {
    id: 'a1', inventoryId: 'inv-p4', productId: 'p4',
    productName: 'Sparkling Water 12-Pack', sku: 'BEV001',
    currentStock: 0, reorderPoint: 5, maxStock: 20, unit: 'case',
    alertType: 'out_of_stock', severity: 'critical', acknowledged: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a2', inventoryId: 'inv-p2', productId: 'p2',
    productName: 'Roma Tomatoes', sku: 'PRO001',
    currentStock: 3, reorderPoint: 10, maxStock: 40, unit: 'lbs',
    alertType: 'low_stock', severity: 'critical', acknowledged: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a3', inventoryId: 'inv-p1', productId: 'p1',
    productName: 'Organic Whole Milk', sku: 'DAI001',
    currentStock: 8, reorderPoint: 12, maxStock: 48, unit: 'gallon',
    alertType: 'low_stock', severity: 'low', acknowledged: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'a4', inventoryId: 'inv-p6', productId: 'p6',
    productName: 'Chicken Breast', sku: 'MEA001',
    currentStock: 15, reorderPoint: 20, maxStock: 60, unit: 'lbs',
    alertType: 'low_stock', severity: 'low', acknowledged: false,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'a5', inventoryId: 'inv-p7', productId: 'p7',
    productName: 'Extra Virgin Olive Oil', sku: 'DRY002',
    currentStock: 4, reorderPoint: 6, maxStock: 24, unit: 'bottle',
    alertType: 'low_stock', severity: 'low', acknowledged: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

function DemoDataLoader() {
  const { setProducts, setAlerts, setLocation, setOrganization } = useInventoryStore();

  useEffect(() => {
    setOrganization({ id: DEMO_ORG_ID, name: 'Downtown Bistro', businessType: 'restaurant' });
    setLocation({ id: DEMO_LOCATION_ID, orgId: DEMO_ORG_ID, name: 'Main Kitchen', address: '123 Market St' });
    setProducts(demoProducts);
    setAlerts(demoAlerts);
  }, [setProducts, setAlerts, setLocation, setOrganization]);

  return null;
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const inAuthGroup = segments[0] === '(auth)';
      if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    });
    return () => subscription.unsubscribe();
  }, [segments]);

  return null;
}

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DemoDataLoader />
          <StatusBar style="light" />
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modals/purchase-order"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="modals/add-product"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
