# Tolaria Promo Videos

A Remotion-based video generation system for creating polished, on-brand promo clips for Tolaria.

## Overview

This package uses [Remotion](https://www.remotion.dev/) to programmatically generate motion graphics that showcase Tolaria's features. Videos reuse Tolaria's design tokens and can incorporate real React components where practical.

## Architecture

- **`src/components/`** - Reusable UI components (Stage, NoteCard, EditorView)
- **`src/lib/`** - Utilities (timing/easing, FLIP transitions)
- **`src/clips/`** - Individual video compositions
- **`src/styles.css`** - Tolaria design tokens (synchronized with main app)

### Design Approach

**Real vs Replicated Components:**
- **Replicated:** `NoteCard`, `EditorView`, `Wikilink` - Lightweight replicas of Tolaria's UI using real design tokens and CSS variables
- **Why:** Avoids Tauri IPC dependencies and heavy editor setup; keeps videos renderable standalone
- **On-Brand:** All replicas use Tolaria's actual color palette, typography, spacing, and border radius from `src/index.css`

## Quick Start

### Installation

This package is isolated from the root pnpm workspace to avoid affecting the main app build.

```bash
cd videos
pnpm install --ignore-workspace
```

### Preview a Clip

```bash
pnpm studio
```

This opens the Remotion Studio where you can preview and scrub through clips.

### Render a Clip

Since this package is isolated from the root workspace, use the local node_modules:

```bash
cd videos
./node_modules/.bin/remotion render wikilink-fan-out output/wikilink-fan-out.mp4
```

Or for still frames:

```bash
cd videos
./node_modules/.bin/remotion still wikilink-fan-out output/frame.png --frame=240
```

## Creating a New Clip

1. **Create the composition** in `src/clips/YourClip.tsx`
2. **Register it** in `src/Root.tsx`:
   ```tsx
   <Composition
     id="your-clip"
     component={YourClip}
     durationInFrames={480}  // 8s @ 60fps
     fps={60}
     width={1920}
     height={1080}
   />
   ```
3. **Preview:** `pnpm studio`
4. **Render:** `pnpm render your-clip output/your-clip.mp4`

## Shared Infrastructure

### Stage Component

Provides the foundational environment:
- Dark background (#09090B by default, matching the reference style)
- Theme context (light/dark CSS variables)
- Safe framing with padding

```tsx
import { Stage } from '../components/Stage';

<Stage theme="dark">
  {/* Your content */}
</Stage>
```

### Timing & Easing

Located in `src/lib/timing.ts`:

- `easeOut(t)` - Strong ease-out curve (exponential-out, similar to cubic-bezier(0.16, 1, 0.3, 1))
- `easeInOut(t)`, `easeIn(t)` - Standard easing curves
- `mapRange(value, inMin, inMax, outMin, outMax, easingFn)` - Map with easing
- `staggerDelay(index, totalDelay, itemCount)` - Calculate micro-stagger for cascading animations

### FLIP Transitions

Located in `src/lib/transitions.ts`:

- `burstOutTransform(startCenter, endPosition, progress, rotation, easingFn)` - Elements exploding from a center point
- `calculateTransform(source, target, progress, easingFn)` - Generic FLIP transform
- `transformToCSS(transform)` - Convert transform object to React styles

## Sample Clip: WikilinkFanOut

**Duration:** 8 seconds @ 60fps (480 frames)

**Story:**
1. Editor fades in with a note
2. Wikilinks appear sequentially as if being typed
3. Editor slides left and scales down
4. Six linked notes burst out from the editor center with staggered timing and subtle rotation
5. Hold on final composition
6. Fade to black

**Timeline:**
- 0-0.75s: Editor fade in
- 0.75-3s: Wikilinks appear sequentially
- 3-4s: Editor scales/slides left
- 3.67-5.17s: Notes burst out (staggered, 0.2s apart)
- 5.17-7.5s: Hold
- 7.5-8s: Fade out

## Rendering Options

```bash
# High quality 1080p60
pnpm render wikilink-fan-out output/clip.mp4 --codec h264 --crf 18

# 4K
pnpm render wikilink-fan-out output/clip-4k.mp4 --scale 2

# Extract frames
pnpm render wikilink-fan-out output/ --sequence

# Preview without encoding
pnpm preview wikilink-fan-out
```

## Design Tokens

The package uses Tolaria's design system. Update `src/styles.css` if design tokens change in the main app.

Key tokens:
- `--surface-app`, `--surface-card` - Background surfaces
- `--text-primary`, `--text-secondary` - Text colors
- `--border-default` - Borders
- `--accent-blue` - Primary accent (wikilinks, highlights)

## CI/CD Isolation

This package is intentionally isolated from the main app build:
- Separate `package.json` and `node_modules`
- Not included in root workspace
- Does not affect main app tests, lint, or build
- `.gitignore` excludes `videos/node_modules/` and `videos/output/`

## Tips

- **Frame rates:** 60fps for smooth motion; 30fps acceptable for simpler clips
- **Duration:** Keep clips 5-10 seconds for social media
- **Easing:** Use `easeOut` for burst/exit animations; `easeInOut` for continuous motion
- **Stagger:** 0.1-0.3s stagger creates organic feel without feeling sluggish
- **Shadows:** Soft drop shadows separate floating elements from background
- **Hold time:** 2-3s final hold lets viewers absorb the composition
