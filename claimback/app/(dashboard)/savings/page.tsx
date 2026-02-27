import { fetchDashboardStats } from '@/lib/actions/dashboard';
import { fetchSavingsMilestones } from '@/lib/actions/settings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getMilestoneLabel } from '@/lib/utils';
import type { MilestoneType } from '@/types/database';
import { PiggyBank, Trophy, Star, Target, TrendingUp, Award } from 'lucide-react';

export default async function SavingsPage() {
  const [statsRes, milestonesRes] = await Promise.all([
    fetchDashboardStats(),
    fetchSavingsMilestones(),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const milestones = milestonesRes.success ? milestonesRes.data : [];

  const allMilestones: MilestoneType[] = [
    'first_scan', 'first_save', 'saved_100', 'saved_500', 'saved_1000',
    'saved_5000', 'saved_10000', 'disputes_3', 'disputes_10', 'win_streak_3', 'bank_connected',
  ];
  const achievedSet = new Set(milestones.map((m) => m.milestone_type));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Savings</h1>
        <p className="text-text-secondary mt-1">Track your savings and achievements</p>
      </div>

      {/* Total Savings Hero */}
      <Card className="bg-gradient-to-r from-success-600 to-success-700 text-white border-0">
        <div className="p-6 text-center">
          <PiggyBank className="h-10 w-10 mx-auto mb-2 text-success-100" />
          <p className="text-success-100 text-sm font-medium">Total Lifetime Savings</p>
          <p className="text-5xl font-bold font-heading mt-1">
            {formatCurrency(stats?.totalSavedCents ?? 0)}
          </p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="p-5 text-center">
            <TrendingUp className="h-6 w-6 text-champion-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{stats?.winRate ?? 0}%</p>
            <p className="text-sm text-text-secondary">Win Rate</p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <Target className="h-6 w-6 text-energy-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{stats?.activeDisputes ?? 0}</p>
            <p className="text-sm text-text-secondary">Active Disputes</p>
          </div>
        </Card>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-heading mb-4">
          Milestones ({milestones.length}/{allMilestones.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allMilestones.map((type) => {
            const achieved = achievedSet.has(type);
            const milestone = milestones.find((m) => m.milestone_type === type);

            return (
              <Card key={type} className={achieved ? 'border-success-200 bg-success-50' : 'opacity-60'}>
                <div className="p-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    achieved ? 'bg-success-100' : 'bg-surface-secondary'
                  }`}>
                    {achieved ? (
                      <Trophy className="h-5 w-5 text-success-600" />
                    ) : (
                      <Star className="h-5 w-5 text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${achieved ? 'text-success-700' : 'text-text-secondary'}`}>
                      {getMilestoneLabel(type)}
                    </p>
                    {achieved && milestone && (
                      <p className="text-xs text-success-600">
                        Achieved {new Date(milestone.achieved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {achieved && <Badge variant="green">Earned</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
