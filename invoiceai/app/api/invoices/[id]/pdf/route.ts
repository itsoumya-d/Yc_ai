import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { ClassicTemplate } from '@/components/invoices/templates/classic';
import { ModernTemplate } from '@/components/invoices/templates/modern';
import { MinimalTemplate } from '@/components/invoices/templates/minimal';
import { BoldTemplate } from '@/components/invoices/templates/bold';
import { CreativeTemplate } from '@/components/invoices/templates/creative';
import type { InvoiceWithDetails, User } from '@/types/database';
import React from 'react';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get invoice with details
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Get user profile for branding
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const invoiceData = invoice as unknown as InvoiceWithDetails;
  const userData = userProfile as User | null;

  // Select template
  const templateMap: Record<string, React.FC<{ invoice: InvoiceWithDetails; user?: User | null }>> = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    minimal: MinimalTemplate,
    bold: BoldTemplate,
    creative: CreativeTemplate,
  };

  const TemplateComponent = templateMap[invoiceData.template] ?? ClassicTemplate;
  const element = React.createElement(TemplateComponent, {
    invoice: invoiceData,
    user: userData,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoiceData.invoice_number}.pdf"`,
    },
  });
}
