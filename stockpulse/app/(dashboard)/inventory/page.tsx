import { Package, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, fetchCategories } from '@/lib/actions/inventory';
import { formatCurrency } from '@/lib/utils';

export default async function InventoryPage() {
  const [productsResult, categoriesResult] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Inventory</h1>
          <p className="text-sm text-text-secondary mt-1">{products.length} products tracked</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">All</Badge>
          {categories.map((cat) => (
            <Badge key={cat.id} variant="outline">
              {cat.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-medium text-text-primary mb-1">No products yet</h3>
            <p className="text-sm text-text-secondary mb-4">
              Add your first product to start tracking inventory.
            </p>
            <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} hover>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate">{product.name}</h3>
                  {product.sku && (
                    <p className="text-xs text-text-muted font-mono mt-0.5">SKU: {product.sku}</p>
                  )}
                </div>
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  {product.price_cents != null && (
                    <p className="text-sm font-medium text-text-primary font-mono">
                      {formatCurrency(product.price_cents)}
                    </p>
                  )}
                  <p className="text-xs text-text-muted">
                    Reorder at {product.reorder_point} {product.unit}s
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
