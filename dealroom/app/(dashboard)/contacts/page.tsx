import { Users, Building2, Mail, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Deal } from '@/types/database';

interface ContactSummary {
  companyName: string;
  contactName: string;
  contactEmail: string;
  totalDeals: number;
  openPipeline: number;
  closedWon: number;
  lastActivity: string;
  latestDealId: string;
  stages: string[];
}

const STAGE_BADGE: Record<string, { label: string; color: string }> = {
  prospecting: { label: 'Prospecting', color: 'bg-gray-100 text-gray-600' },
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  proposal: { label: 'Proposal', color: 'bg-yellow-100 text-yellow-700' },
  negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  closed_won: { label: 'Won', color: 'bg-emerald-100 text-emerald-700' },
  closed_lost: { label: 'Lost', color: 'bg-red-100 text-red-600' },
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (!deals || deals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">All contacts across your deals</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No contacts yet</p>
          <p className="text-sm text-gray-400 mt-1">Contacts appear here automatically when you add deals.</p>
          <Link
            href="/deals/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-800 transition-colors"
          >
            Add first deal
          </Link>
        </div>
      </div>
    );
  }

  // Aggregate contacts from deals
  const contactMap = new Map<string, ContactSummary>();

  for (const deal of deals as Deal[]) {
    const key = `${deal.company_name.toLowerCase()}__${deal.contact_email.toLowerCase()}`;
    const existing = contactMap.get(key);

    const isOpen = !['closed_won', 'closed_lost'].includes(deal.stage);
    const isWon = deal.stage === 'closed_won';

    if (existing) {
      existing.totalDeals += 1;
      if (isOpen) existing.openPipeline += deal.amount;
      if (isWon) existing.closedWon += deal.amount;
      if (deal.updated_at > existing.lastActivity) {
        existing.lastActivity = deal.updated_at;
        existing.latestDealId = deal.id;
      }
      if (!existing.stages.includes(deal.stage)) existing.stages.push(deal.stage);
    } else {
      contactMap.set(key, {
        companyName: deal.company_name,
        contactName: deal.contact_name,
        contactEmail: deal.contact_email,
        totalDeals: 1,
        openPipeline: isOpen ? deal.amount : 0,
        closedWon: isWon ? deal.amount : 0,
        lastActivity: deal.updated_at,
        latestDealId: deal.id,
        stages: [deal.stage],
      });
    }
  }

  const contacts = Array.from(contactMap.values()).sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  const totalPipeline = contacts.reduce((sum, c) => sum + c.openPipeline, 0);
  const totalWon = contacts.reduce((sum, c) => sum + c.closedWon, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} across {deals.length} deals
          </p>
        </div>
        <Link
          href="/deals/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-800 transition-colors"
        >
          + Add Deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Contacts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open Pipeline</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPipeline)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Closed Won</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalWon)}</p>
        </div>
      </div>

      {/* Contacts table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contact</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Company</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">Stages</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Pipeline</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Won</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Deals</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contacts.map((contact, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(contact.contactName || contact.companyName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{contact.contactName || '—'}</p>
                      <a
                        href={`mailto:${contact.contactEmail}`}
                        className="text-xs text-gray-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        {contact.contactEmail}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {contact.companyName}
                  </div>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {contact.stages.slice(0, 2).map(stage => {
                      const cfg = STAGE_BADGE[stage];
                      return cfg ? (
                        <span key={stage} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      ) : null;
                    })}
                    {contact.stages.length > 2 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        +{contact.stages.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-right hidden sm:table-cell">
                  <span className="text-sm font-semibold text-gray-900">
                    {contact.openPipeline > 0 ? formatCurrency(contact.openPipeline) : '—'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right hidden sm:table-cell">
                  <span className={`text-sm font-semibold ${contact.closedWon > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {contact.closedWon > 0 ? formatCurrency(contact.closedWon) : '—'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/deals/${contact.latestDealId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {contact.totalDeals} {contact.totalDeals === 1 ? 'deal' : 'deals'}
                  </Link>
                </td>
                <td className="px-5 py-4 text-right hidden lg:table-cell">
                  <span className="text-xs text-gray-400">{formatDate(contact.lastActivity)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
