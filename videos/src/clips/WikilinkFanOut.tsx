import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Stage } from '../components/Stage';
import { EditorView, Wikilink } from '../components/EditorView';
import { NoteCard } from '../components/NoteCard';
import { easeOut } from '../lib/timing';
import { burstOutTransform, transformToCSS } from '../lib/transitions';

/**
 * WikilinkFanOut - Sample promo clip
 * Shows typing a note with wikilinks, then linked notes fan out into view
 * Duration: 8 seconds @ 60fps = 480 frames
 *
 * Timeline:
 * 0-45 (0-0.75s): Editor fades in with initial text
 * 45-90 (0.75-1.5s): First wikilink appears
 * 90-135 (1.5-2.25s): Second wikilink appears
 * 135-180 (2.25-3s): Third wikilink appears
 * 180-240 (3-4s): Editor scales down and slides left
 * 220-310 (3.67-5.17s): Notes burst out and settle (staggered)
 * 310-450 (5.17-7.5s): Hold on final composition
 * 450-480 (7.5-8s): Fade to black
 */
export const WikilinkFanOut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing gates
  const editorFadeIn = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const wikilink1 = frame >= 45;
  const wikilink2 = frame >= 90;
  const wikilink3 = frame >= 135;

  // Editor transform (slides left & scales down)
  const editorTransform = interpolate(
    frame,
    [180, 240],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeOut,
    }
  );

  const editorX = -300 * editorTransform;
  const editorScale = 1 - 0.35 * editorTransform;

  // Linked notes data
  const linkedNotes = [
    { title: 'Design System', preview: 'Core principles and patterns for building consistent UI components' },
    { title: 'Component Architecture', preview: 'Modular approach to structuring reusable components' },
    { title: 'Atomic Design', preview: 'Methodology for creating design systems from atoms to organisms' },
    { title: 'Accessibility Guidelines', preview: 'WCAG compliance and inclusive design practices' },
    { title: 'Typography Scale', preview: 'Font sizes, weights, and hierarchy system' },
    { title: 'Color Tokens', preview: 'Semantic color system with light and dark mode support' },
  ];

  // Burst center (where notes originate from)
  const burstCenter = { x: 960, y: 540 };

  // Grid layout for final note positions
  const notePositions = [
    { x: 1260, y: 240, rotate: -3 },
    { x: 1560, y: 240, rotate: 2 },
    { x: 1260, y: 480, rotate: 1 },
    { x: 1560, y: 480, rotate: -2 },
    { x: 1260, y: 720, rotate: 2 },
    { x: 1560, y: 720, rotate: -1 },
  ];

  // Final fade out
  const fadeOut = interpolate(frame, [450, 480], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stage theme="dark" background="#09090B">
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Editor View */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateX(${editorX}px) scale(${editorScale})`,
            opacity: editorFadeIn,
            zIndex: 10,
          }}
        >
          <EditorView
            content={
              <>
                <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                  Building a Design System
                </div>
                <p style={{ margin: '8px 0' }}>
                  Every great product needs a solid foundation. Let's explore the key components:
                </p>
                <p style={{ margin: '8px 0' }}>
                  {wikilink1 && <Wikilink>[[Design System]]</Wikilink>}
                  {wikilink1 && ' starts with clear principles. '}
                  {wikilink2 && <Wikilink>[[Component Architecture]]</Wikilink>}
                  {wikilink2 && ' ensures reusability. '}
                  {wikilink3 && <Wikilink>[[Atomic Design]]</Wikilink>}
                  {wikilink3 && ' brings it all together.'}
                </p>
              </>
            }
          />
        </div>

        {/* Burst-out notes */}
        {frame >= 220 &&
          linkedNotes.map((note, index) => {
            const startFrame = 220 + index * 12; // Stagger by 0.2s
            const endFrame = startFrame + 90; // 1.5s animation

            const progress = interpolate(
              frame,
              [startFrame, endFrame],
              [0, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            );

            const targetRect = {
              x: notePositions[index].x,
              y: notePositions[index].y,
              width: 280,
              height: 120,
            };

            const transform = burstOutTransform(
              burstCenter,
              targetRect,
              progress,
              notePositions[index].rotate,
              easeOut
            );

            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  zIndex: 5 + index,
                  ...transformToCSS(transform),
                }}
              >
                <NoteCard
                  title={note.title}
                  preview={note.preview}
                  rotate={notePositions[index].rotate * progress}
                />
              </div>
            );
          })}
      </AbsoluteFill>
    </Stage>
  );
};
