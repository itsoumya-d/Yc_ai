import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrg } from '@/lib/actions/orgs';
import { OrgSettingsForm } from './org-settings-form';

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Insurance',
  'Legal',
  'Education',
  'Retail & E-commerce',
  'Manufacturing',
  'Government',
  'Non-profit',
  'Other',
];

export default async function SettingsPage() {
  const org = await getOrg();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          <Settings className="w-4.5 h-4.5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your organization configuration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <OrgSettingsForm org={org} industryOptions={INDUSTRY_OPTIONS} />
        </CardContent>
      </Card>
    </div>
  );
}
