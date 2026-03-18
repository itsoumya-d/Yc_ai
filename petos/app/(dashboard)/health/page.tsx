import { getPets } from '@/lib/actions/pets';
import { getHealthRecords } from '@/lib/actions/health-records';
import { PageHeader } from '@/components/layout/page-header';
import { HealthTimeline } from '@/components/health/health-timeline';
import { HealthRecordForm } from '@/components/health/health-record-form';
import { ImportHealthButton } from '@/components/health/import-health-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Health Records',
};

export default async function HealthPage() {
  const [petsResult, recordsResult] = await Promise.all([
    getPets(),
    getHealthRecords(),
  ]);

  const pets = petsResult.data || [];
  const records = recordsResult.data || [];

  return (
    <div>
      <PageHeader
        title="Health Records"
        description="Track vaccinations, vet visits, and medical history."
        action={
          <div className="flex items-center gap-2">
            <ImportHealthButton />
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Health Record</DialogTitle>
                </DialogHeader>
                <HealthRecordForm pets={pets} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="mt-6">
        <HealthTimeline records={records} />
      </div>
    </div>
  );
}
