'use server';

import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface WeightDataPoint {
  date: string;
  weight: number;
  weight_unit: string;
}

export interface ExpenseDataPoint {
  date: string;
  amount: number;
  category: string;
}

export interface HealthTrendsData {
  weight_history: WeightDataPoint[];
  expenses_by_month: ExpenseDataPoint[];
  vet_visit_frequency: { month: string; count: number }[];
  health_score: number;
  ai_insights: string[];
  total_expenses: number;
  avg_monthly_expense: number;
}

// Calculate health score (0-100)
function calculateHealthScore(data: {
  has_recent_checkup: boolean;
  vaccines_up_to_date: boolean;
  weight_stable: boolean;
  active_medications: number;
}): number {
  let score = 0;

  // Recent checkup (30 points)
  if (data.has_recent_checkup) score += 30;

  // Vaccines up to date (30 points)
  if (data.vaccines_up_to_date) score += 30;

  // Weight stability (20 points)
  if (data.weight_stable) score += 20;

  // Medication adherence (20 points)
  // Assume if meds are active, they're being taken
  if (data.active_medications > 0) {
    score += 20;
  } else {
    // No meds needed is also good
    score += 20;
  }

  return score;
}

// Detect weight anomalies using AI
async function detectWeightAnomalies(
  weightHistory: WeightDataPoint[],
  petName: string,
  species: string
): Promise<string[]> {
  if (weightHistory.length < 3) {
    return []; // Need at least 3 data points
  }

  const insights: string[] = [];

  // Sort by date
  const sorted = [...weightHistory].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate weight change percentage
  const latestWeight = sorted[sorted.length - 1].weight;
  const previousWeight = sorted[sorted.length - 2].weight;
  const oldestWeight = sorted[0].weight;

  const recentChange = ((latestWeight - previousWeight) / previousWeight) * 100;
  const overallChange = ((latestWeight - oldestWeight) / oldestWeight) * 100;

  // Detect sudden weight loss (>5% in short period)
  if (recentChange < -5) {
    insights.push(
      `⚠️ ${petName}'s weight decreased by ${Math.abs(recentChange).toFixed(1)}% recently. Sudden weight loss can indicate health issues. Consider scheduling a vet visit.`
    );
  }

  // Detect gradual weight gain (>15% overall)
  if (overallChange > 15) {
    insights.push(
      `📊 ${petName}'s weight has increased by ${overallChange.toFixed(1)}% over time. Monitor diet and exercise to maintain healthy weight.`
    );
  }

  // Detect weight instability (fluctuating)
  const weights = sorted.map(w => w.weight);
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;

  if (coefficientOfVariation > 10) {
    insights.push(
      `📉 ${petName}'s weight has been fluctuating significantly. Consistent monitoring recommended.`
    );
  }

  // Use AI for deeper analysis if there are significant changes
  if (insights.length > 0) {
    try {
      const prompt = `Analyze this ${species}'s weight trend:
- Current weight: ${latestWeight} ${sorted[0].weight_unit}
- Weight history: ${sorted.map(w => `${w.date}: ${w.weight}${w.weight_unit}`).join(', ')}
- Recent change: ${recentChange.toFixed(1)}%
- Overall change: ${overallChange.toFixed(1)}%

Provide ONE brief, actionable insight about this trend in 1-2 sentences. Focus on whether this is normal or concerning.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a veterinary health assistant. Provide brief, practical insights about pet health trends. Be encouraging when trends are positive, cautious when concerning.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const aiInsight = completion.choices[0]?.message?.content;
      if (aiInsight) {
        insights.push(`🤖 AI Analysis: ${aiInsight}`);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }
  }

  return insights;
}

// Get health trends data for a pet
export async function getHealthTrends(
  petId: string,
  dateRange: { start: string; end: string } = {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    end: new Date().toISOString().split('T')[0], // today
  }
): Promise<ActionResult<HealthTrendsData>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get pet info
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (petError || !pet) {
      return { error: 'Pet not found' };
    }

    // Get weight history
    const { data: weightHistory, error: weightError } = await supabase
      .from('weight_history')
      .select('*')
      .eq('pet_id', petId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (weightError) throw weightError;

    // Get expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('pet_id', petId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (expensesError) throw expensesError;

    // Get health records (vet visits)
    const { data: healthRecords, error: recordsError } = await supabase
      .from('health_records')
      .select('*')
      .eq('pet_id', petId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true });

    if (recordsError) throw recordsError;

    // Get medications
    const { data: medications, error: medsError } = await supabase
      .from('medications')
      .select('*')
      .eq('pet_id', petId)
      .eq('is_active', true);

    if (medsError) throw medsError;

    // Process expenses by month
    const expensesByMonth = expenses?.reduce((acc: any[], expense) => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      const existing = acc.find(e => e.date === month);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({
          date: month,
          amount: expense.amount,
          category: 'total',
        });
      }
      return acc;
    }, []) || [];

    // Process vet visit frequency by month
    const vetVisitFrequency = healthRecords?.reduce((acc: any[], record) => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      const existing = acc.find(v => v.month === month);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, []) || [];

    // Calculate health score
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const hasRecentCheckup = healthRecords?.some(r =>
      r.type === 'checkup' && new Date(r.date) > oneYearAgo
    ) || false;

    const vaccinesUpToDate = healthRecords?.some(r =>
      r.type === 'vaccination' && new Date(r.date) > oneYearAgo
    ) || false;

    // Check weight stability (less than 10% change)
    let weightStable = true;
    if (weightHistory && weightHistory.length >= 2) {
      const latest = weightHistory[weightHistory.length - 1];
      const oldest = weightHistory[0];
      const change = Math.abs(((latest.weight - oldest.weight) / oldest.weight) * 100);
      weightStable = change < 10;
    }

    const healthScore = calculateHealthScore({
      has_recent_checkup: hasRecentCheckup,
      vaccines_up_to_date: vaccinesUpToDate,
      weight_stable: weightStable,
      active_medications: medications?.length || 0,
    });

    // Generate AI insights
    const aiInsights = await detectWeightAnomalies(
      weightHistory || [],
      pet.name,
      pet.species
    );

    // Calculate total and average expenses
    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const avgMonthlyExpense = expensesByMonth.length > 0
      ? totalExpenses / expensesByMonth.length
      : 0;

    return {
      data: {
        weight_history: weightHistory || [],
        expenses_by_month: expensesByMonth,
        vet_visit_frequency: vetVisitFrequency,
        health_score: healthScore,
        ai_insights: aiInsights,
        total_expenses: totalExpenses,
        avg_monthly_expense: avgMonthlyExpense,
      },
    };
  } catch (error: any) {
    console.error('Error fetching health trends:', error);
    return { error: error.message || 'Failed to fetch health trends' };
  }
}

// Add weight entry
export async function addWeightEntry(
  petId: string,
  weight: number,
  weight_unit: 'lbs' | 'kg',
  date: string,
  notes?: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify pet ownership
    const { data: pet } = await supabase
      .from('pets')
      .select('id')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return { error: 'Pet not found' };
    }

    // Insert weight entry
    const { error } = await supabase
      .from('weight_history')
      .insert({
        pet_id: petId,
        weight,
        weight_unit,
        date,
        notes,
      });

    if (error) throw error;

    // Update current weight on pet record
    await supabase
      .from('pets')
      .update({ weight, weight_unit })
      .eq('id', petId);

    return { data: null };
  } catch (error: any) {
    console.error('Error adding weight entry:', error);
    return { error: error.message || 'Failed to add weight entry' };
  }
}
