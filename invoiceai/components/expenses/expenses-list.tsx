'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { createExpenseAction, deleteExpenseAction } from '@/lib/actions/expenses';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types/database';

interface ExpensesListProps {
  initialExpenses: Expense[];
  totalCount: number;
}

export function ExpensesList({ initialExpenses, totalCount }: ExpensesListProps) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);

  const totalExpenses = initialExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    setSaving(true);
    const result = await createExpenseAction({
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      is_tax_deductible: isTaxDeductible,
      notes: notes || undefined,
    });
    setSaving(false);

    if (result.success) {
      toast({ title: 'Expense added', variant: 'success' });
      setShowAddDialog(false);
      setDescription('');
      setAmount('');
      setNotes('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const result = await deleteExpenseAction(id);
    if (result.success) {
      toast({ title: 'Expense deleted', variant: 'success' });
    }
  };

  const columns = [
    {
      key: 'description',
      header: 'Description',
      render: (exp: Expense) => (
        <span className="font-medium">{exp.description}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      className: 'text-right',
      render: (exp: Expense) => (
        <span className="font-amount font-medium">{formatCurrency(exp.amount)}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (exp: Expense) => (
        <span className="text-[var(--muted-foreground)]">{formatDate(exp.date)}</span>
      ),
    },
    {
      key: 'is_tax_deductible',
      header: 'Tax Deductible',
      render: (exp: Expense) => (
        <span className={exp.is_tax_deductible ? 'text-green-600' : 'text-[var(--muted-foreground)]'}>
          {exp.is_tax_deductible ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (exp: Expense) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(exp.id);
          }}
          className="rounded p-1 text-[var(--muted-foreground)] hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Expenses</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {totalCount} expense{totalCount !== 1 ? 's' : ''} &middot; {formatCurrency(totalExpenses)} total
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Expense
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={initialExpenses}
          keyExtractor={(e) => e.id}
          emptyState={
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              }
              title="No expenses yet"
              description="Track your business expenses for tax deductions and financial reporting."
              action={
                <Button onClick={() => setShowAddDialog(true)}>Add Your First Expense</Button>
              }
            />
          }
        />
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              label="Description *"
              placeholder="Office supplies, software, travel, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount *"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                label="Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <Textarea
              label="Notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isTaxDeductible}
                onChange={(e) => setIsTaxDeductible(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              Tax deductible
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
