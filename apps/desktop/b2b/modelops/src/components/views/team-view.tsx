import { cn, formatCost, getInitials } from '@/lib/utils';
import {
  Users,
  Plus,
  Crown,
  Shield,
  UserCheck,
  Eye,
  Clock,
  Activity,
  Rocket,
  FlaskConical,
  Package,
  MessageSquare,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  lastActive: string;
  experiments: number;
  cost: number;
  avatarColor: string;
}

interface ActivityItem {
  id: string;
  time: string;
  user: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const teamMembers: TeamMember[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice@company.com', role: 'owner', lastActive: 'Now', experiments: 45, cost: 890, avatarColor: '#3B82F6' },
  { id: 'u2', name: 'Bob Kumar', email: 'bob@company.com', role: 'admin', lastActive: '2h ago', experiments: 32, cost: 650, avatarColor: '#8B5CF6' },
  { id: 'u3', name: 'Carol Smith', email: 'carol@company.com', role: 'member', lastActive: '1d ago', experiments: 28, cost: 420, avatarColor: '#10B981' },
  { id: 'u4', name: 'David Lee', email: 'david@company.com', role: 'member', lastActive: '3h ago', experiments: 21, cost: 380, avatarColor: '#F59E0B' },
  { id: 'u5', name: 'Eve Johnson', email: 'eve@company.com', role: 'member', lastActive: 'Now', experiments: 18, cost: 310, avatarColor: '#EF4444' },
  { id: 'u6', name: 'Frank Wilson', email: 'frank@company.com', role: 'member', lastActive: '5h ago', experiments: 15, cost: 280, avatarColor: '#EC4899' },
  { id: 'u7', name: 'Grace Park', email: 'grace@company.com', role: 'viewer', lastActive: '1w ago', experiments: 0, cost: 0, avatarColor: '#6B7280' },
  { id: 'u8', name: 'Hiro Tanaka', email: 'hiro@company.com', role: 'member', lastActive: '4h ago', experiments: 12, cost: 200, avatarColor: '#14B8A6' },
];

const activityFeed: ActivityItem[] = [
  { id: 'a1', time: '14:23', user: 'Alice', action: 'deployed sentiment-bert v2.3.0 to production', icon: Rocket, color: 'text-success' },
  { id: 'a2', time: '14:15', user: 'Eve', action: 'started training experiment exp-42 on A100', icon: Activity, color: 'text-info' },
  { id: 'a3', time: '13:50', user: 'Bob', action: 'registered model image-resnet v1.1.0', icon: Package, color: 'text-chart-2' },
  { id: 'a4', time: '13:30', user: 'David', action: 'commented on exp-38: "Data leak in val set"', icon: MessageSquare, color: 'text-warning' },
  { id: 'a5', time: '12:45', user: 'Carol', action: 'completed hyperparameter sweep (24 trials)', icon: FlaskConical, color: 'text-chart-4' },
  { id: 'a6', time: '11:20', user: 'Hiro', action: 'uploaded dataset train_v3 (50K rows)', icon: Activity, color: 'text-node-data' },
  { id: 'a7', time: '10:05', user: 'Frank', action: 'started training experiment exp-41 on A10G', icon: Activity, color: 'text-info' },
  { id: 'a8', time: '09:30', user: 'Alice', action: 'created pipeline text-classification-v2', icon: Activity, color: 'text-primary' },
];

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: Shield,
  member: UserCheck,
  viewer: Eye,
};

const roleBadgeColors: Record<string, string> = {
  owner: 'bg-warning/10 text-warning border-warning/30',
  admin: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  member: 'bg-info/10 text-info border-info/30',
  viewer: 'bg-bg-surface-hover text-text-tertiary border-border-default',
};

export function TeamView() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Team Dashboard</h2>
          <span className="rounded-full bg-bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
            {teamMembers.length} members
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-3 w-3" />
          Invite Member
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Members Table */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
            <Users className="h-3 w-3 text-text-tertiary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Members ({teamMembers.length})</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Member</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Role</th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Last Active</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Experiments</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">GPU Cost</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => {
                const RoleIcon = roleIcons[member.role] ?? UserCheck;
                return (
                  <tr key={member.id} className="border-b border-border-subtle transition-colors hover:bg-bg-surface-hover">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium text-white"
                          style={{ backgroundColor: member.avatarColor }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-text-primary">{member.name}</div>
                          <div className="text-[10px] text-text-tertiary">{member.email}</div>
                        </div>
                        {member.lastActive === 'Now' && (
                          <div className="h-2 w-2 rounded-full bg-success" title="Online" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] capitalize', roleBadgeColors[member.role])}>
                        <RoleIcon className="h-2.5 w-2.5" />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock className="h-3 w-3 text-text-tertiary" />
                        {member.lastActive}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-text-primary">{member.experiments}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-text-primary">{formatCost(member.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Activity Feed */}
        <div className="rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-2">
            <Activity className="h-3 w-3 text-text-tertiary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Recent Activity</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {activityFeed.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-bg-surface-hover">
                  <span className="mt-0.5 font-mono text-[10px] text-text-tertiary">{item.time}</span>
                  <Icon className={cn('mt-0.5 h-3.5 w-3.5', item.color)} />
                  <span className="text-xs text-text-secondary">
                    <span className="font-medium text-text-primary">{item.user}</span>{' '}
                    {item.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
