'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import {
  createClientAction,
  updateClientAction,
  type ClientFormData,
} from '@/lib/actions/clients';
import type { Client } from '@/types/database';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!client;

  const [formData, setFormData] = useState<ClientFormData>({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    default_payment_terms: client?.default_payment_terms ?? undefined,
    default_currency: client?.default_currency ?? 'USD',
    notes: client?.notes ?? '',
  });

  const handleChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = isEditing
      ? await updateClientAction(client.id, formData)
      : await createClientAction(formData);

    setLoading(false);

    if (result.success) {
      toast({
        title: isEditing ? 'Client updated' : 'Client created',
        description: `${formData.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
        variant: 'success',
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: result.error ?? 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your client details.'
              : 'Add a new client to start invoicing them.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Company"
              placeholder="Acme Inc."
              value={formData.company ?? ''}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          <Input
            label="Email *"
            type="email"
            placeholder="john@acme.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="Payment Terms (days)"
              type="number"
              placeholder="30"
              value={formData.default_payment_terms?.toString() ?? ''}
              onChange={(e) =>
                handleChange(
                  'default_payment_terms',
                  e.target.value ? parseInt(e.target.value) : 0
                )
              }
            />
          </div>

          <Input
            label="Address"
            placeholder="123 Main St, City, State ZIP"
            value={formData.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />

          <Textarea
            label="Notes"
            placeholder="Any notes about this client..."
            value={formData.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Client'
                  : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
