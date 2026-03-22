'use client';

/**
 * Supabase Realtime Broadcast provider for Yjs with persistence.
 * Syncs Y.Doc updates between connected clients via Supabase Realtime,
 * and persists document state to a `document_states` table so edits
 * survive when all clients disconnect.
 */
import * as Y from 'yjs';
import { createClient } from '@/lib/supabase/client';

type BroadcastChannel = ReturnType<ReturnType<typeof createClient>['channel']>;

export class SupabaseBroadcastProvider {
  private channel: BroadcastChannel;
  private doc: Y.Doc;
  private roomName: string;
  private updateHandler: (update: Uint8Array, origin: unknown) => void;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(doc: Y.Doc, roomName: string) {
    this.doc = doc;
    this.roomName = roomName;
    const supabase = createClient();

    // Load persisted state before subscribing to live updates
    this.loadPersistedState();

    this.channel = supabase.channel(`yjs:${roomName}`, {
      config: { broadcast: { self: false } },
    });

    // Receive Yjs updates from other clients and apply to local doc
    this.channel.on(
      'broadcast',
      { event: 'yjs-update' },
      ({ payload }: { payload: { update: number[] } }) => {
        Y.applyUpdate(doc, new Uint8Array(payload.update), 'remote');
      }
    );

    this.channel.subscribe();

    // Broadcast local doc updates to other clients (ignore updates from remote to avoid echo)
    this.updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === 'remote') return;
      this.channel.send({
        type: 'broadcast',
        event: 'yjs-update',
        payload: { update: Array.from(update) },
      });
      this.debounceSave();
    };

    doc.on('update', this.updateHandler);
  }

  /**
   * Load persisted Y.Doc state from Supabase on connect.
   */
  private async loadPersistedState() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('document_states')
        .select('state')
        .eq('document_id', this.roomName)
        .single();

      if (data?.state && !this.destroyed) {
        const binaryState = Uint8Array.from(atob(data.state), (c) => c.charCodeAt(0));
        Y.applyUpdate(this.doc, binaryState, 'persistence');
      }
    } catch {
      // No persisted state yet — that's fine for new documents
    }
  }

  /**
   * Debounce-save Y.Doc state to Supabase (1 second after last edit).
   */
  private debounceSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.persistState();
    }, 1000);
  }

  /**
   * Persist the full Y.Doc state to Supabase as base64.
   */
  private async persistState() {
    if (this.destroyed) return;
    try {
      const state = Y.encodeStateAsUpdate(this.doc);
      const base64State = btoa(String.fromCharCode(...state));
      const supabase = createClient();
      await supabase
        .from('document_states')
        .upsert(
          {
            document_id: this.roomName,
            state: base64State,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'document_id' }
        );
    } catch {
      // Silently fail persistence — next save will retry
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    // Final save on disconnect
    this.persistState();
    this.doc.off('update', this.updateHandler);
    const supabase = createClient();
    supabase.removeChannel(this.channel);
  }
}
