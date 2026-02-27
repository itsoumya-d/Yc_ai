import { Users, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchContacts } from '@/lib/actions/contacts';
import { getContactRoleLabel, getInitials } from '@/lib/utils';

export default async function ContactsPage() {
  const result = await fetchContacts();
  const contacts = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Trusted Contacts</h1>
          <p className="text-sm text-text-secondary mt-1">Manage the people you trust with your plans</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-text-primary mb-1">No contacts yet</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Add trusted contacts who will manage your affairs. Assign roles like executor, healthcare proxy, or digital executor.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id} hover padding="lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600 flex-shrink-0">
                  <span className="text-sm font-semibold">{getInitials(contact.full_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary">{contact.full_name}</h3>
                      <p className="text-xs text-text-muted">{contact.relationship}</p>
                    </div>
                    <Badge variant="blue">{getContactRoleLabel(contact.role)}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{contact.email}</p>
                  {contact.is_verified ? (
                    <Badge variant="green" className="mt-2">Verified</Badge>
                  ) : (
                    <Badge variant="amber" className="mt-2">Pending Verification</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
