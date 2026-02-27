import { Bell, Check, CheckCheck, Clock, AlertTriangle, Info, Trash2, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchNotifications } from '@/lib/actions/notifications';
import { formatRelativeTime, getNotificationTypeColor } from '@/lib/utils';
import type { NotificationType } from '@/types/database';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'deadline_reminder':
    case 'appeal_deadline':
      return <Clock className="h-5 w-5 text-deadline-500" />;
    case 'renewal_alert':
    case 'document_expiry':
      return <AlertTriangle className="h-5 w-5 text-deadline-500" />;
    case 'approval':
      return <Check className="h-5 w-5 text-approval-500" />;
    case 'denial':
      return <AlertTriangle className="h-5 w-5 text-denial-500" />;
    case 'missing_document':
      return <Info className="h-5 w-5 text-notice-500" />;
    case 'status_check':
    case 'eligibility_update':
      return <Shield className="h-5 w-5 text-trust-500" />;
    default:
      return <Bell className="h-5 w-5 text-text-muted" />;
  }
}

export default async function NotificationsPage() {
  const result = await fetchNotifications();
  const notifications = result.success ? result.data : [];

  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unread.length > 0 ? `${unread.length} unread notification${unread.length > 1 ? 's' : ''}` : 'You\'re all caught up'}
          </p>
        </div>
        {unread.length > 0 && (
          <button className="inline-flex items-center gap-2 text-sm font-medium text-trust-600 hover:text-trust-700 transition-colors">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            New ({unread.length})
          </h2>
          {unread.map((notification) => (
            <Card key={notification.id} padding="sm" className="border-l-4 border-l-trust-500 bg-trust-50/30">
              <div className="flex items-start gap-3 p-1">
                {getNotificationIcon(notification.notification_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notification.title_en && (
                      <p className="text-sm font-semibold text-text-primary">{notification.title_en}</p>
                    )}
                    <Badge variant={getNotificationTypeColor(notification.notification_type) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{notification.message_en}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {notification.sent_at ? formatRelativeTime(notification.sent_at) : 'Scheduled'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-surface transition-colors" title="Mark as read">
                    <Check className="h-3.5 w-3.5 text-text-muted" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-surface transition-colors" title="Dismiss">
                    <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Earlier ({read.length})
          </h2>
          {read.map((notification) => (
            <Card key={notification.id} padding="sm" className="opacity-75">
              <div className="flex items-start gap-3 p-1">
                {getNotificationIcon(notification.notification_type)}
                <div className="flex-1 min-w-0">
                  {notification.title_en && (
                    <p className="text-sm font-medium text-text-primary">{notification.title_en}</p>
                  )}
                  <p className="text-sm text-text-secondary mt-0.5">{notification.message_en}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {notification.sent_at ? formatRelativeTime(notification.sent_at) : 'Scheduled'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary font-heading mb-1">No notifications</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              We&apos;ll notify you about deadlines, application updates, and eligibility changes.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
