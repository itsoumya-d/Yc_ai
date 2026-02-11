'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar, Download, Plus } from 'lucide-react';
import { getHealthTrends, addWeightEntry, type HealthTrendsData } from '@/lib/actions/health-trends';
import { useToast } from '@/components/ui/toast';
import type { Pet } from '@/types/database';

interface HealthTrendsDashboardProps {
  pet: Pet;
}

export function HealthTrendsDashboard({ pet }: HealthTrendsDashboardProps) {
  const { toast } = useToast();
  const [trends, setTrends] = useState<HealthTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Add weight modal
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState({
    weight: pet.weight || 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadTrends();
  }, [pet.id, dateRange]);

  async function loadTrends() {
    setLoading(true);
    const result = await getHealthTrends(pet.id, dateRange);
    if (result.data) {
      setTrends(result.data);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setLoading(false);
  }

  async function handleAddWeight() {
    if (newWeight.weight <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid weight', variant: 'destructive' });
      return;
    }

    const result = await addWeightEntry(
      pet.id,
      newWeight.weight,
      pet.weight_unit,
      newWeight.date,
      newWeight.notes
    );

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Weight entry added' });
      setShowAddWeight(false);
      loadTrends();
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!trends) {
    return <div className="text-center py-12">No trend data available</div>;
  }

  const healthScoreColor =
    trends.health_score >= 80 ? 'text-green-600' :
    trends.health_score >= 60 ? 'text-yellow-600' :
    'text-red-600';

  const healthScoreBg =
    trends.health_score >= 80 ? 'bg-green-100' :
    trends.health_score >= 60 ? 'bg-yellow-100' :
    'bg-red-100';

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            max={dateRange.end}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            min={dateRange.start}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setDateRange({
            start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          })}>
            Last 3 Months
          </Button>
          <Button variant="outline" onClick={() => setDateRange({
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          })}>
            Last Year
          </Button>
        </div>
      </div>

      {/* Health Score Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Health Score</h3>
            <p className="text-sm text-gray-600">
              Based on checkups, vaccines, weight, and medications
            </p>
          </div>
          <div className={`text-5xl font-bold ${healthScoreColor}`}>
            <div className={`w-32 h-32 rounded-full ${healthScoreBg} flex items-center justify-center`}>
              {trends.health_score}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">Checkups</div>
            <div className={trends.health_score >= 30 ? 'text-green-600' : 'text-gray-400'}>
              {trends.health_score >= 30 ? '✓' : '○'} 30pts
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Vaccines</div>
            <div className={trends.health_score >= 60 ? 'text-green-600' : 'text-gray-400'}>
              {trends.health_score >= 60 ? '✓' : '○'} 30pts
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Weight</div>
            <div className={trends.health_score >= 80 ? 'text-green-600' : 'text-gray-400'}>
              {trends.health_score >= 80 ? '✓' : '○'} 20pts
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Meds</div>
            <div className={trends.health_score >= 100 ? 'text-green-600' : 'text-gray-400'}>
              {trends.health_score >= 100 ? '✓' : '○'} 20pts
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      {trends.ai_insights.length > 0 && (
        <div className="space-y-3">
          {trends.ai_insights.map((insight, i) => (
            <Card key={i} className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">{insight}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Weight Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Weight Trend</h3>
            <p className="text-sm text-gray-600">
              Track {pet.name}'s weight over time
            </p>
          </div>
          <Button
            onClick={() => setShowAddWeight(!showAddWeight)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Weight
          </Button>
        </div>

        {showAddWeight && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Weight ({pet.weight_unit})</label>
                <Input
                  type="number"
                  value={newWeight.weight}
                  onChange={(e) => setNewWeight({ ...newWeight, weight: parseFloat(e.target.value) })}
                  step="0.1"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={newWeight.date}
                  onChange={(e) => setNewWeight({ ...newWeight, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Input
                  value={newWeight.notes}
                  onChange={(e) => setNewWeight({ ...newWeight, notes: e.target.value })}
                  placeholder="After grooming, etc."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleAddWeight} size="sm">Save</Button>
              <Button onClick={() => setShowAddWeight(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {trends.weight_history.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.weight_history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                label={{ value: `Weight (${pet.weight_unit})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number | undefined) => [`${value ?? 0} ${pet.weight_unit}`, 'Weight']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No weight data yet. Add weight entries to see trends.</p>
          </div>
        )}
      </Card>

      {/* Expenses Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Monthly Expenses</h3>
            <p className="text-sm text-gray-600">
              Total: ${trends.total_expenses.toFixed(2)} | Avg/month: ${trends.avg_monthly_expense.toFixed(2)}
            </p>
          </div>
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>

        {trends.expenses_by_month.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.expenses_by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Expenses']} />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" name="Monthly Total" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No expense data in this period.</p>
          </div>
        )}
      </Card>

      {/* Vet Visit Frequency */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Vet Visit Frequency</h3>
            <p className="text-sm text-gray-600">
              Number of vet visits by month
            </p>
          </div>
          <Calendar className="h-6 w-6 text-purple-600" />
        </div>

        {trends.vet_visit_frequency.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trends.vet_visit_frequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Vet Visits" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No vet visits recorded in this period.</p>
          </div>
        )}
      </Card>

      {/* Export Button */}
      <Card className="p-4">
        <Button variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Export Health Report (PDF)
        </Button>
      </Card>
    </div>
  );
}
