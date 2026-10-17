import { MobileToolbarTitle } from '../../ui/MobilePanel'
import { useMobileColors, useMobileMetrics } from '../../ui/theme/useMobileTheme'
import { isMobileMarkdownActionNote } from '../../workspace/mobileNoteActionMode'
import type { MobileNote, MobileTypeDefinitions } from '../../workspace/mobileWorkspaceModel'
import { noteFilename, noteWritePath } from '../../workspace/mobileWorkspacePathRewrites'
import { MobileNoteIcon, MobileTypeIcon } from './MobileWorkspaceIcons'
import { noteTypeColor } from './mobileWorkspaceTone'

type MobileEditorFileIdentityProps = {
  note: MobileNote
  typeDefinitions?: MobileTypeDefinitions
}

export function MobileEditorFileIdentity(props: MobileEditorFileIdentityProps) {
  return (
    <>
      <EditorFileIcon {...props} />
      <MobileToolbarTitle testID="editor-toolbar-title" title={noteFilename(noteWritePath(props.note))} />
    </>
  )
}

function EditorFileIcon({ note, typeDefinitions }: MobileEditorFileIdentityProps) {
  const colors = useMobileColors()
  const { iconSize } = useMobileMetrics().toolbarAction
  if (isMobileMarkdownActionNote(note) && note.icon?.trim()) {
    return (
      <MobileNoteIcon
        color={noteTypeColor(note.typeTone, colors)}
        icon={note.icon}
        size={iconSize}
        testID="editor-toolbar-note-icon"
      />
    )
  }

  return (
    <MobileTypeIcon
      fileKind={note.fileKind}
      size={iconSize}
      tone={note.typeTone}
      type={note.type}
      typeDefinitions={typeDefinitions}
    />
  )
}
