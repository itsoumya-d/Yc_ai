'use client';

import { useState, useTransition } from 'react';
import { addComment, deleteComment } from '@/lib/actions/social';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import type { CommentWithAuthor } from '@/types/database';

interface StoryCommentsProps {
  storyId: string;
  initialComments: CommentWithAuthor[];
  currentUserId?: string;
}

function CommentItem({
  comment,
  storyId,
  currentUserId,
  onDelete,
  depth = 0,
}: {
  comment: CommentWithAuthor;
  storyId: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [replies, setReplies] = useState<CommentWithAuthor[]>(comment.replies ?? []);

  const authorDisplay = comment.author_pen_name || comment.author_name || 'Anonymous';
  const initials = getInitials(authorDisplay);
  const isOwn = currentUserId === comment.user_id;

  const handleReply = () => {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const result = await addComment(storyId, replyText.trim(), comment.id);
      if (result.data) {
        setReplies((prev) => [...prev, result.data!]);
        setReplyText('');
        setShowReplyForm(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteComment(comment.id);
      onDelete(comment.id);
    });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {initials}
        </div>
        <div className="flex-1">
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">{authorDisplay}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 pl-2">
            {currentUserId && depth === 0 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-500 hover:text-brand-600 transition-colors"
              >
                Reply
              </button>
            )}
            {isOwn && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && currentUserId && (
            <div className="mt-3 ml-0">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={isPending || !replyText.trim()}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              storyId={storyId}
              currentUserId={currentUserId}
              onDelete={(id) => setReplies((prev) => prev.filter((r) => r.id !== id))}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StoryComments({ storyId, initialComments, currentUserId }: StoryCommentsProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUserId) return;
    startTransition(async () => {
      const result = await addComment(storyId, newComment.trim());
      if (result.data) {
        setComments((prev) => [...prev, result.data!]);
        setNewComment('');
      }
    });
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="font-serif text-xl font-bold text-gray-900 mb-6">
        Discussion {comments.length > 0 && <span className="text-gray-400 font-normal text-lg">({comments.length})</span>}
      </h2>

      {/* New comment form */}
      {currentUserId ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this story..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={isPending || !newComment.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            <a href="/login" className="text-brand-600 font-medium hover:underline">Sign in</a>
            {' '}to join the discussion.
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              storyId={storyId}
              currentUserId={currentUserId}
              onDelete={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
