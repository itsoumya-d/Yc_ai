import {
  Heart,
  Globe,
  FolderLock,
  Users,
  Scale,
  Timer,
  ArrowRight,
  CheckCircle,
  Leaf,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, fetchRecentWishes, fetchRecentContacts } from '@/lib/actions/dashboard';
import { getWishCategoryLabel, getContactRoleLabel } from '@/lib/utils';

export default async function DashboardPage() {
  const [statsResult, wishesResult, contactsResult] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentWishes(),
    fetchRecentContacts(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const wishes = wishesResult.success ? wishesResult.data : [];
  const contacts = contactsResult.success ? contactsResult.data : [];

  const statCards = [
    { label: 'Wishes', value: stats?.wishes_count ?? 0, icon: <Heart className="h-5 w-5 text-sage-600" />, href: '/wishes' },
    { label: 'Digital Assets', value: stats?.assets_count ?? 0, icon: <Globe className="h-5 w-5 text-trustblue-600" />, href: '/assets' },
    { label: 'Documents', value: stats?.documents_count ?? 0, icon: <FolderLock className="h-5 w-5 text-warmamber-600" />, href: '/vault' },
    { label: 'Contacts', value: stats?.contacts_count ?? 0, icon: <Users className="h-5 w-5 text-sage-600" />, href: '/contacts' },
    { label: 'Legal Docs', value: stats?.legal_documents_count ?? 0, icon: <Scale className="h-5 w-5 text-trustblue-600" />, href: '/legal' },
    { label: 'Missed Check-Ins', value: stats?.missed_check_ins ?? 0, icon: <Timer className="h-5 w-5 text-gentlered-600" />, href: '/checkin' },
  ];

  const completeness = stats?.plan_completeness ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Your end-of-life planning overview</p>
        </div>
        <Link
          href="/wishes"
          className="hidden sm:inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors"
        >
          <Heart className="h-4 w-4" />
          Add Wishes
        </Link>
      </div>

      {/* Plan Completeness */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-sage-600" />
            <h3 className="font-heading font-semibold text-text-primary">Plan Completeness</h3>
          </div>
          <span className="text-sm font-medium text-sage-600">{completeness}%</span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-2.5">
          <div
            className="bg-sage-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Complete your wishes, add contacts, and upload documents to improve your plan.
        </p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1 font-heading">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Wishes */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Wishes</CardTitle>
          <Link href="/wishes" className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {wishes.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No wishes documented yet</p>
            <Link href="/wishes" className="text-sm text-sage-600 hover:text-sage-700 mt-1 inline-block">
              Start documenting your wishes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishes.map((wish) => (
              <div key={wish.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{wish.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{getWishCategoryLabel(wish.category)}</p>
                </div>
                <Badge variant={wish.is_finalized ? 'green' : 'amber'}>
                  {wish.is_finalized ? 'Finalized' : 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Trusted Contacts */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Trusted Contacts</CardTitle>
          <Link href="/contacts" className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No trusted contacts added</p>
            <Link href="/contacts" className="text-sm text-sage-600 hover:text-sage-700 mt-1 inline-block">
              Add your first contact
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{contact.full_name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{contact.relationship}</p>
                </div>
                <Badge variant="blue">
                  {getContactRoleLabel(contact.role)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
