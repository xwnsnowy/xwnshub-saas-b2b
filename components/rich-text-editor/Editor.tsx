'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { editorExtension } from './extension';
import { MenuBar } from './MenuBar';
import { ReactNode, useEffect } from 'react';

interface RichTextEditorProps {
  field: any;
  sendButton: ReactNode;
  footerLeft?: ReactNode;
}

export function RichTextEditor({ field, sendButton, footerLeft }: RichTextEditorProps) {
  const editor = useEditor({
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    content: () => {
      if (!field?.value) {
        return '';
      }

      try {
        return JSON.parse(field.value);
      } catch {
        return '';
      }
    },
    onUpdate: ({ editor }) => {
      if (field?.onChange) {
        field.onChange(JSON.stringify(editor.getJSON()));
      }
    },
    extensions: editorExtension,
    editorProps: {
      attributes: {
        class:
          'min-h-[125px] max-w-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none dark:prose-invert p-4',
      },
    },
  });

  useEffect(() => {
    if (!editor || !field) return;

    const isEmpty = !field.value || field.value === '';
    const editorIsEmpty = editor.isEmpty;

    if (isEmpty && !editorIsEmpty) {
      editor.commands.clearContent();
    }
  }, [editor, field?.value]);

  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-input bg-card">
        <div className="min-h-8 shrink-0">{footerLeft}</div>
        <div className="min-h-8 shrink-0">{sendButton}</div>
      </div>
    </div>
  );
}
