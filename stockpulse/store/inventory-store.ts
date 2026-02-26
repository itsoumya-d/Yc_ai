import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  price: number;
  location: string;
  barcode?: string;
  lastUpdated: string;
}

export interface ActivityEvent {
  id: string;
  productId: string;
  productName: string;
  type: 'add' | 'remove' | 'adjust';
  quantity: number;
  timestamp: string;
  location: string;
  user: string;
}

interface InventoryState {
  products: Product[];
  recentActivity: ActivityEvent[];
  selectedCategory: string | null;
  searchQuery: string;
  isPhysicalCountActive: boolean;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  adjustQuantity: (productId: string, delta: number) => void;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  startPhysicalCount: () => void;
  stopPhysicalCount: () => void;
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Heavy Duty Cardboard Boxes 24in', sku: 'PKG-BOX-24', category: 'Packaging', quantity: 8, minThreshold: 25, price: 2.49, location: 'Aisle A-3', barcode: '012345678901', lastUpdated: '2026-02-22' },
  { id: '2', name: 'Stretch Wrap Film Roll', sku: 'PKG-WRAP-01', category: 'Packaging', quantity: 0, minThreshold: 10, price: 18.99, location: 'Aisle A-1', barcode: '012345678902', lastUpdated: '2026-02-21' },
  { id: '3', name: 'Packing Tape 2in x 110yd', sku: 'PKG-TAPE-2', category: 'Packaging', quantity: 45, minThreshold: 20, price: 3.75, location: 'Aisle A-2', barcode: '012345678903', lastUpdated: '2026-02-23' },
  { id: '4', name: 'Industrial Gloves Large', sku: 'SAF-GLV-L', category: 'Safety', quantity: 3, minThreshold: 15, price: 12.50, location: 'Aisle B-1', barcode: '012345678904', lastUpdated: '2026-02-20' },
  { id: '5', name: 'Safety Vest Hi-Vis Orange', sku: 'SAF-VEST-O', category: 'Safety', quantity: 0, minThreshold: 5, price: 24.99, location: 'Aisle B-2', barcode: '012345678905', lastUpdated: '2026-02-19' },
  { id: '6', name: 'Label Printer Rolls 4x6', sku: 'LBL-ROLL-46', category: 'Labels', quantity: 200, minThreshold: 50, price: 0.08, location: 'Aisle C-1', barcode: '012345678906', lastUpdated: '2026-02-23' },
  { id: '7', name: 'Forklift Battery 48V', sku: 'EQP-BATT-48', category: 'Equipment', quantity: 2, minThreshold: 3, price: 1250.00, location: 'Charging Bay', barcode: '012345678907', lastUpdated: '2026-02-18' },
  { id: '8', name: 'Bubble Wrap Roll 12in', sku: 'PKG-BWRAP-12', category: 'Packaging', quantity: 150, minThreshold: 30, price: 0.95, location: 'Aisle A-4', barcode: '012345678908', lastUpdated: '2026-02-22' },
];

const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: 'a1', productId: '1', productName: 'Heavy Duty Cardboard Boxes 24in', type: 'remove', quantity: 17, timestamp: '3 hr ago', location: 'Aisle A-3', user: 'Marcus T.' },
  { id: 'a2', productId: '6', productName: 'Label Printer Rolls 4x6', type: 'remove', quantity: 50, timestamp: '18 min ago', location: 'Aisle C-1', user: 'Sandra K.' },
  { id: 'a3', productId: '4', productName: 'Industrial Gloves Large', type: 'remove', quantity: 12, timestamp: '1 hr ago', location: 'Aisle B-1', user: 'Dev R.' },
  { id: 'a4', productId: '3', productName: 'Packing Tape 2in x 110yd', type: 'add', quantity: 24, timestamp: '2 min ago', location: 'Aisle A-2', user: 'Marcus T.' },
  { id: 'a5', productId: '8', productName: 'Bubble Wrap Roll 12in', type: 'add', quantity: 100, timestamp: '5 hr ago', location: 'Aisle A-4', user: 'Sandra K.' },
];

export const useInventoryStore = create<InventoryState>((set) => ({
  products: DEMO_PRODUCTS,
  recentActivity: DEMO_ACTIVITY,
  selectedCategory: null,
  searchQuery: '',
  isPhysicalCountActive: false,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  adjustQuantity: (productId, delta) =>
    set((state) => {
      const prod = state.products.find((p) => p.id === productId);
      const newActivity: ActivityEvent = {
        id: Date.now().toString(),
        productId,
        productName: prod?.name ?? '',
        type: delta > 0 ? 'add' : 'remove',
        quantity: Math.abs(delta),
        timestamp: 'just now',
        location: prod?.location ?? '',
        user: 'You',
      };
      return {
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, quantity: Math.max(0, p.quantity + delta), lastUpdated: new Date().toISOString().split('T')[0] }
            : p
        ),
        recentActivity: [newActivity, ...state.recentActivity],
      };
    }),
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, { ...product, id: Date.now().toString(), lastUpdated: new Date().toISOString().split('T')[0] }],
    })),
  startPhysicalCount: () => set({ isPhysicalCountActive: true }),
  stopPhysicalCount: () => set({ isPhysicalCountActive: false }),
}));
