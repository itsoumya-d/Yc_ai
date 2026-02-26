'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { createComment, deleteComment } from '@/lib/actions/comments';
import {
  MessageCircle,
  Send,
  Reply,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import type { Comment } from '@/types/database';

interface CommentSectionProps {
  storyId: string;
  comments: Comment[];
  currentUserId?: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function CommentItem({
  comment,
  replies,
  storyId,
  currentUserId,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  storyId: string;
  currentUserId?: string;
  onReply: (parentId: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReplies, setShowReplies] = useState(true);

  function handleDelete() {
    if (!confirm('Delete this comment?')) return;
    startTransition(async () => {
      await deleteComment(comment.id, storyId);
      router.refresh();
    });
  }

  const isOwn = currentUserId && comment.user_id === currentUserId;

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.author_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
            {isOwn && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 mb-2"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
              {showReplies && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                  {replies.map((reply) => (
                    <div key={reply.id} className="group/reply flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <User className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">
                            {reply.author_name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-gray-400">{timeAgo(reply.created_at)}</span>
                          {currentUserId && reply.user_id === currentUserId && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this reply?')) {
                                  startTransition(async () => {
                                    await deleteComment(reply.id, storyId);
                                    router.refresh();
                                  });
                                }
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ storyId, comments, currentUserId }: CommentSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Separate top-level comments and replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesMap = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.parent_id) {
      const existing = repliesMap.get(c.parent_id) || [];
      existing.push(c);
      repliesMap.set(c.parent_id, existing);
    }
  });

  function handleSubmit() {
    if (!content.trim()) return;
    const text = content.trim();
    setContent('');
    startTransition(async () => {
      await createComment(storyId, text);
      router.refresh();
    });
  }

  function handleReply(parentId: string) {
    setReplyingTo(replyingTo === parentId ? null : parentId);
    setReplyContent('');
  }

  function submitReply(parentId: string) {
    if (!replyContent.trim()) return;
    const text = replyContent.trim();
    setReplyContent('');
    setReplyingTo(null);
    startTransition(async () => {
      await createComment(storyId, text, undefined, parentId);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16">
      <div className="border-t border-gray-200 pt-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        {/* New Comment */}
        <div className="mb-8">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts on this story..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isPending ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Comment List */}
        {topLevel.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevel.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  replies={repliesMap.get(comment.id) || []}
                  storyId={storyId}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                />
                {/* Inline Reply Box */}
                {replyingTo === comment.id && (
                  <div className="mt-3 ml-11 pl-4 border-l-2 border-brand-200">
                    <textarea
                      autoFocus
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:border-brand-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          submitReply(comment.id);
                        }
                      }}
                    />
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">⌘+Enter to submit</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyContent.trim() || isPending}
                          className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
