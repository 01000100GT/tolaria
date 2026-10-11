import { createRoot } from 'react-dom/client'
import { EditorContent } from '@tiptap/react'
import { TenTapStartKit, useTenTap } from '@10play/tentap-editor/web'
import { MobileCodeBlockBridge } from './MobileWysiwygCodeBlockBridge'
import { MobileWysiwygContentBridge } from './MobileWysiwygContentBridge'
import { MobileMathInlineBridge } from './MobileWysiwygMathBridge'
import { MobileWysiwygOutlineBridge } from './MobileWysiwygOutlineBridge'
import { MobileTableBridge } from './MobileWysiwygTableBridge'
import { createMobileSlashBridge } from './MobileWysiwygSlashBridge'
import { MobileSlashExtension, readMobileSlash, runMobileSlash } from './MobileWysiwygSlashExtension'
import { createMobileFindBridge } from './MobileWysiwygFindBridge'
import { MobileFindExtension, readMobileFind, applyMobileFindRequest } from './MobileWysiwygFindExtension'

declare global {
  interface Window {
    contentInjected: boolean | undefined
    dynamicHeight?: boolean
  }
}

const mobileTenTapExtensions = [
  ...TenTapStartKit,
  MobileCodeBlockBridge,
  MobileMathInlineBridge,
  MobileWysiwygContentBridge,
  MobileWysiwygOutlineBridge,
  MobileTableBridge,
  createMobileSlashBridge({ extension: MobileSlashExtension, read: readMobileSlash, run: runMobileSlash }),
  createMobileFindBridge({ extension: MobileFindExtension, read: readMobileFind, run: applyMobileFindRequest }),
]

function enabledTenTapExtensions() {
  return mobileTenTapExtensions.filter(
    (extension) => !window.whiteListBridgeExtensions || window.whiteListBridgeExtensions.includes(extension.name),
  )
}

export function MobileWysiwygTenTapEditor() {
  const editor = useTenTap({ bridges: enabledTenTapExtensions() })

  return <EditorContent editor={editor} className={window.dynamicHeight ? 'dynamic-height' : undefined} />
}

function renderWhenInjected() {
  if (!window.contentInjected) {
    window.setTimeout(renderWhenInjected, 1)
    return
  }

  const container = document.getElementById('root')
  if (!container) return

  createRoot(container).render(<MobileWysiwygTenTapEditor />)
}

renderWhenInjected()
