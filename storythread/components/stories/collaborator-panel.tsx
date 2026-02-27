'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import {
  inviteCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
} from '@/lib/actions/collaborators';
import {
  Users,
  UserPlus,
  Crown,
  Pen,
  Eye,
  Edit3,
  X,
  Mail,
  Check,
  Clock,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import type { Collaborator, CollaboratorRole } from '@/types/database';

interface CollaboratorPanelProps {
  storyId: string;
  collaborators: Collaborator[];
}

const roleIcons: Record<CollaboratorRole, typeof Crown> = {
  owner: Crown,
  writer: Pen,
  editor: Edit3,
  viewer: Eye,
};

const roleLabels: Record<CollaboratorRole, string> = {
  owner: 'Owner',
  writer: 'Writer',
  editor: 'Editor',
  viewer: 'Viewer',
};

const roleColors: Record<CollaboratorRole, string> = {
  owner: 'text-amber-600 bg-amber-50 border-amber-200',
  writer: 'text-blue-600 bg-blue-50 border-blue-200',
  editor: 'text-purple-600 bg-purple-50 border-purple-200',
  viewer: 'text-gray-600 bg-gray-50 border-gray-200',
};

const statusColors: Record<string, string> = {
  pending: 'text-yellow-700 bg-yellow-50',
  accepted: 'text-green-700 bg-green-50',
  declined: 'text-red-700 bg-red-50',
  removed: 'text-gray-500 bg-gray-50',
};

export function CollaboratorPanel({ storyId, collaborators }: CollaboratorPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('writer');
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCollaborators = collaborators.filter((c) => c.status !== 'removed');

  function handleInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await inviteCollaborator(storyId, email.trim(), role);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Invitation sent', description: `Invited ${email} as ${roleLabels[role]}` });
        setEmail('');
        setShowInvite(false);
        router.refresh();
      }
    });
  }

  function handleUpdateRole(id: string, newRole: CollaboratorRole) {
    startTransition(async () => {
      const result = await updateCollaboratorRole(id, newRole);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Role updated' });
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleRemove(id: string) {
    if (!confirm('Remove this collaborator?')) return;
    startTransition(async () => {
      const result = await removeCollaborator(id, storyId);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Collaborator removed' });
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            Collaborators ({activeCollaborators.length})
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowInvite(!showInvite)}
          className="gap-1.5"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </Button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="border-b border-gray-100 bg-gray-50 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@email.com"
                className="h-9 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="writer">Writer</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {role === 'writer' && 'Can write and edit assigned chapters'}
              {role === 'editor' && 'Can review and suggest edits on all chapters'}
              {role === 'viewer' && 'Can read all chapters including drafts'}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleInvite} disabled={!email.trim() || isPending}>
                {isPending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator List */}
      <div className="divide-y divide-gray-100">
        {activeCollaborators.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No collaborators yet</p>
            <p className="text-xs text-gray-400">Invite writers, editors, or viewers to collaborate</p>
          </div>
        ) : (
          activeCollaborators.map((collab) => {
            const RoleIcon = roleIcons[collab.role];
            const isEditing = editingId === collab.id;

            return (
              <div key={collab.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${roleColors[collab.role]}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{collab.email}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[collab.status]}`}>
                        {collab.status === 'pending' && <Clock className="h-2.5 w-2.5" />}
                        {collab.status === 'accepted' && <Check className="h-2.5 w-2.5" />}
                        {collab.status === 'declined' && <XCircle className="h-2.5 w-2.5" />}
                        {collab.status}
                      </span>
                    </div>
                    {collab.assigned_chapters.length > 0 && (
                      <p className="text-[10px] text-gray-400">
                        Chapters: {collab.assigned_chapters.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {collab.role !== 'owner' && (
                    <>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          {(['writer', 'editor', 'viewer'] as CollaboratorRole[]).map((r) => (
                            <button
                              key={r}
                              onClick={() => handleUpdateRole(collab.id, r)}
                              disabled={isPending}
                              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                collab.role === r
                                  ? 'bg-brand-100 text-brand-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {roleLabels[r]}
                            </button>
                          ))}
                          <button
                            onClick={() => setEditingId(null)}
                            className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(collab.id)}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${roleColors[collab.role]}`}
                          >
                            {roleLabels[collab.role]}
                            <ChevronDown className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={() => handleRemove(collab.id)}
                            disabled={isPending}
                            className="ml-1 rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {collab.role === 'owner' && (
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${roleColors.owner}`}>
                      {roleLabels.owner}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
