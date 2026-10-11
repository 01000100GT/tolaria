import { ArchiveIcon, Star, Trash } from 'phosphor-react-native'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'
import { mobileText } from '../../i18n/mobileText'
import { mobileColors } from '../../ui/tokens'
import { Button } from '../ui/button'
import { fullSwipeNoteAction } from './mobileNoteSwipe'

type ActionProps = {
  archived?: boolean
  favorite: boolean
  noteId: string
  onArchive: () => void
  onDelete: () => void
  onFavorite: () => void
  side: 'left' | 'right'
  translation: SharedValue<number>
  width: SharedValue<number>
}

export function MobileNoteSwipeActions(props: ActionProps) {
  const left = props.side === 'left'
  const baseWidth = left ? 72 : 144
  const expansion = useAnimatedStyle(() => ({ width: Math.max(baseWidth, Math.abs(props.translation.value)) }))
  const deleteStyle = useAnimatedStyle(() => ({
    width: fullSwipeNoteAction(props.translation.value, props.width.value) === 'archive' ? 0 : 72,
    overflow: 'hidden',
  }))
  return (
    <View style={{ width: baseWidth }}>
      <Animated.View style={[styles.actions, left ? styles.left : styles.right, expansion]}>
        {left ? (
          <Button
            accessibilityLabel={mobileText(props.favorite ? 'editor.toolbar.removeFavorite' : 'editor.toolbar.addFavorite')}
            style={[styles.action, styles.favorite]}
            testID={`note-swipe-favorite-${props.noteId}`}
            onPress={props.onFavorite}
          >
            <Star color={mobileColors.textInverse} size={24} weight={props.favorite ? 'fill' : 'regular'} />
          </Button>
        ) : (
          <>
            <Animated.View style={deleteStyle}>
              <Button accessibilityLabel={mobileText('command.note.deleteNote')} style={[styles.action, styles.delete]} testID={`note-swipe-delete-${props.noteId}`} onPress={props.onDelete}>
                <Trash color={mobileColors.textInverse} size={24} />
              </Button>
            </Animated.View>
            <Button accessibilityLabel={mobileText(props.archived ? 'command.note.unarchiveNote' : 'command.note.archiveNote')} style={[styles.action, styles.archive]} testID={`note-swipe-archive-${props.noteId}`} onPress={props.onArchive}>
              <ArchiveIcon color={mobileColors.textInverse} size={24} />
            </Button>
          </>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { position: 'absolute', top: 0, bottom: 0, flexDirection: 'row' },
  left: { left: 0 },
  right: { right: 0 },
  action: { flex: 1, height: '100%', borderRadius: 0, padding: 0, alignItems: 'center', justifyContent: 'center' },
  favorite: { backgroundColor: mobileColors.primary },
  archive: { backgroundColor: mobileColors.green },
  delete: { backgroundColor: mobileColors.danger },
})
