import type React from 'react';
import { AbsoluteFill } from 'remotion';
import '../styles.css';

interface StageProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  background?: string;
}

/**
 * Stage - Provides the foundational environment for all clips
 * - Sets background color (default: near-black #09090B for dark promo style)
 * - Applies theme class for CSS variables
 * - Provides safe framing container
 */
export const Stage: React.FC<StageProps> = ({
  children,
  theme = 'dark',
  background = '#09090B',
}) => {
  return (
    <AbsoluteFill
      className={theme}
      style={{
        backgroundColor: background,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
