import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ReactPDF from '@react-pdf/renderer';
import { ProposalDocument } from '@/components/proposals/proposal-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        clients(name, company, email, phone),
        proposal_sections(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Sort sections by order_index
    proposal.proposal_sections.sort(
      (a: any, b: any) => a.order_index - b.order_index
    );

    // Get user business info for letterhead
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, business_name, email')
      .eq('id', user.id)
      .single();

    const pdfStream = await ReactPDF.renderToStream(
      ProposalDocument({
        proposal,
        profile: profile || { full_name: '', business_name: '', email: '' },
      })
    );

    // Convert ReadableStream to Response
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);

    const filename = `${proposal.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-proposal.pdf`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
