import { Camera, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchPhotos } from '@/lib/actions/photos';
import { formatRelativeTime } from '@/lib/utils';

export default async function PhotosPage() {
  const photosResult = await fetchPhotos();
  const photos = photosResult.success ? photosResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Photos</h1>
        <p className="text-sm text-text-secondary mt-1">Your session photos and AI analysis results</p>
      </div>

      {photos.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <Camera className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No photos yet</p>
            <p className="text-xs text-text-muted mt-1">Take photos during coaching sessions to get AI analysis</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-video bg-surface-tertiary flex items-center justify-center">
                <Camera className="h-8 w-8 text-text-muted" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  {photo.caption ? (
                    <p className="text-sm font-medium text-text-primary truncate">{photo.caption}</p>
                  ) : (
                    <p className="text-sm text-text-muted italic">No caption</p>
                  )}
                  {photo.analysis_id && (
                    <Badge variant="green">Analyzed</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-muted">{formatRelativeTime(photo.created_at)}</p>
                  <button className="text-error-500 hover:text-error-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
