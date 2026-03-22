import { Shield, AlertTriangle, User, Building2 } from 'lucide-react';

interface EntityCardProps {
  name: string;
  type: 'person' | 'organization' | 'government';
  riskScore?: number;
  claimsCount?: number;
  connectionCount?: number;
  onClick?: () => void;
}

const riskColor = (score: number) => {
  if (score >= 70) return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
  if (score >= 40) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' };
  return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' };
};

const typeIcon = { person: User, organization: Building2, government: Shield };

export function EntityCard({ name, type, riskScore = 0, claimsCount = 0, connectionCount = 0, onClick }: EntityCardProps) {
  const { bg, text, badge } = riskColor(riskScore);
  const Icon = typeIcon[type];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${badge}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{name}</p>
            <p className="text-xs text-[var(--muted-foreground)] capitalize">{type}</p>
          </div>
        </div>
        {riskScore > 0 && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${badge}`}>
            {riskScore >= 70 && <AlertTriangle className="h-3 w-3" />}
            {riskScore}% risk
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <span>{claimsCount} claims</span>
        <span>{connectionCount} connections</span>
      </div>
    </button>
  );
}
