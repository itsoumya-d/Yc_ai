import { Camera, Upload, ScanBarcode, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchScans } from '@/lib/actions/scanner';
import { getScanTypeLabel, formatRelativeTime } from '@/lib/utils';

export default async function ScanPage() {
  const scansResult = await fetchScans();
  const scans = scansResult.success ? scansResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Scan Inventory</h1>
        <p className="text-sm text-text-secondary mt-1">Use your camera or upload photos to count stock</p>
      </div>

      {/* Camera / Upload Area */}
      <Card padding="lg">
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <button className="flex flex-col items-center gap-2 px-8 py-6 rounded-lg border-2 border-dashed border-electric-500/30 bg-electric-600/5 hover:bg-electric-600/10 transition-colors">
              <Camera className="h-8 w-8 text-electric-400" />
              <span className="text-sm font-medium text-electric-400">Camera Scan</span>
              <span className="text-xs text-text-muted">Point at shelves to scan</span>
            </button>
            <button className="flex flex-col items-center gap-2 px-8 py-6 rounded-lg border-2 border-dashed border-border hover:bg-surface-secondary transition-colors">
              <Upload className="h-8 w-8 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Upload Photo</span>
              <span className="text-xs text-text-muted">Upload shelf photos</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Scan Type Selector */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Scan Type</CardTitle>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-3">
          <button className="flex items-center gap-3 p-3 rounded-lg border border-electric-500/30 bg-electric-600/5 text-left">
            <ScanBarcode className="h-5 w-5 text-electric-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Full Count</p>
              <p className="text-xs text-text-muted">Complete inventory count</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-secondary text-left transition-colors">
            <CheckCircle className="h-5 w-5 text-stock-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Spot Check</p>
              <p className="text-xs text-text-muted">Quick verification</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-secondary text-left transition-colors">
            <Package className="h-5 w-5 text-low-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Receiving</p>
              <p className="text-xs text-text-muted">Count incoming delivery</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Recent Scans */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <ScanBarcode className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No scans yet</p>
            <p className="text-xs text-text-muted mt-1">Start a scan above to begin tracking inventory</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    scan.status === 'completed' ? 'bg-stock-600/10 text-stock-500' : 'bg-low-600/10 text-low-500'
                  }`}>
                    {scan.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {getScanTypeLabel(scan.scan_type)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {scan.items_count} items
                      {scan.location?.name && ` at ${scan.location.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={scan.status === 'completed' ? 'green' : 'amber'}>
                    {scan.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                  <span className="text-xs text-text-muted">{formatRelativeTime(scan.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Package(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}
