import { FolderOpen, FileImage, FileText, Terminal, Settings, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEvidenceItems } from '@/lib/actions/evidence';
import { getControls } from '@/lib/actions/controls';
import type { EvidenceItem } from '@/types/database';

const EVIDENCE_TYPE_CONFIG: Record<EvidenceItem['evidence_type'], { label: string; icon: React.ElementType; color: string }> = {
  screenshot: { label: 'Screenshot', icon: FileImage, color: 'text-purple-500' },
  document: { label: 'Document', icon: FileText, color: 'text-blue-500' },
  log: { label: 'Log', icon: Terminal, color: 'text-green-500' },
  config: { label: 'Config', icon: Settings, color: 'text-orange-500' },
  attestation: { label: 'Attestation', icon: ClipboardCheck, color: 'text-teal-500' },
};

export default async function EvidencePage() {
  const [evidenceItems, controls] = await Promise.all([
    getEvidenceItems(),
    getControls(),
  ]);

  // Group evidence by control_id
  const controlMap = new Map(controls.map(c => [c.id, c]));
  const groupedEvidence = new Map<string, EvidenceItem[]>();

  for (const item of evidenceItems) {
    const existing = groupedEvidence.get(item.control_id) ?? [];
    groupedEvidence.set(item.control_id, [...existing, item]);
  }

  // Controls with evidence
  const controlsWithEvidence = Array.from(groupedEvidence.keys())
    .map(cid => ({
      control: controlMap.get(cid),
      items: groupedEvidence.get(cid) ?? [],
    }))
    .filter(g => g.control !== undefined);

  // Evidence without a matching control
  const orphanItems = evidenceItems.filter(item => !controlMap.has(item.control_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evidence</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compliance evidence items grouped by control.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{evidenceItems.length} total evidence items</span>
        <span>·</span>
        <span>{controls.filter(c => c.evidence_count > 0).length} controls with evidence</span>
      </div>

      {evidenceItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No evidence collected yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Evidence items linked to controls will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {controlsWithEvidence.map(({ control, items }) => {
            if (!control) return null;
            return (
              <div key={control.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {control.control_code}
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">{control.title}</h2>
                  <Badge variant={control.status === 'compliant' ? 'compliant' : control.status === 'partial' ? 'partial' : 'non_compliant'}>
                    {control.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(item => {
                    const config = EVIDENCE_TYPE_CONFIG[item.evidence_type];
                    const Icon = config.icon;
                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                                <Badge variant="default">{config.label}</Badge>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                {new Date(item.collected_at).toLocaleDateString()}
                              </p>
                              {item.file_url && (
                                <a
                                  href={item.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 text-xs text-blue-600 hover:underline inline-block"
                                >
                                  View file
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {orphanItems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3">Uncategorized</h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {orphanItems.map(item => {
                  const config = EVIDENCE_TYPE_CONFIG[item.evidence_type];
                  const Icon = config.icon;
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">{new Date(item.collected_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
