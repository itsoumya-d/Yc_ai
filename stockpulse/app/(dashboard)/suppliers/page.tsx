import { Truck, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchSuppliers } from '@/lib/actions/suppliers';

export default async function SuppliersPage() {
  const suppliersResult = await fetchSuppliers();
  const suppliers = suppliersResult.success ? suppliersResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Suppliers</h1>
          <p className="text-sm text-text-secondary mt-1">{suppliers.length} active suppliers</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Truck className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-medium text-text-primary mb-1">No suppliers yet</h3>
            <p className="text-sm text-text-secondary mb-4">
              Add your suppliers to start creating purchase orders.
            </p>
            <button className="inline-flex items-center gap-2 bg-electric-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-electric-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} hover>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{supplier.name}</h3>
                {supplier.contact_name && (
                  <p className="text-xs text-text-secondary mt-0.5">{supplier.contact_name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
