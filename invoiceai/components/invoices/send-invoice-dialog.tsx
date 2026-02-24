'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { sendInvoiceAction } from '@/lib/actions/send-invoice';

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientName,
  clientEmail,
}: SendInvoiceDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    const result = await sendInvoiceAction(invoiceId, personalMessage.trim() || undefined);
    setIsSending(false);

    if (result.success) {
      toast({
        title: 'Invoice sent!',
        description: `Invoice ${invoiceNumber} sent to ${clientEmail}.`,
        variant: 'success',
      });
      onOpenChange(false);
      router.refresh();
    } else {
      toast({
        title: 'Failed to send invoice',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice {invoiceNumber}</DialogTitle>
          <DialogDescription>
            This will email the invoice and a payment link to{' '}
            <span className="font-medium text-[var(--foreground)]">{clientName}</span> at{' '}
            <span className="font-medium text-[var(--foreground)]">{clientEmail}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Textarea
            label="Personal message (optional)"
            placeholder="Add a note to your client, e.g. 'Thanks for working with us!'"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending…' : 'Send Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
