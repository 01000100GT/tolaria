import React from 'react';

interface EditorViewProps {
  content: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * EditorView - Simplified Tolaria editor representation
 * Clean, minimal design matching the app's editor aesthetic
 */
export const EditorView: React.FC<EditorViewProps> = ({ content, style }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px 40px',
        minWidth: '600px',
        maxWidth: '800px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {content}
      </div>
    </div>
  );
};

interface WikilinkProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Wikilink - Styled [[wikilink]] matching Tolaria's design
 */
export const Wikilink: React.FC<WikilinkProps> = ({ children, style }) => {
  return (
    <span
      style={{
        color: 'var(--accent-blue)',
        backgroundColor: 'rgba(21, 93, 255, 0.12)',
        borderRadius: '4px',
        padding: '2px 6px',
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
