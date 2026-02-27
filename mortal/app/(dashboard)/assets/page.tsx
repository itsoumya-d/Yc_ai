import { Globe, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAssets } from '@/lib/actions/assets';
import { getAssetCategoryLabel, formatCurrency } from '@/lib/utils';

export default async function AssetsPage() {
  const result = await fetchAssets();
  const assets = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Digital Assets</h1>
          <p className="text-sm text-text-secondary mt-1">Inventory your online accounts and digital property</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-text-primary mb-1">No digital assets</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Add your email accounts, social media, financial services, and other online accounts to ensure they are properly handled.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} hover padding="lg">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="blue">{getAssetCategoryLabel(asset.category)}</Badge>
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-1">{asset.service_name}</h3>
              {asset.username && (
                <p className="text-sm text-text-secondary">{asset.username}</p>
              )}
              {asset.action_on_death && (
                <p className="text-xs text-text-muted mt-2">Action: {asset.action_on_death}</p>
              )}
              {asset.estimated_value_cents != null && asset.estimated_value_cents > 0 && (
                <p className="text-xs text-sage-600 mt-1">Value: {formatCurrency(asset.estimated_value_cents)}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
