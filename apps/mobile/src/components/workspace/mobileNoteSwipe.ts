export type MobileNoteSwipeAction = 'favorite' | 'archive'
export const mobileNoteSwipeThreshold = 0.68

export function fullSwipeNoteAction(distance: number, width: number): MobileNoteSwipeAction | null {
  'worklet'
  if (width <= 0 || Math.abs(distance) < width * mobileNoteSwipeThreshold) return null
  return distance > 0 ? 'favorite' : 'archive'
}
