'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ControlList } from '@/components/controls/control-list';
import { getFrameworks } from '@/lib/actions/frameworks';
import { getControlsByCategory } from '@/lib/actions/controls';
import { Loader2, CheckSquare } from 'lucide-react';
import type { Framework, Control } from '@/types/database';
import { FRAMEWORK_LABELS } from '@/types/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ControlsPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFw, setSelectedFw] = useState<string>('');
  const [controlsByCategory, setControlsByCategory] = useState<Record<string, Control[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async (frameworkId?: string) => {
    setLoading(true);
    const fwRes = await getFrameworks();
    const fws = (fwRes.data ?? []).filter((f) => f.enabled);
    setFrameworks(fws);

    const targetId = frameworkId ?? selectedFw ?? fws[0]?.id;
    if (targetId) {
      setSelectedFw(targetId);
      const res = await getControlsByCategory(targetId);
      setControlsByCategory(res.data ?? {});
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleFwChange = async (fwId: string) => {
    setSelectedFw(fwId);
    setLoading(true);
    const res = await getControlsByCategory(fwId);
    setControlsByCategory(res.data ?? {});
    setLoading(false);
  };

  const totalControls = Object.values(controlsByCategory).flat().length;
  const implementedControls = Object.values(controlsByCategory).flat().filter((c) => c.status === 'implemented').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controls Checklist"
        description="Track and manage compliance control implementation status."
      />

      {frameworks.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No frameworks enabled yet.</p>
          <Link href="/frameworks">
            <Button className="mt-3">Enable a Framework</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Framework selector + stats */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {frameworks.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => handleFwChange(fw.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFw === fw.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {FRAMEWORK_LABELS[fw.type]}
                </button>
              ))}
            </div>
            {totalControls > 0 && (
              <div className="text-sm text-slate-500">
                <span className="text-green-600 font-semibold">{implementedControls}</span> of{' '}
                <span className="font-semibold">{totalControls}</span> implemented
                {' '}({Math.round((implementedControls / totalControls) * 100)}%)
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <ControlList
              controlsByCategory={controlsByCategory}
              onUpdate={() => handleFwChange(selectedFw)}
            />
          )}
        </>
      )}
    </div>
  );
}
