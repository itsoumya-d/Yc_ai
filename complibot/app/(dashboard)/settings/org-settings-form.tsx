'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createOrg, updateOrg } from '@/lib/actions/orgs';
import { useRouter } from 'next/navigation';
import type { Org } from '@/types/database';

interface OrgSettingsFormProps {
  org: Org | null;
  industryOptions: string[];
}

export function OrgSettingsForm({ org, industryOptions }: OrgSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (org) {
        const { error } = await updateOrg(org.id, {
          name: formData.get('name') as string,
          industry: formData.get('industry') as string,
          target_audit_date: (formData.get('target_audit_date') as string) || null,
        });
        if (error) { setError(error); return; }
      } else {
        const { error } = await createOrg(formData);
        if (error) { setError(error); return; }
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {org ? 'Organization updated successfully.' : 'Organization created successfully.'}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={org?.name ?? ''}
          placeholder="Acme Corp"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry <span className="text-red-500">*</span>
        </label>
        <select
          name="industry"
          required
          defaultValue={org?.industry ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="" disabled>Select your industry</option>
          {industryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Audit Date
        </label>
        <input
          name="target_audit_date"
          type="date"
          defaultValue={org?.target_audit_date ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          When is your next compliance audit or certification date?
        </p>
      </div>

      {org && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Slug</label>
          <input
            value={org.slug}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving...' : org ? 'Save Changes' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
}
