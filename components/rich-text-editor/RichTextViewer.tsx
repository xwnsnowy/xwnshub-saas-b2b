// Enable client-side rendering for this component
'use client';

import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { baseExtension } from './extension';
import { generateHTML, type JSONContent } from '@tiptap/react';

interface RichTextViewerProps {
  content: string | JSONContent;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  // Function to convert Tiptap JSON content to HTML string
  const convertJsonToHtml = (jsonContent: JSONContent): string => {
    try {
      // Use Tiptap's generateHTML to convert JSON to HTML with base extensions
      return generateHTML(jsonContent, baseExtension);
    } catch (error) {
      console.error('Error generating HTML:', error);
      return '';
    }
  };

  // Function to get HTML content from various input formats
  const getHtmlContent = (): string => {
    if (!content) return '';

    try {
      // Check if content is a string and try to parse it as JSON
      const jsonContent = typeof content === 'string' ? JSON.parse(content) : content;
      // Convert the parsed JSON to HTML
      return convertJsonToHtml(jsonContent);
    } catch {
      // If JSON parsing fails, treat content as plain text
      // Return the string content or empty string if content is not a string
      return typeof content === 'string' ? content : '';
    }
  };

  // Get the HTML content to be displayed
  const htmlContent = getHtmlContent();

  // Sanitize HTML to prevent XSS (Cross-Site Scripting) attacks
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);

  // Render the sanitized HTML with Tailwind prose styling
  return (
    // Apply prose classes for rich text styling, dark mode support, and custom className
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className || ''}`}>
      {/* Parse the sanitized HTML string into React elements */}
      {parse(sanitizedHtml)}
    </div>
  );
}
