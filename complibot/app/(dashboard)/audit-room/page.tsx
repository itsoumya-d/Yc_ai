import { Lock, Plus, Share2 } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuditRoomPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Audit Room</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Securely share evidence and collaborate with auditors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="h-4 w-4" />
            Create Audit Room
          </Button>
          <Button variant="secondary">
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card className="py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust-50">
            <Lock className="h-8 w-8 text-trust-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No Audit Rooms</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Create an audit room to share evidence with your auditor. Each room provides a
            secure, read-only view of selected evidence and controls for your audit team.
          </p>
        </div>
      </Card>
    </div>
  );
}
