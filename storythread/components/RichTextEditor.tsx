'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { useEffect, useRef } from 'react';
import { SupabaseBroadcastProvider } from '@/lib/yjs-supabase';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus,
  Undo, Redo, Highlighter,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  wordCountLimit?: number;
  readOnly?: boolean;
  className?: string;
  /** When provided, enables real-time CRDT collaborative editing via Supabase Broadcast */
  docId?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your story...',
  wordCountLimit,
  readOnly = false,
  className = '',
  docId,
}: RichTextEditorProps) {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<SupabaseBroadcastProvider | null>(null);

  if (docId && !ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  const editor = useEditor({
    extensions: [
      ...(docId ? [Collaboration.configure({ document: ydocRef.current! })] : []),
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        history: docId ? false : undefined,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: wordCountLimit ? wordCountLimit * 6 : undefined }),
      Highlight.configure({ multicolor: true }),
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: docId ? undefined : content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-2 py-4',
      },
    },
  });

  // Set up Yjs provider after editor is ready
  useEffect(() => {
    if (!docId || !ydocRef.current || !editor) return;
    const ydoc = ydocRef.current;
    // Load persisted content into the Y.Doc on first connect (if no remote state)
    if (content && ydoc.getText('prosemirror').length === 0) {
      editor.commands.setContent(content, false);
    }
    const provider = new SupabaseBroadcastProvider(ydoc, docId);
    providerRef.current = provider;
    return () => {
      provider.destroy();
      providerRef.current = null;
      ydoc.destroy();
      ydocRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, editor]);

  // Non-collaborative: sync external content updates
  useEffect(() => {
    if (docId) return;
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor, docId]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (⌘B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (⌘I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (⌘U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <span className="text-xs font-bold w-4 text-center">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <span className="text-xs font-bold w-4 text-center">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <span className="text-xs font-bold w-4 text-center">H3</span>
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (⌘Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (⌘⇧Z)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {docId && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
            {wordCountLimit && (
              <span className={wordCount > wordCountLimit * 0.9 ? 'text-amber-500' : ''}>
                {wordCount.toLocaleString()} / {wordCountLimit.toLocaleString()} words
              </span>
            )}
            {!wordCountLimit && (
              <span>{wordCount.toLocaleString()} words</span>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      {!readOnly && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4">
          <span>⌘B Bold</span>
          <span>⌘I Italic</span>
          <span>⌘Z Undo</span>
          <span className="ml-auto">{docId ? 'Collaborative · Auto-saved' : 'Auto-saved'}</span>
        </div>
      )}
    </div>
  );
}
