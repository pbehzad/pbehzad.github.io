'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs font-mono transition-opacity ${
        active ? 'opacity-100' : 'opacity-40 hover:opacity-70'
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'underline opacity-70 hover:opacity-100' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write content...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const switchToCode = useCallback(() => {
    if (editor) {
      setRawHtml(editor.getHTML());
    }
    setIsCodeMode(true);
  }, [editor]);

  const switchToVisual = useCallback(() => {
    if (editor) {
      editor.commands.setContent(rawHtml);
    }
    onChange(rawHtml);
    setIsCodeMode(false);
  }, [editor, rawHtml, onChange]);

  if (!editor) return null;

  return (
    <div className="border border-white/20 rounded">
      {/* Mode toggle + Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-1 py-1">
        <button
          type="button"
          onClick={isCodeMode ? switchToVisual : undefined}
          className={`px-2 py-1 text-xs font-mono transition-opacity ${
            !isCodeMode ? 'opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={!isCodeMode ? switchToCode : undefined}
          className={`px-2 py-1 text-xs font-mono transition-opacity ${
            isCodeMode ? 'opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
        >
          Code
        </button>

        <span className="w-px bg-white/10 mx-1" />

        {!isCodeMode && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            >
              I
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
            >
              S
            </ToolbarButton>

            <span className="w-px bg-white/10 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            >
              H3
            </ToolbarButton>

            <span className="w-px bg-white/10 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            >
              &bull; List
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            >
              1. List
            </ToolbarButton>

            <span className="w-px bg-white/10 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
            >
              &ldquo; Quote
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              &mdash; HR
            </ToolbarButton>

            <span className="w-px bg-white/10 mx-1" />

            <ToolbarButton onClick={addLink} active={editor.isActive('link')}>
              Link
            </ToolbarButton>
            <ToolbarButton onClick={() => fileInputRef.current?.click()}>
              Image
            </ToolbarButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = '';
              }}
            />
          </>
        )}
      </div>

      {/* Editor / Code */}
      {isCodeMode ? (
        <textarea
          value={rawHtml}
          onChange={(e) => {
            setRawHtml(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[200px] bg-transparent text-white/80 font-mono text-xs px-4 py-3 focus:outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
