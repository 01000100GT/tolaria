import type React from 'react';

interface NoteCardProps {
  title: string;
  preview?: string;
  style?: React.CSSProperties;
  scale?: number;
  rotate?: number;
}

/**
 * NoteCard - Represents a Tolaria note
 * Faithful to the app's card design with title, preview, and border
 */
export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  preview,
  style,
  scale = 1,
  rotate = 0,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '200px',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1)',
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: 'center center',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: preview ? '8px' : '0',
        }}
      >
        {title}
      </div>
      {preview && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {preview}
        </div>
      )}
    </div>
  );
};
