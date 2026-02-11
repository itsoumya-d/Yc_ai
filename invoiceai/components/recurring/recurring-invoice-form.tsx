'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import { createRecurringInvoice, getUpcomingInvoiceDates } from '@/lib/actions/recurring-invoices';
import { useToast } from '@/components/ui/toast';
import type { Client, RecurringInvoice } from '@/types/database';

interface RecurringInvoiceFormProps {
  clients: Client[];
  defaultClientId?: string;
}

export function RecurringInvoiceForm({ clients, defaultClientId }: RecurringInvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDates, setPreviewDates] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    client_id: defaultClientId || '',
    frequency: 'monthly' as RecurringInvoice['frequency'],
    interval_count: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    payment_terms: 30,
    currency: 'USD',
    tax_rate: 0,
    discount_amount: 0,
    discount_type: 'flat' as 'flat' | 'percent',
    notes: '',
    terms: '',
    items: [
      { description: '', quantity: 1, unit_price: 0, amount: 0 }
    ],
  });

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * formData.tax_rate) / 100;
  const discountAmount = formData.discount_type === 'percent'
    ? (subtotal * formData.discount_amount) / 100
    : formData.discount_amount;
  const total = subtotal + taxAmount - discountAmount;

  // Update preview dates when frequency/start date changes
  useEffect(() => {
    if (formData.start_date && formData.frequency) {
      getUpcomingInvoiceDates(
        formData.start_date,
        formData.frequency,
        formData.interval_count,
        6
      ).then(setPreviewDates);
    }
  }, [formData.start_date, formData.frequency, formData.interval_count]);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate amount
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      toast({ title: 'Error', description: 'Please select a client', variant: 'destructive' });
      return;
    }

    if (formData.items.some(item => !item.description || item.unit_price <= 0)) {
      toast({ title: 'Error', description: 'Please fill in all line items', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createRecurringInvoice({
        client_id: formData.client_id,
        frequency: formData.frequency,
        interval_count: formData.interval_count,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        invoice_template: {
          payment_terms: formData.payment_terms,
          currency: formData.currency,
          subtotal,
          tax_rate: formData.tax_rate,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          discount_type: formData.discount_type,
          total,
          notes: formData.notes,
          terms: formData.terms,
          template: 'modern',
          items: formData.items,
        },
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({ title: 'Success', description: 'Recurring invoice created successfully' });
      router.push('/recurring-invoices');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client & Frequency Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recurring Schedule</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company && `(${client.company})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frequency *</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringInvoice['frequency'] })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 Weeks</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semiannual">Every 6 Months</option>
              <option value="annual">Annually</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={formData.start_date}
            />
          </div>
        </div>

        {/* Preview upcoming dates */}
        {previewDates.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Upcoming Invoice Dates</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
              {previewDates.map((date, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {new Date(date).toLocaleDateString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Line Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Line Items</h3>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="text"
                  value={`$${item.amount.toFixed(2)}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="col-span-1 flex items-center">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="mt-3"
        >
          + Add Line Item
        </Button>

        {/* Totals */}
        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tax Rate (%)</label>
              <Input
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'flat' | 'percent' })}
                  className="px-2 border rounded"
                >
                  <option value="flat">$</option>
                  <option value="percent">%</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Notes & Terms */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Terms (days)</label>
            <Input
              type="number"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 30 })}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Internal notes (not visible to client)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Payment terms, late fees, etc."
            />
          </div>
        </div>
      </Card>

      {/* Warning about auto-pause */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium">Auto-Pause Protection</p>
            <p className="text-yellow-800 mt-1">
              If payment fails 3 times consecutively, this recurring invoice will automatically pause to prevent awkward client situations. You'll be notified and can resume manually.
            </p>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? 'Creating...' : 'Create Recurring Invoice'}
        </Button>
      </div>
    </form>
  );
}
