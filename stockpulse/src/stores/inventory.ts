import { create } from 'zustand';
import type { ProductIdentification } from '@/services/ai';

// ─── Domain types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  locationId: string;
  orgId: string;
  name: string;
  sku: string;
  category: string;
  categoryColor?: string;
  brand?: string;
  unit: string;
  description?: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  costPerUnit?: number;
  imageUrl?: string;
  lastScanned?: string;
  barcode?: string;
}

export interface ScanSession {
  id: string;
  productId?: string;
  productName?: string;
  identification?: ProductIdentification;
  quantity: number;
  action: 'add' | 'remove' | 'count';
  notes?: string;
  scannedAt: string;
}

export interface StockAlert {
  id: string;
  inventoryId: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unit: string;
  alertType: string;
  severity: 'critical' | 'low';
  acknowledged: boolean;
  supplierName?: string;
  createdAt: string;
}

export interface Location {
  id: string;
  orgId: string;
  name: string;
  address?: string;
  timezone?: string;
}

export interface Organization {
  id: string;
  name: string;
  businessType?: string;
}

// ─── Store shape ─────────────────────────────────────────────────────────────

interface InventoryStore {
  // Data
  products: Product[];
  lowStockProducts: Product[];
  criticalProducts: Product[];
  scanHistory: ScanSession[];
  alerts: StockAlert[];

  // Context
  locationId: string | null;
  location: Location | null;
  organization: Organization | null;

  // Loading states
  isLoadingProducts: boolean;
  isLoadingAlerts: boolean;

  // Product actions
  setProducts: (products: Product[]) => void;
  updateStock: (productId: string, newStock: number) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;

  // Scan actions
  addScan: (scan: ScanSession) => void;
  clearScanHistory: () => void;

  // Alert actions
  setAlerts: (alerts: StockAlert[]) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAllAlerts: () => void;

  // Context actions
  setLocationId: (id: string) => void;
  setLocation: (location: Location) => void;
  setOrganization: (org: Organization) => void;

  // Loading actions
  setLoadingProducts: (loading: boolean) => void;
  setLoadingAlerts: (loading: boolean) => void;
}

// ─── Derived helpers ─────────────────────────────────────────────────────────

function computeLowStock(products: Product[]): Product[] {
  return products.filter((p) => p.currentStock <= p.reorderPoint);
}

function computeCritical(products: Product[]): Product[] {
  return products.filter(
    (p) => p.currentStock <= 0 || p.currentStock <= p.reorderPoint * 0.25
  );
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryStore>((set) => ({
  products: [],
  lowStockProducts: [],
  criticalProducts: [],
  scanHistory: [],
  alerts: [],
  locationId: null,
  location: null,
  organization: null,
  isLoadingProducts: false,
  isLoadingAlerts: false,

  setProducts: (products) =>
    set({
      products,
      lowStockProducts: computeLowStock(products),
      criticalProducts: computeCritical(products),
    }),

  updateStock: (productId, newStock) =>
    set((s) => {
      const updated = s.products.map((p) =>
        p.id === productId ? { ...p, currentStock: newStock } : p
      );
      return {
        products: updated,
        lowStockProducts: computeLowStock(updated),
        criticalProducts: computeCritical(updated),
      };
    }),

  addProduct: (product) =>
    set((s) => {
      const updated = [product, ...s.products];
      return {
        products: updated,
        lowStockProducts: computeLowStock(updated),
        criticalProducts: computeCritical(updated),
      };
    }),

  removeProduct: (productId) =>
    set((s) => {
      const updated = s.products.filter((p) => p.id !== productId);
      return {
        products: updated,
        lowStockProducts: computeLowStock(updated),
        criticalProducts: computeCritical(updated),
      };
    }),

  addScan: (scan) =>
    set((s) => ({
      scanHistory: [scan, ...s.scanHistory].slice(0, 100),
    })),

  clearScanHistory: () => set({ scanHistory: [] }),

  setAlerts: (alerts) => set({ alerts }),

  acknowledgeAlert: (alertId) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),

  dismissAllAlerts: () =>
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, acknowledged: true })),
    })),

  setLocationId: (id) => set({ locationId: id }),
  setLocation: (location) => set({ location, locationId: location.id }),
  setOrganization: (organization) => set({ organization }),

  setLoadingProducts: (isLoadingProducts) => set({ isLoadingProducts }),
  setLoadingAlerts: (isLoadingAlerts) => set({ isLoadingAlerts }),
}));

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectProductByBarcode = (barcode: string) => (state: InventoryStore) =>
  state.products.find((p) => p.barcode === barcode);

export const selectProductBySku = (sku: string) => (state: InventoryStore) =>
  state.products.find((p) => p.sku === sku);

export const selectAlertsByProduct = (productId: string) => (state: InventoryStore) =>
  state.alerts.filter((a) => a.productId === productId && !a.acknowledged);

export const selectUnacknowledgedAlerts = (state: InventoryStore) =>
  state.alerts.filter((a) => !a.acknowledged);

export const selectCriticalAlerts = (state: InventoryStore) =>
  state.alerts.filter((a) => a.severity === 'critical' && !a.acknowledged);
